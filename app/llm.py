"""Thin async client for DeepSeek's OpenAI-compatible API (cloud)."""
from __future__ import annotations

import asyncio
import json
import re
from typing import AsyncIterator

import httpx

from .settings import load as load_settings


class LLMError(RuntimeError):
    pass


def _headers() -> dict:
    key = load_settings()["api_key"]
    if not key:
        raise LLMError("No API key set. Add one in Settings.")
    return {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }


async def complete(
    messages: list[dict],
    *,
    temperature: float = 0.4,
    max_tokens: int = 4000,
    json_mode: bool = False,
    retries: int = 2,
) -> str:
    """Non-streaming completion. Retries transient failures."""
    s = load_settings()
    payload: dict = {
        "model": s["model"],
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    timeout = httpx.Timeout(240.0, connect=20.0, read=240.0)
    last_err: Exception | None = None
    async with httpx.AsyncClient(timeout=timeout) as client:
        for attempt in range(retries + 1):
            try:
                resp = await client.post(
                    f"{s['base_url']}/chat/completions",
                    headers=_headers(),
                    json=payload,
                )
                if resp.status_code >= 400:
                    raise LLMError(f"DeepSeek {resp.status_code}: {resp.text[:400]}")
                data = resp.json()
                return data["choices"][0]["message"]["content"] or ""
            except Exception as exc:  # noqa: BLE001
                last_err = exc
                if attempt < retries:
                    await asyncio.sleep(1.2 * (attempt + 1))
    raise LLMError(f"DeepSeek request failed: {last_err}")


async def stream(
    messages: list[dict],
    *,
    temperature: float = 0.4,
    max_tokens: int = 2500,
) -> AsyncIterator[str]:
    """Yield content deltas from a streaming completion."""
    s = load_settings()
    payload = {
        "model": s["model"],
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True,
    }
    timeout = httpx.Timeout(300.0, connect=20.0, read=300.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        async with client.stream(
            "POST",
            f"{s['base_url']}/chat/completions",
            headers=_headers(),
            json=payload,
        ) as resp:
            if resp.status_code >= 400:
                body = (await resp.aread()).decode("utf-8", "replace")
                raise LLMError(f"DeepSeek {resp.status_code}: {body[:400]}")
            async for line in resp.aiter_lines():
                if not line or not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if data == "[DONE]":
                    break
                try:
                    obj = json.loads(data)
                    delta = obj["choices"][0].get("delta", {}).get("content")
                    if delta:
                        yield delta
                except (KeyError, IndexError, json.JSONDecodeError):
                    continue


def parse_json(text: str) -> dict:
    """Parse JSON from a model response, tolerating code fences and preamble."""
    text = (text or "").strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start >= 0 and end > start:
            return json.loads(text[start : end + 1])
        raise


async def complete_json(messages: list[dict], *, max_tokens: int = 4000, temperature: float = 0.4) -> dict:
    """Completion in JSON mode with one repair retry."""
    raw = await complete(messages, temperature=temperature, max_tokens=max_tokens, json_mode=True)
    try:
        return parse_json(raw)
    except (json.JSONDecodeError, ValueError):
        repair = messages + [
            {"role": "assistant", "content": raw[:6000]},
            {
                "role": "user",
                "content": "That was not valid JSON. Return the same content as strict, valid JSON only. No markdown fences, no commentary.",
            },
        ]
        fixed = await complete(repair, temperature=0.1, max_tokens=max_tokens, json_mode=True)
        return parse_json(fixed)
