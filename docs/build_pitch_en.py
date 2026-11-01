# -*- coding: utf-8 -*-
"""Build the StudyPal English pitch deck (Troy Hackathon 2026 · Track 2).

Reuses the layout helpers and palette from build_pitch.py (the Chinese deck)
and swaps in English copy. Run:

    python docs/build_pitch_en.py

Out:  docs/StudyPal-Pitch-EN.pptx
No secrets are used or read by this script.
"""
from __future__ import annotations

import os
import shutil
import tempfile

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

# Layout helpers + palette come from the Chinese deck so the two stay in sync.
from build_pitch import (  # noqa: F401
    BG, PANEL, PANEL2, BORDER, BORDER_SOFT, TEXT, MUTED, DIM,
    MINT, BLUE, AMBER, RED, PURPLE, WHITE, MINT_DARK, BLUE_DARK,
    YAHEI, MONO, TOTAL,
    set_ea, tb, add_line, simple, shape, panel, chip, logo,
    connector, background, header, footer, notes, bullet_block, image,
    make_glow,
)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "StudyPal-Pitch-EN.pptx")


# ---------------------------------------------------------------- slides
def slide_cover(prs, glow):
    s = background(prs, glow)

    logo(s, 0.86, 0.72, 0.62)
    simple(s, 1.62, 0.79, 4.0, 0.34, "StudyPal", 16.5, TEXT, bold=True)
    simple(s, 1.63, 1.1, 4.4, 0.24, "AI STUDY BUDDY", 8, MUTED, spc=260)

    chip(s, 9.05, 0.78, 2.85, 0.36, "TROY HACKATHON 2026", MUTED,
         fill=PANEL2, border=BORDER, size=8.5)
    simple(s, 9.05, 1.24, 3.5, 0.24, "Track 2 · Language Models · AI Study Pal",
           8.5, DIM)

    simple(s, 0.86, 2.22, 7.6, 0.32, "AI STUDY PAL / BUDDY", 10.5, MINT,
           bold=True, spc=220)
    tf = tb(s, 0.82, 2.55, 7.8, 1.15)
    add_line(tf, True, [("Study", {"color": TEXT}),
                        ("Pal", {"color": MINT})],
             size=68, bold=True, line=0.95)
    simple(s, 0.86, 3.72, 7.6, 0.55,
           "Turn your course materials into a tutor\nthat cites every answer.",
           26, TEXT, bold=True, line=1.2)
    shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.88, 4.92, 2.1, 0.035,
          fill=MINT, line=None, radius=0.5)
    simple(s, 0.86, 5.1, 7.4, 0.66,
           "Not reading for you — making sure you actually learn.\nEvery AI answer links back to the source page.",
           13.5, RGBColor(0xB8, 0xC3, 0xD3), line=1.45)

    chip(s, 0.86, 6.28, 1.8, 0.36, "3-min live demo", MINT, fill=MINT_DARK,
         border=None, size=9.5)
    simple(s, 2.8, 6.34, 5.0, 0.3, "Troy Hackathon 2026 · Track 2", 9, DIM)

    # right: product preview card
    px, py, pw, ph = 8.62, 2.05, 4.05, 3.98
    panel(s, px, py, pw, ph, fill=RGBColor(0x10, 0x16, 0x1E), line=BORDER)
    simple(s, px + 0.24, py + 0.17, 3.3, 0.22,
           "PRODUCT PREVIEW · mock", 7.5, DIM, spc=120)
    for i, c in enumerate([RED, AMBER, MINT]):
        shape(s, MSO_SHAPE.OVAL, px + 2.98 + i * 0.16, py + 0.19, 0.075, 0.075,
              fill=c, line=None)
    shape(s, MSO_SHAPE.RECTANGLE, px + 0.24, py + 0.5, pw - 0.48, 0.01,
          fill=BORDER_SOFT, line=None)

    simple(s, px + 0.24, py + 0.68, pw - 0.48, 0.5,
           "What are the four necessary\nconditions for deadlock?", 9.5,
           RGBColor(0xC5, 0xCF, 0xDD), line=1.3)
    simple(s, px + 0.24, py + 1.32, 2.0, 0.22, "StudyPal", 8.5, MINT, bold=True)
    simple(s, px + 1.05, py + 1.32, 2.6, 0.22,
           "from Operating Systems Midterm Notes", 7.5, DIM)

    tf = tb(s, px + 0.24, py + 1.66, pw - 0.48, 0.8)
    add_line(tf, True, [
        ("All four must hold: mutual exclusion,\nhold-and-wait, no preemption, circular wait ", {"color": TEXT}),
        ("[1]", {"color": MINT, "bold": True}),
    ], size=10.5, line=1.45)

    src = panel(s, px + 0.24, py + 2.38, pw - 0.48, 0.72,
                fill=RGBColor(0x0C, 0x14, 0x1A), line=None, radius=0.09)
    shape(s, MSO_SHAPE.RECTANGLE, px + 0.24, py + 2.5, 0.035, 0.48,
          fill=MINT, line=None)
    simple(s, px + 0.4, py + 2.49, 3.4, 0.22,
           "Operating Systems Midterm Notes", 8.5, RGBColor(0xC5, 0xCF, 0xDD))
    simple(s, px + 0.4, py + 2.73, 3.4, 0.22,
           "p.3 · Mutual exclusion / Hold and wait …", 7.8, DIM)
    simple(s, px + 0.24, py + 3.28, pw - 0.48, 0.26,
           "Click [1]  →  open the source page", 8.5, MINT, bold=True)

    notes(s, "Opening line: StudyPal answers only from the materials you upload, "
             "every claim clicks back to the source, and it loops from Q&A into "
             "'find your weak spots, then review them'. Three minutes end to end.")


def slide_problem(prs, glow):
    s = background(prs, glow)
    header(s, "PROBLEM · Why we need a new tool",
           "AI study assistants stall on three problems",
           "Dropping a PDF into a chat box doesn't make learning happen.")

    cards = [
        ("01", "Answers you can't trust", "Models hallucinate with confidence. Students\ncan't verify, so they won't use it for real work.",
         "So they either copy it blindly, or stop using it.", "Hallucination", RED),
        ("02", "Learned today, gone tomorrow", "'I get it' isn't 'I remember it'. No testing\nor review means knowledge resets to zero.",
         "So every exam becomes a from-scratch cram.", "Forgetting", AMBER),
        ("03", "No clear next step", "Where you're weak, what to review, how to\nbudget your time — all guesswork.",
         "So review becomes re-reading the whole book.", "No direction", BLUE),
    ]
    for i, (num, title, body, outcome, tag, accent) in enumerate(cards):
        x = 0.78 + i * 4.02
        panel(s, x, 1.98, 3.72, 3.5)
        simple(s, x + 0.3, 2.2, 0.8, 0.5, num, 26, accent, bold=True)
        simple(s, x + 0.3, 2.8, 3.1, 0.4, title, 17, TEXT, bold=True)
        simple(s, x + 0.3, 3.28, 3.12, 0.85, body, 10, MUTED, line=1.45)
        shape(s, MSO_SHAPE.RECTANGLE, x + 0.3, 4.08, 3.05, 0.008,
              fill=BORDER_SOFT, line=None)
        simple(s, x + 0.3, 4.2, 3.1, 0.34, outcome, 8.6, DIM, italic=True, line=1.25)
        chip(s, x + 0.3, 4.78, 1.45, 0.32, tag, accent, fill=PANEL2,
             border=BORDER_SOFT, size=8)

    shape(s, MSO_SHAPE.RECTANGLE, 0.8, 5.98, 0.045, 0.5, fill=MINT, line=None)
    simple(s, 1.02, 5.96, 9.0, 0.5,
           "Tools stop at Q&A — learning needs a loop.", 17, TEXT, bold=True)
    simple(s, 9.4, 6.05, 3.2, 0.3,
           "three problems · one loop", 10, DIM, align=PP_ALIGN.RIGHT)
    footer(s, 2)
    notes(s, "Set up the problem: untrustworthy answers, forgetting, and no "
             "direction. These aren't model-quality problems — they're product-shape "
             "problems: Q&A only, with no verification and no review loop.")


def slide_solution(prs, glow):
    s = background(prs, glow)
    header(s, "SOLUTION · The claim",
           "One loop: ask → find weak spots → review them",
           "Not reading for you — making sure you learn, and every answer is verifiable.")

    steps = [
        ("1", "Upload materials", "PDF / PPTX / DOCX / MD\nparsed, chunked, indexed locally", "→ ask within ~30s"),
        ("2", "Cited Q&A", "Every claim carries [n]\nclick back to the source page", "→ every sentence checkable"),
        ("3", "Quizzes + cards", "Auto-generated tests and cards\nanswers graded, self-ratings logged", "→ weak spots visible"),
        ("4", "Profile + plan", "Mastery and gaps,\nplus a 3-hour study plan", "→ next step is clear"),
    ]
    for i, (num, title, body, out) in enumerate(steps):
        x = 0.78 + i * 3.02
        panel(s, x, 2.28, 2.62, 2.02)
        chip(s, x + 0.22, 2.46, 0.34, 0.34, num, MINT, fill=MINT_DARK,
             size=10, radius=0.3)
        simple(s, x + 0.66, 2.49, 1.85, 0.3, title, 12, TEXT, bold=True)
        simple(s, x + 0.22, 3.0, 2.22, 0.95, body, 9, MUTED, line=1.4)
        simple(s, x + 0.22, 3.78, 2.22, 0.25, out, 8.2, MINT)
        if i < 3:
            simple(s, x + 2.66, 3.05, 0.3, 0.35, "→", 17, MINT, bold=True)

    loop = panel(s, 0.78, 4.6, 11.78, 0.52, fill=MINT_DARK, line=None, radius=0.5)
    simple(s, 1.0, 4.7, 11.3, 0.3,
           "↺  The loop: weak spots you find become the next round of practice and flashcards",
           10.5, MINT, bold=True)

    principles = [
        ("Only answer from materials", "no outside knowledge"),
        ("Say \"not found\"", "refuse rather than invent"),
        ("Index stays local", "only snippets reach the model"),
    ]
    for i, (head, sub) in enumerate(principles):
        x = 0.8 + i * 3.95
        simple(s, x, 5.55, 0.24, 0.24, "◆", 7, MINT)
        tf = tb(s, x + 0.3, 5.48, 3.5, 0.6)
        add_line(tf, True, [(head, {"color": TEXT, "bold": True, "size": 11})],
                 size=11)
        add_line(tf, False, [(sub, {"color": DIM, "size": 9.5})], size=9.5,
                 space_before=2)

    simple(s, 0.78, 6.4, 11.7, 0.3,
           "From \"reading\" to \"knowing where you're stuck\" — all in one web page.",
           11, MUTED)
    footer(s, 3)
    notes(s, "One sentence: StudyPal owns verification and the loop. Upload, ask, "
             "quiz, flashcards, profile, plan — all six share the same materials and "
             "mastery data.")


def slide_overview(prs, glow, docs):
    s = background(prs, glow)
    header(s, "PRODUCT · Five modules",
           "One full pipeline in a single web page",
           "Chat is the entry point; the real difference is data shared across materials, quizzes, flashcards and insights.")

    modules = [
        ("M", "Materials", "Upload = indexed; title, summary and topic tags extracted", AMBER),
        ("C", "Chat", "Answers only from materials, every sentence cited to a page", MINT),
        ("P", "Practice", "3–20 multiple choice, instant feedback + explanations, graded", BLUE),
        ("F", "Flashcards", "3D flip, self-rate \"got it / missed it\" → writes to mastery", PURPLE),
        ("I", "Insights", "Mastery, weak spots, 7-day activity and a study plan", MINT),
    ]
    for i, (letter, name, desc, accent) in enumerate(modules):
        y = 1.92 + i * 0.96
        panel(s, 0.78, y, 3.28, 0.86, fill=PANEL, line=BORDER_SOFT, radius=0.09)
        sh = shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.94, y + 0.19, 0.46, 0.46,
                   fill=PANEL2, line=BORDER_SOFT, radius=0.22)
        tfb = sh.text_frame
        tfb.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tfb.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = letter
        r.font.size = Pt(11)
        r.font.bold = True
        r.font.color.rgb = accent
        r.font.name = YAHEI
        simple(s, 1.54, y + 0.14, 2.42, 0.28, name, 12.5, TEXT, bold=True)
        simple(s, 1.54, y + 0.43, 2.44, 0.38, desc, 8.2, MUTED, line=1.2)

    gx, gy, gw, gh = 4.62, 1.9, 3.82, 2.3875
    gap = 0.18
    shots = [
        (docs["materials"], gx, gy, None),
        (docs["chat"], gx + gw + gap, gy, None),
        (docs["quiz"], gx, gy + gh + gap, None),
        (docs["insights"], gx + gw + gap, gy + gh + gap, (0.0, 0.083, 0.0, 0.083)),
    ]
    for path, x, y, crop in shots:
        image(s, path, x, y, gw, gh, crop=crop)

    footer(s, 4)
    notes(s, "Five modules aren't five demos — they share documents, concepts and "
             "mastery. Screenshots: Materials, Chat, Practice, Insights; Flashcards is "
             "shown live by flipping cards.")


def slide_chat(prs, glow, docs):
    s = background(prs, glow)
    header(s, "CORE 01 · CHAT",
           "Every answer links back to the source",
           "Answers aren't \"plausible\" — they're checkable on the spot.")

    image(s, docs["chat"], 0.78, 1.95, 6.15, 3.844)
    simple(s, 0.8, 5.9, 6.1, 0.24,
           "Chat · suggested questions generated from your materials' topics", 8, DIM)

    panel(s, 7.18, 1.95, 5.38, 4.18, fill=PANEL, line=BORDER)
    simple(s, 7.42, 2.12, 4.8, 0.26, "How citations work", 12.5, TEXT, bold=True)
    chip(s, 11.6, 2.08, 0.72, 0.28, "RAG", MINT, fill=MINT_DARK, size=7.5)

    steps = [
        ("01", "Retrieve", "Dense cosine + BM25, fused with RRF → top 6 chunks"),
        ("02", "Constrain", "Prompt only allows the retrieved snippets; force [n] per sentence"),
        ("03", "Verify", "Click a marker → document name, page and source drawer"),
    ]
    for i, (num, title, desc) in enumerate(steps):
        y = 2.52 + i * 0.63
        simple(s, 7.42, y, 0.34, 0.22, num, 8.5, MINT, bold=True)
        simple(s, 7.9, y - 0.02, 1.0, 0.24, title, 10.5, TEXT, bold=True)
        simple(s, 8.85, y - 0.01, 3.5, 0.48, desc, 8.4, MUTED, line=1.28)

    panel(s, 7.42, 4.48, 4.9, 1.5, fill=PANEL2, line=BORDER_SOFT, radius=0.08)
    simple(s, 7.58, 4.58, 1.0, 0.2, "Q", 7.5, MINT, bold=True)
    simple(s, 7.78, 4.58, 3.6, 0.2,
           "What are the four conditions for deadlock?", 8, MUTED)
    simple(s, 11.35, 4.58, 0.8, 0.2, "mock", 7, DIM, align=PP_ALIGN.RIGHT)
    tf = tb(s, 7.58, 4.86, 4.6, 0.52)
    add_line(tf, True, [
        ("Mutual exclusion, hold-and-wait, no preemption, circular wait ", {"color": TEXT}),
        ("[1]", {"color": MINT, "bold": True}),
    ], size=9.5, line=1.35)
    simple(s, 7.58, 5.6, 3.2, 0.22,
           "Operating Systems Notes · p.3", 7.8, MUTED)
    simple(s, 10.15, 5.6, 2.0, 0.22, "open source →", 7.8, MINT,
           bold=True, align=PP_ALIGN.RIGHT)

    panel(s, 0.78, 6.28, 11.78, 0.48, fill=MINT_DARK, line=None, radius=0.5)
    tf = tb(s, 1.0, 6.36, 11.3, 0.3)
    add_line(tf, True, [
        ("Can't find it? We say so: ", {"color": MINT, "bold": True}),
        ("nothing in your materials, no inventing — and we suggest what to upload.", {"color": TEXT}),
    ], size=10.5)

    footer(s, 5)
    notes(s, "The demo isn't about a clever answer — it's about verifiability: click "
             "[1] to open page 3; then ask something not in the materials and watch it "
             "say 'not found'. That's the biggest difference from a generic chatbot.")


def slide_practice(prs, glow, docs):
    s = background(prs, glow)
    header(s, "CORE 02 · PRACTICE + FLASHCARDS",
           "Understanding isn't knowing: quiz, grade, recall",
           "Every answer and self-rating writes back to the same mastery store.")

    image(s, docs["quiz"], 0.78, 1.95, 5.6, 3.5)
    simple(s, 0.8, 5.58, 5.5, 0.24,
           "Practice · scope / count / difficulty / weak-spots only", 8, DIM)

    panel(s, 6.68, 1.95, 5.9, 2.12, fill=PANEL, line=BORDER)
    simple(s, 6.9, 2.1, 3.6, 0.28, "Practice · auto-generated", 12.5, TEXT, bold=True)
    chip(s, 11.05, 2.06, 1.3, 0.3, "3–20 q's", BLUE, fill=BLUE_DARK, size=8)
    bullet_block(s, 6.9, 2.5, 5.45, [
        "3–20 multiple choice, Easy / Medium / Hard",
        "Instant feedback: right/wrong + explanation + source page",
        "Server-side grading; target only your weak concepts",
        "Results page lists weak concepts and wrong answers",
    ], size=9.4, accent=BLUE, gap=7, line=1.28)

    panel(s, 6.68, 4.22, 5.9, 2.12, fill=PANEL, line=BORDER)
    simple(s, 6.9, 4.37, 3.9, 0.28, "Flashcards · active recall", 12.5, TEXT, bold=True)
    chip(s, 11.05, 4.33, 1.3, 0.3, "4–30 cards", PURPLE, fill=PANEL2, size=8)
    bullet_block(s, 6.9, 4.77, 5.45, [
        "4–30 cards, 3D flip; Space to flip, ← / → to self-rate",
        "\"Missed / got it\" writes straight into mastery",
        "Missed concepts surface first in the next deck",
        "Review history persists — run another deck anytime",
    ], size=9.4, accent=PURPLE, gap=7, line=1.28)

    shape(s, MSO_SHAPE.RECTANGLE, 0.8, 6.42, 0.045, 0.36, fill=MINT, line=None)
    simple(s, 1.02, 6.42, 11.3, 0.3,
           "Every question and card traces back to its source — review isn't guesswork.", 11.5, TEXT, bold=True)
    footer(s, 6)
    notes(s, "Quizzing isn't a gimmick, it's measurement: miss two questions and the "
             "weak concept appears immediately. Flashcards are keyboard-driven — flip "
             "three live, and the self-ratings feed the same mastery store.")


def slide_insights(prs, glow, docs):
    s = background(prs, glow)
    header(s, "CORE 03 · INSIGHTS",
           "Knowing what you don't know beats cramming",
           "Mastery is a number earned by quizzes and flashcards — not a feeling.")

    image(s, docs["insights"], 0.78, 1.9, 5.86, 4.395)
    simple(s, 0.8, 6.4, 5.8, 0.24,
           "Insights · mastery / weak spots / 7-day activity / study plan", 8, DIM)

    items = [
        ("Concept mastery", "quizzes + flashcards, accumulated across modules"),
        ("Weak spots", "below 72% → Focus next (17% in the screenshot)"),
        ("Learning rhythm", "7-day activity bars — gaps are visible at a glance"),
        ("Next step", "one-click 3-hour plan, down to specific concepts"),
    ]
    y = 1.98
    for head, body in items:
        shape(s, MSO_SHAPE.OVAL, 6.95, y + 0.09, 0.09, 0.09, fill=MINT, line=None)
        simple(s, 7.2, y, 1.6, 0.26, head, 11.5, TEXT, bold=True)
        simple(s, 8.72, y + 0.02, 3.85, 0.5, body, 9.8, MUTED, line=1.35)
        y += 0.83

    panel(s, 6.95, 5.42, 5.6, 0.94, fill=MINT_DARK, line=None, radius=0.08)
    shape(s, MSO_SHAPE.RECTANGLE, 6.95, 5.55, 0.04, 0.68, fill=MINT, line=None)
    simple(s, 7.18, 5.55, 5.2, 0.66,
           "The loop closes here:\nweak spots become the next round of practice.",
           10.5, TEXT, bold=True, line=1.4)

    footer(s, 7)
    notes(s, "This is the closer: mastery bars, weak spots, seven-day activity, then a "
             "generated 3-hour plan. Show the judges that 'measured' turns directly into "
             "'what to do next'.")


def slide_architecture(prs, glow):
    s = background(prs, glow)
    header(s, "ARCHITECTURE",
           "Retrieval on-device, generation in the cloud",
           "Thousands of chunks with no vector database; a laptop runs the whole demo.")

    cx = 6.665

    b = panel(s, 4.45, 1.82, 4.43, 0.74, fill=PANEL, line=BORDER, radius=0.1)
    simple(s, 4.65, 1.93, 3.6, 0.24, "Browser", 12, TEXT, bold=True)
    simple(s, 4.65, 2.16, 4.1, 0.28,
           "vanilla HTML / CSS / JS · no build · no CDN · fetch + SSE", 8.2, MUTED)

    connector(s, cx, 2.56, cx, 2.84, MINT, 1.2)
    f = panel(s, 4.45, 2.84, 4.43, 0.78, fill=MINT_DARK, line=RGBColor(0x2A, 0x5A, 0x4A), radius=0.1)
    simple(s, 4.65, 2.95, 3.6, 0.24, "FastAPI · single process", 12, TEXT, bold=True)
    simple(s, 4.65, 3.19, 4.0, 0.28,
           "routes / upload / background index / SSE / stats", 8.2, RGBColor(0xA9, 0xD8, 0xC8))

    bus_y = 3.9
    connector(s, cx, 3.62, cx, bus_y, BORDER, 1.2)
    connector(s, 2.565, bus_y, 10.765, bus_y, BORDER, 1.2)
    boxes = [
        (0.79, "SQLite (WAL)", "documents · chunks · FTS5\nquizzes · cards · mastery\nvectors as float32 BLOBs", MINT),
        (4.89, "Ollama · on-device", "nomic-embed-text · 768d\nlocal embeddings, zero cost\nauto-falls back to BM25", BLUE),
        (8.99, "DeepSeek · cloud", "deepseek-flash · 1M ctx\nstreams, no local GPU\nsees only retrieved snippets", PURPLE),
    ]
    for x, title, body, accent in boxes:
        connector(s, x + 1.775, bus_y, x + 1.775, 4.1, BORDER, 1.2)
        panel(s, x, 4.1, 3.55, 1.18, fill=PANEL, line=BORDER_SOFT, radius=0.08)
        shape(s, MSO_SHAPE.RECTANGLE, x, 4.24, 0.035, 0.46, fill=accent, line=None)
        simple(s, x + 0.17, 4.2, 3.2, 0.26, title, 10.2, TEXT, bold=True)
        simple(s, x + 0.17, 4.5, 3.25, 0.74, body, 8.2, MUTED, line=1.38)

    panel(s, 0.78, 5.6, 11.78, 0.98, fill=PANEL2, line=BORDER_SOFT, radius=0.08)
    simple(s, 0.98, 5.7, 3.4, 0.22, "One query's data flow", 7.8, DIM, spc=100)
    tf = tb(s, 0.98, 5.96, 11.4, 0.42)
    parts = [
        ("Query", {"color": TEXT, "bold": True}),
        ("  →  ", {"color": DIM}),
        ("Dense cosine + BM25", {"color": MINT, "bold": True}),
        ("  →  ", {"color": DIM}),
        ("RRF fuse", {"color": MINT, "bold": True}),
        ("  →  ", {"color": DIM}),
        ("Top-6 chunks", {"color": BLUE, "bold": True}),
        ("  →  ", {"color": DIM}),
        ("forced [n] cites", {"color": BLUE, "bold": True}),
        ("  →  ", {"color": DIM}),
        ("SSE stream", {"color": TEXT, "bold": True}),
    ]
    add_line(tf, True, parts, size=10.5, line=1.2)

    simple(s, 0.8, 6.7, 11.6, 0.24,
           "Materials and index never leave the machine; the cloud sees only the retrieved snippets.",
           9, DIM)
    footer(s, 8)
    notes(s, "One sentence: no-build browser, single-process FastAPI, SQLite + FTS5 for "
             "storage, Ollama for local embeddings, DeepSeek in the cloud. Retrieval is "
             "fully local; only the top-6 snippets leave the machine.")


def slide_stack(prs, glow):
    s = background(prs, glow)
    header(s, "STACK",
           "Every choice serves \"demo in 6 hours\"",
           "No Node, no vector database, no local GPU — just a laptop.")

    cols = [(0.78, 1.5), (2.34, 3.55), (5.98, 6.55)]
    headers = ["Layer", "Choice", "Why"]
    for (x, w), h in zip(cols, headers):
        simple(s, x, 1.93, w, 0.24, h, 8.5, DIM, spc=120)
    shape(s, MSO_SHAPE.RECTANGLE, 0.78, 2.2, 11.75, 0.01, fill=BORDER, line=None)

    rows = [
        ("Frontend", "vanilla HTML / CSS / JS SPA", "demo machine has no Node; zero build, zero CDN", AMBER),
        ("Backend", "FastAPI + Uvicorn", "async streaming, type validation, one-file start", MINT),
        ("Storage", "SQLite + FTS5", "single file, zero ops; CJK bigram keeps Chinese searchable", BLUE),
        ("Vectors", "Ollama nomic-embed-text", "local and free; DeepSeek has no embedding endpoint", PURPLE),
        ("Generate", "DeepSeek deepseek-flash", "cloud inference, 1M context, no local GPU", MINT),
        ("Stream", "SSE", "low time-to-first-token, better demo feel", BLUE),
    ]
    y = 2.32
    for i, (layer, choice, why, accent) in enumerate(rows):
        if i % 2 == 0:
            shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.7, y - 0.05, 11.9, 0.66,
                  fill=PANEL2, line=None, radius=0.06)
        shape(s, MSO_SHAPE.RECTANGLE, 0.78, y + 0.13, 0.035, 0.3,
              fill=accent, line=None)
        simple(s, 0.95, y + 0.1, 1.35, 0.3, layer, 10, MUTED, bold=True)
        simple(s, 2.34, y + 0.08, 3.55, 0.3, choice, 10.8, TEXT, bold=True)
        simple(s, 5.98, y + 0.1, 6.35, 0.3, why, 9.6, MUTED)
        y += 0.69

    simple(s, 0.8, 6.55, 11.6, 0.26,
           "Every choice points to the same thing: zero install, zero wait, zero live-demo failures.",
           9.5, DIM)
    footer(s, 9)
    notes(s, "The stack isn't trendy — it's subtraction toward '6 hours, on a laptop, "
             "demoable'. Note: DeepSeek has no embedding endpoint, which is why vectors "
             "run locally on Ollama.")


def slide_privacy(prs, glow):
    s = background(prs, glow)
    header(s, "PRIVACY & ENGINEERING",
           "Demoable, and survives follow-ups",
           "\"Don't crash\" is a feature: privacy is design, not a claim.")

    panel(s, 0.78, 1.95, 5.25, 4.32, fill=PANEL, line=BORDER)
    chip(s, 1.0, 2.12, 1.75, 0.3, "PRIVACY BY DESIGN", MINT, fill=MINT_DARK, size=7.5)
    simple(s, 1.0, 2.55, 4.8, 0.32, "Local-first", 15, TEXT, bold=True)
    bullet_block(s, 1.0, 3.02, 4.75, [
        "Files, chunks, vectors, index — all on-device",
        "Only retrieved snippets are sent to the cloud model",
        "No accounts, no tracking, no external CDN",
        "Ollama down → auto-falls back to pure BM25",
    ], size=9.6, gap=9, line=1.35)
    panel(s, 1.0, 4.62, 4.8, 1.42, fill=PANEL2, line=BORDER_SOFT, radius=0.08)
    simple(s, 1.18, 4.74, 2.0, 0.22, "Data boundary", 7.8, DIM, spc=100)
    shape(s, MSO_SHAPE.OVAL, 1.19, 5.08, 0.09, 0.09, fill=MINT, line=None)
    simple(s, 1.4, 5.0, 4.2, 0.24,
           "On-device: files · chunks · vectors · index", 9, TEXT)
    shape(s, MSO_SHAPE.OVAL, 1.19, 5.48, 0.09, 0.09, fill=BLUE, line=None)
    simple(s, 1.4, 5.4, 4.2, 0.24,
           "Cloud: only the retrieved snippets", 9, TEXT)
    simple(s, 1.18, 5.72, 4.4, 0.24,
           "Materials never leave the machine; the model never sees the whole file.", 7.6, DIM)

    panel(s, 6.35, 1.95, 6.2, 4.32, fill=PANEL, line=BORDER)
    simple(s, 6.57, 2.12, 5.6, 0.3, "Engineering for \"no crashes\"", 13, TEXT, bold=True)
    items = [
        ("Background index", "upload returns instantly; status processing → ready / failed"),
        ("JSON repair retry", "parse failure → repair, then regenerate on fallback"),
        ("Similarity cutoff", "drops recalls below top×0.75 to stop cross-doc bleed"),
        ("Scanned-PDF check", "no text layer → clear error, never a fake success"),
        ("Follow-up rewrite", "\"what about its downsides?\" still hits the context"),
    ]
    y = 2.58
    for head, body in items:
        simple(s, 6.57, y, 1.5, 0.24, head, 9.4, MINT, bold=True)
        simple(s, 8.08, y, 4.3, 0.28, body, 8.8, MUTED)
        y += 0.68

    panel(s, 0.78, 6.44, 11.78, 0.34, fill=PANEL2, line=None, radius=0.5)
    simple(s, 1.0, 6.49, 11.3, 0.24,
           "Current scope: no OCR, no multi-user, no auth — a local study tool; scope is written into the README.",
           8.8, DIM)
    footer(s, 10)
    notes(s, "Volunteer the limits — it scores points: local-first, snippets only, no "
             "accounts. The engineering (background indexing, JSON repair, similarity "
             "cutoff) exists purely for on-stage stability.")


def slide_scoring(prs, glow):
    s = background(prs, glow)
    header(s, "WHY IT SCORES",
           "Every rubric line has an implementation",
           "Not features for their own sake — each item is verifiable live.")

    rows = [
        ("Innovation & Creativity", "20%", "verifiable citations + mastery loop + local-first architecture", MINT),
        ("Technical Excellence", "20%", "dense + BM25 + RRF, SSE, JSON repair retry, background indexing", BLUE),
        ("Functionality & Completeness", "20%", "upload → Q&A → quiz → grade → flashcards → insights → plan, all working", MINT),
        ("Impact & Usefulness", "15%", "solves \"untrustworthy answers\" and \"don't know what to review\"", AMBER),
        ("Teamwork & Collaboration", "15%", "decoupled front/back end + full docs, modules build in parallel", BLUE),
        ("Presentation & Pitch", "10%", "3-min script + real screenshots + live-operable", PURPLE),
    ]
    for (x, w), h in zip([(0.78, 3.4), (4.28, 1.0), (5.42, 7.0)],
                         ["Criterion", "Weight", "Implementation"]):
        simple(s, x, 1.93, w, 0.22, h, 8.5, DIM, spc=120)
    shape(s, MSO_SHAPE.RECTANGLE, 0.78, 2.2, 11.68, 0.01, fill=BORDER, line=None)

    y = 2.34
    for i, (name, weight, impl, accent) in enumerate(rows):
        if i % 2 == 0:
            shape(s, MSO_SHAPE.ROUNDED_RECTANGLE, 0.7, y - 0.04, 11.86, 0.6,
                  fill=PANEL2, line=None, radius=0.06)
        simple(s, 0.82, y + 0.06, 3.3, 0.3, name, 10.2, TEXT, bold=True)
        simple(s, 4.28, y + 0.05, 0.9, 0.3, weight, 12, accent, bold=True)
        simple(s, 5.42, y + 0.07, 6.9, 0.3, impl, 9.2, MUTED)
        y += 0.62

    shape(s, MSO_SHAPE.RECTANGLE, 0.8, 6.24, 0.045, 0.42, fill=MINT, line=None)
    tf = tb(s, 1.02, 6.26, 11.3, 0.4)
    add_line(tf, True, [
        ("Can explain it, and can run it live", {"color": TEXT, "bold": True, "size": 12.5}),
        ("  — that's our definition of \"done\".", {"color": MUTED, "size": 11}),
    ], size=12.5)
    footer(s, 11)
    notes(s, "Judges care most about whether it's actually finished. Map each criterion "
             "to a working feature and stress that every one can be opened and verified — "
             "not adjectives on a slide.")


def slide_demo(prs, glow):
    s = background(prs, glow)
    header(s, "LIVE DEMO · 3 MIN",
           "Three minutes, one full learning loop",
           "Live, not a video; every step has a visible state change.")

    steps = [
        ("0:00", "Materials", "Drag in the OS notes; ~30s to parse, chunk and index locally", AMBER),
        ("0:30", "Chat", "Ask the four deadlock conditions; stream the answer; click [1] → page 3", MINT),
        ("1:00", "Chat", "Ask something not in the materials; it says \"not found\"", MINT),
        ("1:20", "Practice", "Generate 5 Medium questions; miss 2 on purpose; watch weak spots appear", BLUE),
        ("2:10", "Flashcards", "Generate 8 cards; Space to flip, → to mark \"got it\"", PURPLE),
        ("2:40", "Insights", "Mastery updates; generate a 3-hour plan to close", MINT),
    ]
    shape(s, MSO_SHAPE.RECTANGLE, 1.86, 2.0, 0.012, 4.36,
          fill=BORDER, line=None)
    y = 1.92
    for i, (time, name, desc, accent) in enumerate(steps):
        cy = y + 0.26
        shape(s, MSO_SHAPE.OVAL, 1.79, cy - 0.055, 0.15, 0.15,
              fill=accent, line=BG, line_w=2)
        simple(s, 0.78, cy - 0.12, 0.95, 0.24, time, 9.5, accent, bold=True,
               align=PP_ALIGN.RIGHT, font=MONO)
        tf = tb(s, 2.12, y + 0.02, 7.55, 0.55)
        add_line(tf, True, [
            (name + "  ", {"color": TEXT, "bold": True, "size": 11.5}),
            (desc, {"color": MUTED, "size": 9.6}),
        ], size=10.5, line=1.3)
        y += 0.73

    panel(s, 9.95, 1.95, 2.6, 4.2, fill=PANEL, line=BORDER)
    simple(s, 10.15, 2.12, 2.1, 0.26, "Demo prep", 11.5, TEXT, bold=True)
    prep = ["Two real slide decks built in", "Backup recording for offline", "Retrieval works offline; only generation needs net",
            "Rehearse the citation drawer"]
    yy = 2.56
    for item in prep:
        simple(s, 10.15, yy, 0.2, 0.22, "✓", 9, MINT, bold=True)
        simple(s, 10.4, yy, 2.0, 0.55, item, 8.2, MUTED, line=1.3)
        yy += 0.62
    simple(s, 10.15, 5.08, 2.15, 0.24,
           "127.0.0.1:8000", 8, MINT, font=MONO)
    simple(s, 10.15, 5.55, 2.15, 0.4,
           "3:00 closer:\nleave the plan on screen.", 8, DIM, line=1.35)

    panel(s, 0.78, 6.36, 11.78, 0.42, fill=MINT_DARK, line=None, radius=0.5)
    simple(s, 1.0, 6.44, 11.3, 0.26,
           "Closer: from reading to knowing where you're stuck — the whole loop, in one page.",
           9.8, MINT, bold=True)
    footer(s, 12)
    notes(s, "Run it tight: 30s materials, 30s citation, 20s 'not found', 50s quiz, 30s "
             "flashcards, 20s insights + plan. Leave a visible UI state at each step.")


def slide_roadmap(prs, glow):
    s = background(prs, glow)
    header(s, "ROADMAP",
           "From \"demoable\" to \"daily driver\"",
           "Go deep on one loop first, then widen; clear scope makes it credible.")

    cols = [
        ("NOW · shipped", "demoable today", MINT, [
            "Cited Q&A + source drawer",
            "Auto quiz, grading, mastery",
            "Flashcards + review history",
            "Insights profile + 3-hour plan",
            "Local hybrid retrieval",
        ]),
        ("NEXT · 3 months", "go deeper on the loop", BLUE, [
            "OCR for scanned / handwritten notes",
            "SM-2 spaced repetition + missed-question drills",
            "Chinese embeddings (bge-m3)",
            "Export study packs",
            "Per-document card filtering",
        ]),
        ("LATER · a semester", "from personal tool to course tool", PURPLE, [
            "Multi-user + course spaces",
            "Canvas LMS integration",
            "Mobile + offline sync",
            "Exam-risk prediction",
        ]),
    ]
    for i, (label, sub, accent, items) in enumerate(cols):
        x = 0.78 + i * 4.0
        panel(s, x, 1.98, 3.72, 4.18, fill=PANEL, line=BORDER)
        shape(s, MSO_SHAPE.RECTANGLE, x, 2.18, 0.035, 0.5, fill=accent, line=None)
        simple(s, x + 0.24, 2.16, 3.2, 0.22, label, 8.2, accent, bold=True, spc=120)
        simple(s, x + 0.24, 2.42, 3.2, 0.28, sub, 12, TEXT, bold=True)
        shape(s, MSO_SHAPE.RECTANGLE, x + 0.24, 2.86, 3.24, 0.01,
              fill=BORDER_SOFT, line=None)
        yy = 3.02
        for item in items:
            simple(s, x + 0.24, yy, 0.22, 0.22, "·", 11, accent, bold=True)
            simple(s, x + 0.44, yy - 0.01, 3.05, 0.44, item, 9.4, MUTED, line=1.3)
            yy += 0.55

    simple(s, 0.8, 6.42, 11.6, 0.26,
           "Current scope: answers only from uploaded materials; scanned PDFs need OCR first; single-user, local.",
           9, DIM)
    footer(s, 13)
    notes(s, "Three tiers, so it doesn't look like 'we want to do everything'. OCR and "
             "SM-2 are the most valuable next steps — they directly strengthen ingestion "
             "and the review loop.")


def slide_thanks(prs, glow):
    s = background(prs, glow)
    logo(s, 0.9, 0.8, 0.66)
    simple(s, 1.7, 0.88, 4.0, 0.34, "StudyPal", 17, TEXT, bold=True)
    simple(s, 1.71, 1.2, 4.2, 0.24, "AI STUDY BUDDY", 8, MUTED, spc=260)

    simple(s, 0.86, 2.0, 6.0, 1.1, "Thanks", 60, TEXT, bold=True, line=1.0)
    simple(s, 0.9, 3.05, 3.0, 0.34, "Q & A", 16, MINT, bold=True, spc=300)
    simple(s, 0.9, 3.62, 7.0, 0.66,
           "Not reading for you — making sure you actually learn.\nEvery answer has a source.", 15, MUTED, line=1.5)

    panel(s, 0.9, 4.72, 7.2, 0.64, fill=PANEL, line=BORDER, radius=0.18)
    simple(s, 1.1, 4.87, 0.5, 0.24, "↗", 12, MINT, bold=True)
    simple(s, 1.5, 4.84, 6.5, 0.3,
           "github.com/youneedhelp111/Troy-hackthone", 12, TEXT, font=MONO)

    chips = [("Live demo", MINT, MINT_DARK),
             ("Track 2 · Language Models", BLUE, BLUE_DARK),
             ("Troy Hackathon 2026", PURPLE, PANEL)]
    x = 0.9
    widths = [1.15, 2.95, 2.3]
    for (text, color, fill), w in zip(chips, widths):
        chip(s, x, 5.85, w, 0.36, text, color, fill=fill, border=BORDER_SOFT, size=8.8)
        x += w + 0.18

    cx, cy, d = 10.55, 3.55, 2.95
    shape(s, MSO_SHAPE.OVAL, cx - d / 2, cy - d / 2, d, d, fill=None,
          line=BORDER, line_w=1.0)
    shape(s, MSO_SHAPE.OVAL, cx - d / 2 + 0.28, cy - d / 2 + 0.28, d - 0.56, d - 0.56,
          fill=None, line=RGBColor(0x2C, 0x3A, 0x46), line_w=0.75)
    simple(s, cx - 0.62, cy - 0.62, 1.24, 0.9, "[1]", 44, MINT, bold=True,
           align=PP_ALIGN.CENTER)
    simple(s, cx - 0.9, cy + 0.3, 1.8, 0.26, "p.3 · verified", 9, MUTED,
           align=PP_ALIGN.CENTER, spc=80)
    shape(s, MSO_SHAPE.OVAL, cx + d / 2 - 0.18, cy - 0.1, 0.11, 0.11,
          fill=BLUE, line=None)

    footer(s, 14)
    notes(s, "Leave the repo link and Q&A on screen. Close by repeating the positioning "
             "one more time — not reading for you, but making sure you learn, with a "
             "source on every answer.")


def main():
    tmp = tempfile.mkdtemp(prefix="studypal_pitch_en_")
    glow = os.path.join(tmp, "glow.png")
    make_glow(glow)

    docs = {
        "chat": os.path.join(HERE, "chat.png"),
        "materials": os.path.join(HERE, "materials.png"),
        "quiz": os.path.join(HERE, "quiz.png"),
        "insights": os.path.join(HERE, "insights.png"),
    }
    for p in docs.values():
        if not os.path.exists(p):
            raise SystemExit(f"missing screenshot: {p}")

    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    prs.core_properties.title = "StudyPal — AI Study Buddy"
    prs.core_properties.subject = "Troy Hackathon 2026 · Track 2 · Language Models"
    prs.core_properties.author = "StudyPal"
    prs.core_properties.comments = "3-minute pitch / Q&A deck (English)"

    slide_cover(prs, glow)
    slide_problem(prs, glow)
    slide_solution(prs, glow)
    slide_overview(prs, glow, docs)
    slide_chat(prs, glow, docs)
    slide_practice(prs, glow, docs)
    slide_insights(prs, glow, docs)
    slide_architecture(prs, glow)
    slide_stack(prs, glow)
    slide_privacy(prs, glow)
    slide_scoring(prs, glow)
    slide_demo(prs, glow)
    slide_roadmap(prs, glow)
    slide_thanks(prs, glow)

    prs.save(OUT)
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"saved: {OUT}")
    print(f"slides: {len(prs.slides)}")


if __name__ == "__main__":
    main()
