/* ============================================================
   StudyPal SPA — vanilla JS, no build step.
   ============================================================ */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const icons = {
    spark: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.6l2.35 6.05L20.4 11l-6.05 2.35L12 19.4l-2.35-6.05L3.6 11l6.05-2.35L12 2.6z" fill="currentColor"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    volume: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 8.5a5 5 0 0 1 0 7"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/></svg>',
    cards: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="6.5" width="13" height="12" rx="2.5"/><path d="M8 3.5h11a2 2 0 0 1 2 2v9"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-4.5A8 8 0 1 1 21 12z"/></svg>',
    refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    sparkSmall: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="currentColor"/></svg>',
  };

  const VIEWS = ["chat", "materials", "quiz", "cards", "insights"];

  const META = {
    chat: { title: "Chat", sub: "Ask anything about your materials", action: "New chat" },
    materials: { title: "Materials", sub: "Your notes, slides and PDFs — indexed locally", action: "Upload" },
    quiz: { title: "Practice", sub: "Auto-generated questions from your own materials", action: "New quiz" },
    cards: { title: "Flashcards", sub: "Active recall, one card at a time", action: "New deck" },
    insights: { title: "Insights", sub: "Where you stand and what to study next", action: "Refresh" },
  };

  const QUIZ_LINES = [
    "Reading your materials…",
    "Finding testable ideas…",
    "Drafting questions…",
    "Checking every answer against the source…",
  ];
  const CARD_LINES = [
    "Skimming your notes…",
    "Picking the highest-yield ideas…",
    "Writing prompts and answers…",
  ];
  const PLAN_LINES = [
    "Looking at your weak spots…",
    "Ordering topics by impact…",
    "Writing your study plan…",
  ];

  const state = {
    view: "chat",
    docs: [],
    filter: "all",
    health: null,
    suggestions: [],
    messages: [],
    sessionId: null,
    streaming: false,
    abort: null,
    pollTimer: null,
    uploads: [],
    insights: null,
    plan: null,
    planLoading: false,
    rotator: null,
    quiz: {
      setup: { useAll: true, docs: [], count: 8, difficulty: "medium", focusWeak: false },
      active: null,
      index: 0,
      selected: null,
      checked: false,
      answers: [],
      result: null,
      loading: false,
      submitting: false,
    },
    cards: {
      deck: [],
      index: 0,
      flipped: false,
      loading: false,
      busy: false,
      count: 10,
      focusWeak: false,
      stats: { known: 0, again: 0 },
    },
  };

  /* ------------------------------------------------------------ utils */

  function esc(value = "") {
    return String(value).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function inlineMd(line) {
    let out = esc(line);
    const codes = [];
    out = out.replace(/`([^`]+)`/g, (_, code) => {
      codes.push(code);
      return `\u0001${codes.length - 1}\u0001`;
    });
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    out = out.replace(/\[(\d{1,2})\]/g, '<button type="button" class="cite" data-cite="$1" title="View source $1">$1</button>');
    out = out.replace(/\u0001(\d+)\u0001/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
    return out;
  }

  function md(source) {
    if (!source) return "";
    let src = String(source).replace(/\r\n/g, "\n");
    const blocks = [];
    src = src.replace(/```[\w-]*\n([\s\S]*?)```/g, (_, code) => {
      blocks.push(`<pre><code>${esc(code)}</code></pre>`);
      return `\u0000BLOCK${blocks.length - 1}\u0000`;
    });

    const lines = src.split("\n");
    let html = "";
    let list = null;
    let para = [];

    const flushPara = () => {
      if (para.length) {
        html += `<p>${inlineMd(para.join(" "))}</p>`;
        para = [];
      }
    };
    const closeList = () => {
      if (list) {
        html += `</${list}>`;
        list = null;
      }
    };

    for (const rawLine of lines) {
      const line = rawLine;
      const trimmed = line.trim();
      const blockMatch = trimmed.match(/^\u0000BLOCK(\d+)\u0000$/);
      if (blockMatch) {
        flushPara(); closeList();
        html += blocks[Number(blockMatch[1])];
        continue;
      }
      if (!trimmed) { flushPara(); closeList(); continue; }

      const heading = line.match(/^(#{1,4})\s+(.*)$/);
      if (heading) {
        flushPara(); closeList();
        const level = Math.min(4, heading[1].length + 2);
        html += `<h${level}>${inlineMd(heading[2])}</h${level}>`;
        continue;
      }

      const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
      const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
      if (bullet || numbered) {
        flushPara();
        const type = bullet ? "ul" : "ol";
        if (list !== type) { closeList(); html += `<${type}>`; list = type; }
        html += `<li>${inlineMd((bullet || numbered)[1])}</li>`;
        continue;
      }

      if (/^>\s?/.test(trimmed)) {
        flushPara(); closeList();
        html += `<blockquote>${inlineMd(trimmed.replace(/^>\s?/, ""))}</blockquote>`;
        continue;
      }
      if (/^(---|\*\*\*)$/.test(trimmed)) {
        flushPara(); closeList();
        html += "<hr>";
        continue;
      }
      para.push(trimmed);
    }
    flushPara(); closeList();
    return html;
  }

  function stripMd(text) {
    return String(text)
      .replace(/```[\s\S]*?```/g, " code block. ")
      .replace(/[*_`#>\[\]()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatBytes(bytes) {
    const n = Number(bytes) || 0;
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
    return `${(n / 1024 / 1024).toFixed(1)} MB`;
  }

  function hasReadyDocs() {
    return state.docs.some((d) => d.status === "ready");
  }

  function docById(id) {
    return state.docs.find((d) => d.id === id) || null;
  }

  function docTitle(doc) {
    return (doc && (doc.title || doc.filename)) || "Document";
  }

  function scopeLabel() {
    if (state.filter === "all") return "All materials";
    const doc = docById(state.filter);
    return doc ? docTitle(doc) : "All materials";
  }

  let toastTimer = 0;
  function toast(message, type = "ok") {
    const root = $("#toasts");
    const el = document.createElement("div");
    el.className = `toast${type === "error" ? " is-error" : ""}`;
    el.innerHTML = `<span class="ticon">${type === "error" ? icons.x : icons.check}</span><span>${esc(message)}</span>`;
    root.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-out");
      setTimeout(() => el.remove(), 220);
    }, type === "error" ? 5200 : 3200);
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {}, 1000);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied to clipboard");
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("Copied to clipboard");
    }
  }

  /* ------------------------------------------------------------ modal */

  function openModal(html) {
    const root = $("#modal-root");
    root.innerHTML = `
      <div class="modal-backdrop" data-close="1"></div>
      <div class="modal-panel" role="dialog" aria-modal="true">
        <button class="modal-close" type="button" aria-label="Close" data-close="1">${icons.x}</button>
        ${html}
      </div>`;
    root.classList.add("is-open");
  }

  function closeModal() {
    const root = $("#modal-root");
    root.classList.remove("is-open");
    root.innerHTML = "";
  }

  function openSourceModal(source) {
    if (!source) return;
    const doc = source.doc_id ? docById(source.doc_id) : null;
    openModal(`
      <div class="modal-kicker">${source.n ? `Source ${source.n} · ` : ""}p.${esc(source.page || 1)}</div>
      <div class="modal-title">${esc(source.doc_title || "Source")}</div>
      <div class="modal-sub">${doc ? `${esc((doc.kind || "file").toUpperCase())} · ${doc.pages || 0} pages · ${doc.chunk_count || 0} chunks` : "From your materials"}</div>
      <div class="modal-snippet">${esc(source.snippet || "")}</div>
      ${source.doc_id ? `<div class="row" style="margin-top:16px;justify-content:flex-end"><button class="btn btn-sm" data-scope-doc="${esc(source.doc_id)}">Ask only this document</button></div>` : ""}
    `);
  }

  /* ------------------------------------------------------------ API */

  async function api(path, options = {}) {
    const opts = { ...options };
    opts.headers = { ...(options.headers || {}) };
    if (opts.body && !(opts.body instanceof FormData)) {
      opts.headers["Content-Type"] = "application/json";
    }
    const res = await fetch(path, opts);
    if (!res.ok) {
      let detail = `${res.status} ${res.statusText}`;
      try {
        const data = await res.json();
        detail = data.detail || detail;
      } catch (_) { /* ignore */ }
      throw new Error(detail);
    }
    if (res.status === 204) return null;
    return res.json();
  }

  async function loadHealth() {
    const pill = $("#health-pill");
    const label = $("#health-text");
    try {
      const health = await api("/api/health");
      state.health = health;
      const ready = health.embedding_ready;
      pill.classList.toggle("is-ok", ready);
      pill.classList.toggle("is-bad", !ready);
      label.textContent = ready ? "AI ready" : "Keyword search only";
      pill.title = `LLM: ${health.llm_model} · Embeddings: ${health.embed_model || "BM25"} · ${health.documents} docs / ${health.chunks} chunks`;
    } catch (_) {
      state.health = null;
      pill.classList.remove("is-ok");
      pill.classList.add("is-bad");
      label.textContent = "Backend offline";
    }
  }

  async function loadDocs() {
    try {
      const data = await api("/api/documents");
      state.docs = data.documents || [];
      if (state.filter !== "all") {
        const current = docById(state.filter);
        if (!current || current.status !== "ready") state.filter = "all";
      }
      renderSideDocs();
      renderFilterOptions();
      updateScopeUI();
      if (state.view === "materials") renderMaterials();
      if (state.view === "quiz" && !state.quiz.loading && !state.quiz.active) renderQuiz();
      if (state.view === "cards" && !state.cards.loading && !state.cards.deck.length) renderCards();
    } catch (_) {
      /* backend offline: keep last known state */
    }
  }

  function startPolling() {
    if (state.pollTimer) return;
    state.pollTimer = setInterval(async () => {
      await loadDocs();
      if (!state.docs.some((d) => d.status === "processing")) {
        clearInterval(state.pollTimer);
        state.pollTimer = null;
        loadSuggestions();
        loadInsights(true);
      }
    }, 1600);
  }

  async function loadSuggestions() {
    try {
      const data = await api("/api/suggestions");
      state.suggestions = data.suggestions || [];
      if (state.view === "chat" && !state.messages.length) renderChat();
    } catch (_) { /* ignore */ }
  }

  /* ------------------------------------------------------------ shell */

  function renderSideDocs() {
    const box = $("#side-docs");
    if (!state.docs.length) {
      box.innerHTML = '<div class="side-empty">No materials yet</div>';
    } else {
      box.innerHTML = state.docs.slice(0, 12).map((doc) => `
        <button class="side-doc${state.filter === doc.id ? " is-scope" : ""}" data-doc="${esc(doc.id)}" data-status="${esc(doc.status)}" title="${esc(docTitle(doc))}">
          <span class="sdot"></span>
          <span class="stitle">${esc(docTitle(doc))}</span>
        </button>`).join("");
    }
    $("#doc-count").textContent = String(state.docs.length);
  }

  function renderFilterOptions() {
    const select = $("#doc-filter");
    const ready = state.docs.filter((d) => d.status === "ready");
    select.innerHTML = '<option value="all">All materials</option>' +
      ready.map((d) => `<option value="${esc(d.id)}">${esc(docTitle(d))}</option>`).join("");
    select.value = state.filter;
  }

  function updateScopeUI() {
    const label = scopeLabel();
    const chip = $("#scope-chip");
    if (chip) chip.textContent = label;
    const select = $("#doc-filter");
    if (select) select.value = state.filter;
    $$(".side-doc").forEach((btn) => btn.classList.toggle("is-scope", btn.dataset.doc === state.filter));
  }

  function setFilter(docId) {
    state.filter = docId || "all";
    updateScopeUI();
    renderSideDocs();
  }

  function setView(view, opts = {}) {
    if (!VIEWS.includes(view)) view = "chat";
    state.view = view;
    $$(".nav-item").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.view === view));
    $$(".view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === view));
    updateTopbar();
    if (!opts.skipHash) {
      const hash = `#${view}`;
      if (location.hash !== hash) history.replaceState(null, "", hash);
    }
    if (view === "chat") {
      renderChat();
      scrollToBottom(true);
      setTimeout(() => $("#chat-input") && $("#chat-input").focus(), 60);
    } else if (view === "materials") {
      renderMaterials();
    } else if (view === "quiz") {
      renderQuiz();
    } else if (view === "cards") {
      renderCards();
    } else if (view === "insights") {
      renderInsights();
      if (!state.insights) loadInsights();
    }
  }

  function updateTopbar() {
    const meta = META[state.view];
    $("#page-title").textContent = meta.title;
    $("#page-sub").textContent = meta.sub;
    $("#top-action-label").textContent = meta.action;
    $("#history-btn").style.display = state.view === "chat" ? "inline-flex" : "none";
    const scope = $(".scope-select");
    if (scope) scope.style.display = state.view === "chat" ? "flex" : "none";
  }

  function newChat() {
    state.sessionId = null;
    state.messages = [];
    renderChat();
    const input = $("#chat-input");
    if (input) { input.value = ""; autoGrow(); input.focus(); }
  }

  /* ------------------------------------------------------------ chat */

  function defaultSuggestions() {
    return [
      "Explain the key idea in my notes",
      "Compare two important concepts",
      "Give me a worked example",
      "What is most likely to be on the exam?",
    ];
  }

  function welcomeHTML() {
    const ready = hasReadyDocs();
    const suggestions = state.suggestions.length ? state.suggestions : defaultSuggestions();
    return `
      <div class="welcome">
        <div class="welcome-mark">${icons.spark}</div>
        <h2>${ready ? "Study smarter, not longer" : "Turn your notes into a tutor"}</h2>
        <p>${ready
          ? "Ask questions about your own course materials. Every answer cites the exact page so you can check it."
          : "Upload your lecture notes, slides or a PDF. StudyPal indexes them locally, then answers with page-level citations."}</p>
        <div class="suggestions">
          ${suggestions.slice(0, 4).map((text, i) => `
            <button class="suggestion" type="button" data-suggestion="${i}">
              <span class="sic">${[icons.chat, icons.target, icons.cards, icons.sparkSmall][i % 4]}</span>
              <span>${esc(text)}</span>
            </button>`).join("")}
        </div>
        <div class="welcome-note"><span class="lock">${icons.lock}</span>${ready
          ? "Your files stay on this machine. Answers are grounded in your materials."
          : "Local index · cloud reasoning · no account needed"}</div>
      </div>`;
  }

  function sourcesHTML(sources, idx) {
    if (!sources.length) return "";
    return `
      <div class="sources" data-idx="${idx}">
        <button type="button" class="sources-toggle">${icons.chevron} ${sources.length} source${sources.length > 1 ? "s" : ""}
          <span class="badge">cited</span>
        </button>
        <div class="source-grid">
          ${sources.map((s) => `
            <button type="button" class="source-card" data-idx="${idx}" data-n="${esc(s.n)}">
              <div class="sc-top">[${esc(s.n)}] <span class="pg">p.${esc(s.page)}</span></div>
              <div class="sc-title">${esc(s.doc_title || "Source")}</div>
              <div class="sc-snip">${esc(s.snippet || "")}</div>
            </button>`).join("")}
        </div>
      </div>`;
  }

  function messageHTML(msg, idx) {
    const isUser = msg.role === "user";
    const body = msg.content
      ? (isUser ? esc(msg.content).replace(/\n/g, "<br>") : md(msg.content))
      : (msg.streaming ? '<span class="faint">Thinking…</span>' : "");
    return `
      <div class="msg ${isUser ? "user" : "assistant"}" data-idx="${idx}">
        ${isUser ? "" : `<div class="msg-avatar">${icons.spark}</div>`}
        <div class="msg-col">
          ${isUser ? "" : '<div class="msg-meta">StudyPal</div>'}
          <div class="msg-body">${body}${msg.streaming ? '<span class="stream-cursor"></span>' : ""}</div>
          ${!isUser && msg.sources && msg.sources.length ? sourcesHTML(msg.sources, idx) : ""}
          ${!isUser && !msg.streaming && msg.content ? `
            <div class="msg-actions">
              <button type="button" class="msg-action" data-action="copy" data-idx="${idx}">${icons.copy} Copy</button>
              <button type="button" class="msg-action" data-action="speak" data-idx="${idx}">${icons.volume} Read aloud</button>
            </div>` : ""}
        </div>
      </div>`;
  }

  function renderChat() {
    const box = $("#chat-messages");
    if (!state.messages.length) {
      box.innerHTML = welcomeHTML();
      return;
    }
    box.innerHTML = state.messages.map((m, i) => messageHTML(m, i)).join("");
  }

  function isNearBottom() {
    const el = $("#chat-scroll");
    return el.scrollHeight - el.scrollTop - el.clientHeight < 160;
  }

  function scrollToBottom(force = false) {
    const el = $("#chat-scroll");
    if (!el) return;
    if (force || isNearBottom()) el.scrollTop = el.scrollHeight;
  }

  let streamTimer = null;
  function scheduleStreamUpdate(idx) {
    if (streamTimer) return;
    streamTimer = setTimeout(() => {
      streamTimer = null;
      const msg = state.messages[idx];
      const body = document.querySelector(`.msg[data-idx="${idx}"] .msg-body`);
      if (!msg || !body) return;
      const near = isNearBottom();
      body.innerHTML = md(msg.content || "") + (msg.streaming ? '<span class="stream-cursor"></span>' : "");
      if (near) scrollToBottom();
    }, 45);
  }

  async function readSSE(body, onEvent) {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let idx;
      while ((idx = buffer.indexOf("\n\n")) >= 0) {
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        let event = "message";
        let data = "";
        for (const line of block.split("\n")) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          else if (line.startsWith("data:")) data += line.slice(5).trim();
        }
        if (!data) continue;
        try { onEvent(event, JSON.parse(data)); } catch (_) { /* ignore malformed frame */ }
      }
    }
  }

  async function sendMessage(text) {
    const message = (text || "").trim();
    if (!message || state.streaming) return;

    const docIds = state.filter === "all" ? null : [state.filter];
    state.messages.push({ role: "user", content: message, sources: [] });
    state.messages.push({ role: "assistant", content: "", sources: [], streaming: true });
    const aiIdx = state.messages.length - 1;

    state.streaming = true;
    renderChat();
    updateSendButton();
    scrollToBottom(true);

    const controller = new AbortController();
    state.abort = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, session_id: state.sessionId, doc_ids: docIds }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        let detail = "Chat failed";
        try { detail = (await res.json()).detail || detail; } catch (_) { /* ignore */ }
        throw new Error(detail);
      }

      await readSSE(res.body, (event, data) => {
        const ai = state.messages[aiIdx];
        if (event === "meta") {
          state.sessionId = data.session_id;
          ai.sources = data.sources || [];
        } else if (event === "delta") {
          ai.content += data.text;
          scheduleStreamUpdate(aiIdx);
        } else if (event === "error") {
          ai.error = true;
          toast(data.message || "The AI service hiccuped", "error");
        } else if (event === "done") {
          if (data.sources) ai.sources = data.sources;
        }
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        const ai = state.messages[aiIdx];
        ai.error = true;
        ai.content = ai.content || `Something went wrong: ${err.message}`;
        toast(err.message, "error");
      }
    } finally {
      const ai = state.messages[aiIdx];
      ai.streaming = false;
      if (!ai.content && !ai.error) ai.content = "I couldn't produce an answer. Try again.";
      state.streaming = false;
      state.abort = null;
      renderChat();
      updateSendButton();
      scrollToBottom();
      loadSuggestions();
      loadInsights(true);
    }
  }

  function updateSendButton() {
    const btn = $("#send-btn");
    if (!btn) return;
    if (state.streaming) {
      btn.classList.add("is-stop");
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="1.5"/></svg>';
      btn.title = "Stop generating";
      btn.setAttribute("aria-label", "Stop generating");
    } else {
      btn.classList.remove("is-stop");
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
      btn.title = "Send (Enter)";
      btn.setAttribute("aria-label", "Send");
    }
  }

  function autoGrow() {
    const input = $("#chat-input");
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
  }

  async function openHistory() {
    let sessions = [];
    try {
      sessions = (await api("/api/sessions")).sessions || [];
    } catch (err) {
      toast(err.message, "error");
      return;
    }
    openModal(`
      <div class="modal-kicker">Chat history</div>
      <div class="modal-title">Recent sessions</div>
      <div class="modal-sub">${sessions.length ? "Pick up where you left off." : "No conversations yet."}</div>
      <div class="session-list">
        ${sessions.map((s) => `
          <button class="session-item" type="button" data-session="${esc(s.id)}">
            <span class="si-icon">${icons.chat}</span>
            <span class="si-title">${esc(s.title || "Untitled")}</span>
            <span class="si-count">${s.messages} msg</span>
          </button>`).join("")}
      </div>
    `);
  }

  async function openSession(id) {
    try {
      const data = await api(`/api/sessions/${encodeURIComponent(id)}`);
      state.sessionId = id;
      state.messages = (data.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
        sources: m.sources || [],
      }));
      closeModal();
      setView("chat");
      renderChat();
      scrollToBottom(true);
    } catch (err) {
      toast(err.message, "error");
    }
  }

  /* ------------------------------------------------------------ materials */

  function statusLabel(status) {
    return status === "ready" ? "Ready" : status === "failed" ? "Failed" : "Indexing";
  }

  function docCardHTML(doc) {
    const ready = doc.status === "ready";
    const kind = (doc.kind || "doc").toLowerCase();
    const concepts = (doc.concepts || []).slice(0, 4);
    const extra = Math.max(0, (doc.concepts || []).length - 4);
    const pageWord = kind === "pptx" ? "slides" : "pages";
    return `
      <article class="doc-card is-${esc(doc.status)}" data-id="${esc(doc.id)}">
        <div class="doc-top">
          <div class="doc-icon ${esc(kind)}">${esc(kind.toUpperCase().slice(0, 4))}</div>
          <div class="grow" style="min-width:0">
            <div class="doc-title">${esc(docTitle(doc))}</div>
            <div class="doc-file">${esc(doc.filename)}</div>
          </div>
          <span class="doc-status ${esc(doc.status)}">${statusLabel(doc.status)}</span>
        </div>
        <div class="doc-stats">
          ${doc.pages ? `<span><b>${doc.pages}</b> ${pageWord}</span>` : ""}
          <span><b>${doc.chunk_count || 0}</b> chunks</span>
          <span>${formatBytes(doc.size)}</span>
        </div>
        ${concepts.length ? `<div class="doc-concepts">${concepts.map((c) => `<span class="concept">${esc(c)}</span>`).join("")}${extra ? `<span class="concept more">+${extra}</span>` : ""}</div>` : ""}
        ${doc.summary ? `<div class="doc-summary">${esc(doc.summary)}</div>` : ""}
        ${doc.status === "processing" ? '<div class="progress-track"><i></i></div>' : ""}
        ${doc.status === "failed" ? `<div class="doc-error">${esc(doc.error || "Processing failed. Try re-uploading.")}</div>` : ""}
        <div class="doc-actions">
          <button class="btn btn-sm" type="button" data-doc-action="ask" data-id="${esc(doc.id)}" ${ready ? "" : "disabled"}>Ask</button>
          <button class="btn btn-sm" type="button" data-doc-action="practice" data-id="${esc(doc.id)}" ${ready ? "" : "disabled"}>Practice</button>
          <button class="btn btn-sm btn-icon" type="button" data-doc-action="delete" data-id="${esc(doc.id)}" title="Delete" aria-label="Delete">${icons.trash}</button>
        </div>
      </article>`;
  }

  function howItWorksHTML() {
    return `
      <div class="stat-grid" style="margin-top:22px">
        <div class="stat-card"><div class="sv">01</div><div class="sl">Upload</div><div class="sd">Drop in PDFs, slides or notes.</div></div>
        <div class="stat-card"><div class="sv">02</div><div class="sl">Auto-index</div><div class="sd">Parsed, chunked and searched locally.</div></div>
        <div class="stat-card"><div class="sv">03</div><div class="sl">Ask &amp; cite</div><div class="sd">Every answer links back to the page.</div></div>
      </div>`;
  }

  function uploadQueueHTML() {
    return state.uploads.map((u) => `
      <div class="uq-item ${u.error ? "is-error" : ""}" data-uq="${esc(u.id)}">
        <span class="uq-name">${esc(u.name)}</span>
        <span class="tiny faint">${u.error ? esc(u.error) : `${u.pct}%`}</span>
        <span class="uq-bar"><i style="width:${u.pct}%"></i></span>
      </div>`).join("");
  }

  function renderMaterials() {
    const box = $("#materials-body");
    box.innerHTML = `
      <div class="mat-head">
        <div>
          <h2 class="section-title">Your materials</h2>
          <p class="section-sub">PDF, slides and notes are parsed, chunked and indexed on this machine.</p>
        </div>
        <button class="btn btn-primary" type="button" id="mat-upload">${icons.plus} Upload files</button>
      </div>
      <div class="dropzone" id="dropzone" tabindex="0" role="button" aria-label="Upload files">
        <div class="dz-icon">${icons.upload}</div>
        <div class="dz-title">Drop files here, or click to browse</div>
        <div class="dz-sub">Up to 40 MB each · multiple files supported</div>
        <div class="dz-types"><span class="dz-type">PDF</span><span class="dz-type">PPTX</span><span class="dz-type">DOCX</span><span class="dz-type">TXT</span><span class="dz-type">MD</span><span class="dz-type">CSV</span></div>
        <input type="file" id="file-input" multiple hidden accept=".pdf,.pptx,.docx,.txt,.md,.markdown,.csv">
      </div>
      <div id="upload-queue" class="upload-queue">${uploadQueueHTML()}</div>
      ${state.docs.length
        ? `<div class="doc-grid">${state.docs.map(docCardHTML).join("")}</div>`
        : howItWorksHTML()}
    `;
  }

  function uploadFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const id = `u${Date.now()}`;
    state.uploads.push({ id, name: files.length > 1 ? `${files.length} files` : files[0].name, pct: 0, error: "" });
    const queue = $("#upload-queue");
    if (queue) queue.innerHTML = uploadQueueHTML();

    const form = new FormData();
    files.forEach((f) => form.append("files", f));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/documents");
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      const upload = state.uploads.find((u) => u.id === id);
      if (!upload) return;
      upload.pct = Math.max(1, Math.round((event.loaded / event.total) * 100));
      const bar = document.querySelector(`[data-uq="${id}"] .uq-bar i`);
      const label = document.querySelector(`[data-uq="${id}"] .tiny`);
      if (bar) bar.style.width = `${upload.pct}%`;
      if (label) label.textContent = `${upload.pct}%`;
    };
    xhr.onload = () => {
      const upload = state.uploads.find((u) => u.id === id);
      if (xhr.status >= 200 && xhr.status < 300) {
        if (upload) upload.pct = 100;
        toast(files.length > 1 ? `${files.length} files uploaded — indexing` : `${files[0].name} uploaded — indexing`);
        loadDocs();
        startPolling();
        setTimeout(() => {
          state.uploads = state.uploads.filter((u) => u.id !== id);
          const q = $("#upload-queue");
          if (q) q.innerHTML = uploadQueueHTML();
        }, 1400);
      } else {
        let detail = "Upload failed";
        try { detail = JSON.parse(xhr.responseText).detail || detail; } catch (_) { /* ignore */ }
        if (upload) { upload.error = detail; upload.pct = 0; }
        const q = $("#upload-queue");
        if (q) q.innerHTML = uploadQueueHTML();
        toast(detail, "error");
      }
    };
    xhr.onerror = () => {
      const upload = state.uploads.find((u) => u.id === id);
      if (upload) upload.error = "Network error";
      const q = $("#upload-queue");
      if (q) q.innerHTML = uploadQueueHTML();
      toast("Upload failed — is the server running?", "error");
    };
    xhr.send(form);
  }

  async function deleteDoc(id) {
    const doc = docById(id);
    if (!doc) return;
    if (!confirm(`Delete "${docTitle(doc)}"? This removes its index.`)) return;
    try {
      await api(`/api/documents/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (state.filter === id) state.filter = "all";
      toast("Document deleted");
      await loadDocs();
      loadSuggestions();
      loadInsights(true);
    } catch (err) {
      toast(err.message, "error");
    }
  }

  function askAboutDoc(id) {
    const doc = docById(id);
    setFilter(id);
    newChat();
    setView("chat");
    const input = $("#chat-input");
    if (input && doc) {
      input.value = `What are the key ideas in "${docTitle(doc)}"?`;
      autoGrow();
      input.focus();
    }
  }

  function practiceDoc(id) {
    state.quiz.setup.useAll = false;
    state.quiz.setup.docs = [id];
    resetQuiz();
    setView("quiz");
  }

  /* ------------------------------------------------------------ loading */

  function stopRotator() {
    if (state.rotator) {
      clearInterval(state.rotator);
      state.rotator = null;
    }
  }

  function loadingHTML(title, lines) {
    return `
      <div class="loading-layer">
        <div class="orbit"><span class="ring"></span><span class="ring"></span><span class="core"></span><span class="sat"></span><span class="sat b"></span></div>
        <div class="loading-text">${esc(title)}</div>
        <div class="loading-sub" id="loading-sub">${esc(lines[0] || "")}</div>
      </div>`;
  }

  function startRotator(lines) {
    stopRotator();
    let i = 0;
    state.rotator = setInterval(() => {
      i = (i + 1) % lines.length;
      const el = $("#loading-sub");
      if (el) el.textContent = lines[i];
    }, 2200);
  }

  /* ------------------------------------------------------------ quiz */

  function resetQuiz() {
    const q = state.quiz;
    q.active = null;
    q.result = null;
    q.index = 0;
    q.selected = null;
    q.checked = false;
    q.answers = [];
    q.loading = false;
    q.submitting = false;
  }

  function renderQuiz() {
    const q = state.quiz;
    const box = $("#quiz-body");
    if (q.loading) {
      box.innerHTML = loadingHTML("Building your quiz", QUIZ_LINES);
      startRotator(QUIZ_LINES);
      return;
    }
    stopRotator();
    if (q.result) { renderQuizResult(); return; }
    if (q.active) { renderQuizQuestion(); return; }
    renderQuizSetup();
  }

  function renderQuizSetup() {
    const s = state.quiz.setup;
    const box = $("#quiz-body");
    const ready = state.docs.filter((d) => d.status === "ready");
    if (!ready.length) {
      box.innerHTML = `
        <div class="empty-state">
          <div class="es-icon">${icons.target}</div>
          <h3>No materials to practise yet</h3>
          <p>Upload lecture notes or a PDF first. StudyPal writes questions from your own material, not the internet.</p>
          <button class="btn btn-primary" type="button" data-quiz-go="materials">${icons.upload} Upload materials</button>
        </div>`;
      return;
    }

    const weak = (state.insights && state.insights.weak) || [];
    box.innerHTML = `
      <div class="quiz-setup">
        <div class="panel setup-panel">
          <div class="setup-title">Build a quiz</div>
          <div class="setup-sub">Questions are generated only from your uploaded materials, with the source page attached to every answer.</div>

          <div class="field">
            <div class="field-label"><span>Scope</span><span class="field-hint">${ready.length} document${ready.length > 1 ? "s" : ""}</span></div>
            <div class="chip-row">
              <button class="chip ${s.useAll ? "is-on" : ""}" type="button" data-qdoc="all"><span class="cdot"></span>All materials</button>
              ${ready.map((d) => `<button class="chip ${!s.useAll && s.docs.includes(d.id) ? "is-on" : ""}" type="button" data-qdoc="${esc(d.id)}"><span class="cdot"></span>${esc(docTitle(d))}</button>`).join("")}
            </div>
          </div>

          <div class="field">
            <div class="field-label"><span>Questions</span></div>
            <div class="seg">
              ${[5, 8, 10].map((n) => `<button type="button" class="${s.count === n ? "is-on" : ""}" data-qcount="${n}">${n}</button>`).join("")}
            </div>
          </div>

          <div class="field">
            <div class="field-label"><span>Difficulty</span></div>
            <div class="seg">
              <button type="button" class="${s.difficulty === "easy" ? "is-on" : ""}" data-qdiff="easy">Easy</button>
              <button type="button" class="${s.difficulty === "medium" ? "is-on accent" : ""}" data-qdiff="medium">Medium</button>
              <button type="button" class="${s.difficulty === "hard" ? "is-on" : ""}" data-qdiff="hard">Hard</button>
            </div>
          </div>

          <div class="field">
            <label class="check-row">
              <input type="checkbox" id="q-focus-weak" ${s.focusWeak ? "checked" : ""}>
              <span>
                <span class="cr-title">Focus on my weak spots</span>
                <span class="cr-sub">${weak.length ? weak.slice(0, 3).map((w) => w.concept).join(" · ") : "Take a quiz first to build your mastery map"}</span>
              </span>
            </label>
          </div>

          <div class="generate-row">
            <button class="btn btn-primary btn-lg" type="button" data-quiz-go="generate">${icons.spark} Generate quiz</button>
            <span class="tiny faint">Takes 20–40 seconds. Every question is checked against your sources.</span>
          </div>
        </div>
      </div>`;
  }

  function renderQuizQuestion() {
    const q = state.quiz;
    const qq = q.active.questions[q.index];
    const checked = q.checked;
    const isLast = q.index === q.active.questions.length - 1;
    const box = $("#quiz-body");
    const optionsHTML = qq.options.map((opt, i) => {
      let cls = "option";
      if (checked) {
        if (i === qq.answer_index) cls += " is-correct";
        else if (i === q.selected) cls += " is-wrong";
        else cls += " is-dim";
      } else if (i === q.selected) {
        cls += " is-selected";
      }
      return `<button type="button" class="${cls}" data-opt="${i}" ${checked ? "disabled" : ""}>
        <span class="okey">${"ABCD"[i]}</span><span>${esc(opt)}</span>
      </button>`;
    }).join("");

    const ok = checked && q.selected === qq.answer_index;
    const feedback = checked ? `
      <div class="feedback ${ok ? "" : "bad"}">
        <div class="fb-head">${ok ? icons.check : icons.x} ${ok ? "Correct" : "Not quite"}</div>
        <div class="fb-text">${esc(qq.explanation || "No explanation provided.")}</div>
        <div class="fb-source">${icons.book}<span><b>${esc(qq.source.doc_title)}</b> · p.${esc(qq.source.page)}</span>
          <button class="btn btn-sm btn-ghost" type="button" data-quiz-src="${q.index}">View source</button>
        </div>
      </div>` : "";

    box.innerHTML = `
      <div class="quiz-run">
        <div class="quiz-top">
          <span class="quiz-count">Question <b>${q.index + 1}</b> of <b>${qq_total()}</b></span>
          <span class="quiz-progress"><i style="width:${((q.index + (checked ? 1 : 0)) / qq_total()) * 100}%"></i></span>
          <button class="btn btn-sm btn-ghost" type="button" data-quiz-go="exit">Exit</button>
        </div>
        <div class="question-card panel">
          <div class="q-concept">${icons.sparkSmall} ${esc(qq.concept || "Concept")}</div>
          <div class="q-text">${esc(qq.question)}</div>
          <div class="options">${optionsHTML}</div>
          ${feedback}
          <div class="quiz-next">
            ${checked
              ? `<button class="btn btn-primary" type="button" data-quiz-go="${isLast ? "submit" : "next"}" ${q.submitting ? "disabled" : ""}>${q.submitting ? 'Scoring…' : (isLast ? "See results" : "Next question")}</button>`
              : `<button class="btn btn-primary" type="button" data-quiz-go="check" ${q.selected == null ? "disabled" : ""}>Check answer</button>`}
          </div>
        </div>
        <div class="tiny faint" style="text-align:center;margin-top:14px">Keys 1–4 select · Enter confirms</div>
      </div>`;
  }

  function qq_total() {
    return state.quiz.active ? state.quiz.active.questions.length : 0;
  }

  function selectOption(i) {
    const q = state.quiz;
    if (!q.active || q.checked || i == null) return;
    if (i < 0 || i >= q.active.questions[q.index].options.length) return;
    q.selected = i;
    renderQuizQuestion();
  }

  function checkAnswer() {
    const q = state.quiz;
    if (!q.active || q.checked || q.selected == null) return;
    q.checked = true;
    q.answers[q.index] = q.selected;
    renderQuizQuestion();
  }

  async function nextQuestion() {
    const q = state.quiz;
    if (!q.active) return;
    if (q.index < q.active.questions.length - 1) {
      q.index += 1;
      q.selected = null;
      q.checked = false;
      renderQuizQuestion();
    } else {
      await submitQuiz();
    }
  }

  async function submitQuiz() {
    const q = state.quiz;
    if (!q.active || q.submitting) return;
    q.submitting = true;
    renderQuizQuestion();
    try {
      const ref = q.active.questions[q.index];
      if (q.selected != null) q.answers[q.index] = q.selected;
      const data = await api(`/api/quiz/${encodeURIComponent(q.active.id)}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers: q.answers }),
      });
      q.result = data;
      q.submitting = false;
      renderQuiz();
      loadInsights(true);
    } catch (err) {
      q.submitting = false;
      renderQuizQuestion();
      toast(err.message, "error");
    }
  }

  function scoreTitle(percent) {
    if (percent >= 85) return "Excellent work";
    if (percent >= 70) return "Solid understanding";
    if (percent >= 50) return "Getting there";
    return "Worth another pass";
  }

  function renderQuizResult() {
    const q = state.quiz;
    const r = q.result;
    const questions = q.active.questions;
    const pct = r.percent;
    const circumference = 2 * Math.PI * 68;
    const offset = circumference * (1 - pct / 100);
    const wrong = r.results.filter((x) => !x.correct);
    const box = $("#quiz-body");

    box.innerHTML = `
      <div class="result-wrap">
        <div class="score-ring">
          <svg width="168" height="168" viewBox="0 0 168 168">
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#6ee7b7"/><stop offset="1" stop-color="#60a5fa"/>
              </linearGradient>
            </defs>
            <circle class="track" cx="84" cy="84" r="68" fill="none" stroke-width="9"/>
            <circle class="fill" cx="84" cy="84" r="68" fill="none" stroke-width="9"
              stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${circumference.toFixed(1)}"
              style="stroke-dashoffset:${offset.toFixed(1)}"/>
          </svg>
          <div class="score-value"><b>${pct}%</b><span>score</span></div>
        </div>
        <div class="result-title">${scoreTitle(pct)}</div>
        <div class="result-sub">${wrong.length
          ? `You're solid on most of it. ${wrong.length} question${wrong.length > 1 ? "s" : ""} need another look.`
          : "Every answer was correct. Try hard mode to stretch further."}</div>
        <div class="result-stats">
          <span><b>${r.score}</b> correct</span>
          <span><b>${r.total - r.score}</b> to review</span>
          <span><b>${r.total}</b> total</span>
        </div>
        ${r.weak_concepts.length ? `<div class="result-weak">${r.weak_concepts.map((c) => `<span class="concept">${esc(c)}</span>`).join("")}</div>` : ""}
        <div class="result-actions">
          <button class="btn" type="button" data-res="review" ${wrong.length ? "" : "disabled"}>${icons.book} Review mistakes</button>
          <button class="btn" type="button" data-res="cards">${icons.cards} Generate flashcards</button>
          <button class="btn btn-primary" type="button" data-res="again">${icons.target} New quiz</button>
        </div>
        ${wrong.length ? `
          <div class="review-list">
            ${r.results.map((res, i) => {
              const qq = questions[i];
              return `<details class="review-item ${res.correct ? "is-correct" : ""}">
                <summary><span class="ri-mark">${res.correct ? "✓" : "×"}</span><span>${esc(qq.question)}</span></summary>
                <div class="review-body">
                  <div class="rb-row">Your answer: <b class="${res.correct ? "good" : "bad"}">${res.selected != null ? esc(qq.options[res.selected]) : "—"}</b></div>
                  ${res.correct ? "" : `<div class="rb-row">Correct answer: <b class="good">${esc(qq.options[res.answer_index])}</b></div>`}
                  <div class="rb-row">${esc(qq.explanation || "")}</div>
                  <div class="rb-row faint">Source: ${esc(qq.source.doc_title)} · p.${esc(qq.source.page)}</div>
                </div>
              </details>`;
            }).join("")}
          </div>` : ""}
      </div>`;
  }

  async function generateQuiz(focusOverride) {
    const q = state.quiz;
    const s = q.setup;
    if (!hasReadyDocs()) {
      toast("Upload materials first", "error");
      return;
    }
    if (q.loading) return;
    q.loading = true;
    q.active = null;
    q.result = null;
    renderQuiz();

    const focus = focusOverride || (s.focusWeak && state.insights ? (state.insights.weak || []).map((w) => w.concept) : null);
    try {
      const data = await api("/api/quiz/generate", {
        method: "POST",
        body: JSON.stringify({
          doc_ids: s.useAll ? null : s.docs,
          count: s.count,
          difficulty: s.difficulty,
          focus: focus && focus.length ? focus : null,
        }),
      });
      q.active = data;
      q.index = 0;
      q.answers = new Array(data.questions.length).fill(null);
      q.selected = null;
      q.checked = false;
      q.result = null;
      q.loading = false;
      stopRotator();
      renderQuiz();
    } catch (err) {
      q.loading = false;
      stopRotator();
      renderQuiz();
      toast(err.message, "error");
    }
  }

  /* ------------------------------------------------------------ flashcards */

  function renderCards() {
    const c = state.cards;
    const box = $("#cards-body");
    if (c.loading) {
      box.innerHTML = loadingHTML("Building your deck", CARD_LINES);
      startRotator(CARD_LINES);
      return;
    }
    stopRotator();

    if (c.deck.length && c.index >= c.deck.length) {
      const total = c.deck.length;
      const known = c.stats.known;
      const pct = Math.round((known / Math.max(1, total)) * 100);
      box.innerHTML = `
        <div class="fc-shell">
          <div class="fc-done">
            <div class="done-icon">${icons.check}</div>
            <h3>Deck complete</h3>
            <p>You marked <b style="color:var(--mint)">${known}</b> of ${total} cards as known (${pct}%).</p>
            <div class="result-actions">
              <button class="btn" type="button" data-fc="new">${icons.plus} New deck</button>
              <button class="btn" type="button" data-fc="weak">${icons.target} Weak spots</button>
              <button class="btn btn-primary" type="button" data-fc="insights">${icons.chart} See insights</button>
            </div>
          </div>
        </div>`;
      return;
    }

    if (c.deck.length) {
      const card = c.deck[c.index];
      box.innerHTML = `
        <div class="fc-shell">
          <div class="fc-top">
            <div class="fc-progress">Card <b>${c.index + 1}</b> of <b>${c.deck.length}</b></div>
            <div class="row">
              <span class="tiny faint">${esc(card.concept || "")}</span>
              <button class="btn btn-sm btn-ghost" type="button" data-fc="exit">Exit deck</button>
            </div>
          </div>
          <div class="fc-scene" id="fc-scene" role="button" tabindex="0" aria-label="Flip card">
            <div class="fc-card${c.flipped ? " is-flipped" : ""}" data-fc-card>
              <div class="fc-face fc-front">
                <div class="fc-tag">${esc(card.concept || "Concept")}</div>
                <div class="fc-side">Prompt</div>
                <div class="fc-front-text">${esc(card.front)}</div>
                <div class="fc-hint">Click or press Space to flip</div>
              </div>
              <div class="fc-face fc-back">
                <div class="fc-tag">${esc(card.concept || "Answer")}</div>
                <div class="fc-side">Answer</div>
                <div class="fc-back-text">${esc(card.back)}</div>
                <div class="fc-hint">${esc(card.doc_title || "")}${card.page ? ` · p.${esc(card.page)}` : ""}</div>
              </div>
            </div>
          </div>
          <div class="fc-controls">
            <button class="btn fc-again" type="button" data-fc="again" ${c.busy ? "disabled" : ""}>← Again</button>
            <button class="btn fc-known" type="button" data-fc="known" ${c.busy ? "disabled" : ""}>Got it →</button>
          </div>
          <div class="fc-tip">Space flips · ← Again · → Got it</div>
        </div>`;
      return;
    }

    const weak = (state.insights && state.insights.weak) || [];
    box.innerHTML = `
      <div class="fc-empty">
        <div class="panel setup-panel">
          <div class="setup-title">Build a flashcard deck</div>
          <div class="setup-sub">Active recall beats re-reading. Cards are generated from your materials and graded into your mastery map.</div>
          ${hasReadyDocs() ? `
            <div class="field">
              <div class="field-label"><span>Cards</span></div>
              <div class="seg">${[8, 10, 15].map((n) => `<button type="button" class="${c.count === n ? "is-on" : ""}" data-fcount="${n}">${n}</button>`).join("")}</div>
            </div>
            <div class="field">
              <label class="check-row">
                <input type="checkbox" id="fc-focus-weak" ${c.focusWeak ? "checked" : ""}>
                <span><span class="cr-title">Focus on weak concepts</span>
                <span class="cr-sub">${weak.length ? weak.slice(0, 3).map((w) => w.concept).join(" · ") : "Take a quiz first to build your mastery map"}</span></span>
              </label>
            </div>
            <div class="generate-row">
              <button class="btn btn-primary btn-lg" type="button" data-fc="generate">${icons.spark} Generate deck</button>
              <button class="btn" type="button" data-fc="saved">Review saved cards</button>
            </div>` : `
            <div class="empty-state" style="padding:40px 10px 20px">
              <div class="es-icon">${icons.cards}</div>
              <h3>No materials yet</h3>
              <p>Upload a PDF or your lecture slides first, then generate a deck.</p>
              <button class="btn btn-primary" type="button" data-fc="materials">${icons.upload} Upload materials</button>
            </div>`}
        </div>
      </div>`;
  }

  function flipCard() {
    const c = state.cards;
    if (!c.deck.length || c.index >= c.deck.length) return;
    c.flipped = !c.flipped;
    const el = $("[data-fc-card]");
    if (el) el.classList.toggle("is-flipped", c.flipped);
  }

  async function gradeCard(known) {
    const c = state.cards;
    if (!c.deck.length || c.index >= c.deck.length || c.busy) return;
    const card = c.deck[c.index];
    c.busy = true;
    try {
      await api("/api/flashcards/review", {
        method: "POST",
        body: JSON.stringify({ flashcard_id: card.id, known }),
      });
      if (known) c.stats.known += 1; else c.stats.again += 1;
    } catch (err) {
      toast(err.message, "error");
    }
    c.busy = false;
    c.index += 1;
    c.flipped = false;
    renderCards();
    loadInsights(true);
  }

  async function generateCards(focusOverride) {
    const c = state.cards;
    if (!hasReadyDocs()) {
      toast("Upload materials first", "error");
      return;
    }
    if (c.loading) return;
    c.loading = true;
    renderCards();
    const focus = focusOverride || (c.focusWeak && state.insights ? (state.insights.weak || []).map((w) => w.concept) : null);
    try {
      const data = await api("/api/flashcards/generate", {
        method: "POST",
        body: JSON.stringify({
          doc_ids: state.filter === "all" ? null : [state.filter],
          count: c.count,
          focus: focus && focus.length ? focus : null,
        }),
      });
      c.deck = data.cards || [];
      c.index = 0;
      c.flipped = false;
      c.stats = { known: 0, again: 0 };
      c.loading = false;
      stopRotator();
      renderCards();
    } catch (err) {
      c.loading = false;
      stopRotator();
      renderCards();
      toast(err.message, "error");
    }
  }

  async function reviewSavedCards() {
    try {
      const data = await api("/api/flashcards?limit=15");
      const cards = (data.flashcards || []).map((f) => ({
        id: f.id,
        front: f.front,
        back: f.back,
        concept: f.concept,
        doc_title: f.doc_title || "Saved card",
        page: null,
      }));
      if (!cards.length) {
        toast("No saved cards yet — generate a deck first", "error");
        return;
      }
      const c = state.cards;
      c.deck = cards;
      c.index = 0;
      c.flipped = false;
      c.stats = { known: 0, again: 0 };
      renderCards();
    } catch (err) {
      toast(err.message, "error");
    }
  }

  /* ------------------------------------------------------------ insights */

  async function loadInsights(force = false) {
    try {
      const data = await api("/api/analytics");
      state.insights = data;
      if (state.view === "insights") renderInsights();
      // Quiz / flashcard setup shows weak-topic hints; refresh them once data lands.
      if (state.view === "quiz" && !state.quiz.active && !state.quiz.loading) renderQuiz();
      if (state.view === "cards" && !state.cards.deck.length && !state.cards.loading) renderCards();
    } catch (_) {
      /* ignore */
    }
  }

  function renderInsights() {
    const box = $("#insights-body");
    const data = state.insights;
    if (!data) {
      box.innerHTML = loadingHTML("Reading your progress", ["Crunching quiz results…"]);
      startRotator(["Crunching quiz results…"]);
      return;
    }
    stopRotator();

    if (!data.documents.length) {
      box.innerHTML = `
        <div class="empty-state">
          <div class="es-icon">${icons.chart}</div>
          <h3>Your mastery map starts with a document</h3>
          <p>Upload your course materials, ask a few questions, and take one quiz. Insights will fill in from there.</p>
          <button class="btn btn-primary" type="button" data-ins="upload">${icons.upload} Upload materials</button>
        </div>`;
      return;
    }

    const s = data.stats;
    const maxActivity = Math.max(1, ...data.activity.map((a) => Math.max(a.quiz, a.cards, a.chat)));
    const masteryRows = data.mastery.length
      ? data.mastery.map((m) => {
          const pct = Math.round(m.percent * 100);
          const tone = pct >= 72 ? "high" : pct >= 50 ? "mid" : "low";
          return `<div class="mastery-row">
            <div class="mr-top"><span class="mr-name">${esc(m.concept)}</span><span class="mr-pct">${pct}% · ${m.total} attempt${m.total === 1 ? "" : "s"}</span></div>
            <div class="mastery-bar"><i class="${tone}" style="width:${Math.max(4, pct)}%"></i></div>
          </div>`;
        }).join("")
      : `<div class="tiny faint" style="padding:18px 0">Take a quiz or review flashcards to build your mastery map.</div>`;

    const weak = data.weak || [];
    const recs = data.recommendations || [];

    box.innerHTML = `
      <div class="row-between" style="margin-bottom:20px">
        <div>
          <h2 class="section-title">Insights</h2>
          <p class="section-sub">What you've covered, what stuck, and what to do next.</p>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat-card"><div class="sv">${s.documents}</div><div class="sl">Materials</div><div class="sd">${s.chunks} indexed chunks</div></div>
        <div class="stat-card"><div class="sv">${s.questions_answered}</div><div class="sl">Questions answered</div><div class="sd">${s.quizzes} quiz${s.quizzes === 1 ? "" : "zes"} generated</div></div>
        <div class="stat-card"><div class="sv">${s.accuracy}%</div><div class="sl">Quiz accuracy</div><div class="sd">across all attempts</div></div>
        <div class="stat-card"><div class="sv">${s.card_reviews}</div><div class="sl">Card reviews</div><div class="sd">${s.flashcards} cards in your decks</div></div>
      </div>

      <div class="insights-grid">
        <div class="panel">
          <div class="panel-head"><div><h2>Concept mastery</h2><p>Smoothed accuracy from quizzes and flashcards</p></div></div>
          <div class="mastery-list">${masteryRows}</div>
        </div>
        <div class="panel">
          <div class="panel-head"><div><h2>Focus next</h2><p>Based on what you've missed</p></div></div>
          <div class="rec-list">
            ${recs.slice(0, 4).map((r) => `
              <div class="rec-card">
                <div class="rc-title"><span class="rc-dot"></span>${esc(r.title)}</div>
                <div class="rc-body">${esc(r.body)}</div>
              </div>`).join("")}
          </div>
          ${weak.length ? `
            <div class="row" style="margin-top:16px;flex-wrap:wrap">
              <button class="btn btn-sm btn-primary" type="button" data-ins="weak-quiz">${icons.target} Quiz weak spots</button>
              <button class="btn btn-sm" type="button" data-ins="weak-cards">${icons.cards} Flashcards</button>
            </div>` : ""}
        </div>
      </div>

      <div class="panel activity-card">
        <div class="panel-head" style="margin-bottom:4px">
          <div><h2>This week</h2><p>Quiz attempts · flashcard reviews · questions asked</p></div>
          <span class="tiny faint">${data.activity.reduce((sum, a) => sum + a.total, 0)} actions</span>
        </div>
        <div class="activity-chart">
          ${data.activity.map((a) => `
            <div class="act-col">
              <div class="act-bars" title="${a.total} actions">
                <i class="quiz" style="height:${a.quiz ? Math.max(6, (a.quiz / maxActivity) * 100) : 2}%"></i>
                <i class="cards" style="height:${a.cards ? Math.max(6, (a.cards / maxActivity) * 100) : 2}%"></i>
                <i class="chat" style="height:${a.chat ? Math.max(6, (a.chat / maxActivity) * 100) : 2}%"></i>
              </div>
              <span class="act-label">${esc(a.label)}</span>
            </div>`).join("")}
        </div>
      </div>

      ${state.plan ? `
        <div class="plan-box">
          <div class="row-between" style="margin-bottom:10px">
            <div class="row"><span class="tiny" style="color:var(--mint);letter-spacing:.08em;text-transform:uppercase;font-weight:650">AI study plan</span></div>
            <div class="plan-actions" style="margin:0">
              <button class="btn btn-sm" type="button" data-ins="plan-copy">${icons.copy} Copy</button>
              <button class="btn btn-sm" type="button" data-ins="plan">${icons.refresh} Regenerate</button>
            </div>
          </div>
          <div class="md">${md(state.plan)}</div>
        </div>` : `
        <div class="plan-box">
          <div class="row-between">
            <div>
              <div style="font-size:14px;font-weight:620">Turn this into a plan</div>
              <div class="tiny faint" style="margin-top:4px">${weak.length ? `Prioritising ${weak.slice(0, 2).map((w) => w.concept).join(" and ")}` : "A 3-hour plan built from your materials"}</div>
            </div>
            <button class="btn btn-primary" type="button" data-ins="plan" ${state.planLoading ? "disabled" : ""}>${state.planLoading ? '<span class="spinner"></span> Writing…' : `${icons.spark} Generate 3-hour plan`}</button>
          </div>
        </div>`}
    `;
  }

  async function generatePlan() {
    if (state.planLoading) return;
    state.planLoading = true;
    renderInsights();
    try {
      const data = await api("/api/study-plan", { method: "POST", body: JSON.stringify({}) });
      state.plan = data.plan;
      toast("Study plan ready");
    } catch (err) {
      toast(err.message, "error");
    }
    state.planLoading = false;
    renderInsights();
  }

  function weakConcepts() {
    return state.insights ? (state.insights.weak || []).map((w) => w.concept) : [];
  }

  /* ------------------------------------------------------------ events */

  function bindEvents() {
    $$(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => setView(btn.dataset.view));
    });

    $("#doc-filter").addEventListener("change", (event) => {
      setFilter(event.target.value);
    });

    $("#history-btn").addEventListener("click", openHistory);

    $("#top-action").addEventListener("click", () => {
      if (state.view === "chat") {
        newChat();
      } else if (state.view === "materials") {
        setView("materials");
        renderMaterials();
        setTimeout(() => { const input = $("#file-input"); if (input) input.click(); }, 30);
      } else if (state.view === "quiz") {
        resetQuiz();
        renderQuiz();
      } else if (state.view === "cards") {
        if (state.cards.deck.length && state.cards.index < state.cards.deck.length) {
          if (!confirm("Leave this deck and build a new one?")) return;
        }
        state.cards.deck = [];
        state.cards.index = 0;
        state.cards.stats = { known: 0, again: 0 };
        state.cards.loading = false;
        renderCards();
      } else if (state.view === "insights") {
        loadInsights(true);
        toast("Insights refreshed");
      }
    });

    // Chat form
    const form = $("#chat-form");
    const input = $("#chat-input");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (state.streaming) {
        if (state.abort) state.abort.abort();
        return;
      }
      const text = input.value;
      input.value = "";
      autoGrow();
      sendMessage(text);
    });
    input.addEventListener("input", autoGrow);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (state.streaming) return;
        const text = input.value;
        input.value = "";
        autoGrow();
        sendMessage(text);
      }
    });

    // Chat messages delegation
    $("#chat-messages").addEventListener("click", (event) => {
      const suggestion = event.target.closest("[data-suggestion]");
      if (suggestion) {
        const idx = Number(suggestion.dataset.suggestion);
        if (!hasReadyDocs()) {
          setView("materials");
          return;
        }
        const text = (state.suggestions.length ? state.suggestions : defaultSuggestions())[idx];
        if (text) {
          input.value = "";
          sendMessage(text);
        }
        return;
      }
      const cite = event.target.closest("[data-cite]");
      if (cite) {
        const msgEl = cite.closest(".msg");
        const msg = msgEl ? state.messages[Number(msgEl.dataset.idx)] : null;
        if (msg) {
          const src = (msg.sources || []).find((s) => String(s.n) === cite.dataset.cite);
          if (src) openSourceModal(src);
        }
        return;
      }
      const card = event.target.closest(".source-card");
      if (card) {
        const msg = state.messages[Number(card.dataset.idx)] || null;
        const src = msg ? (msg.sources || []).find((s) => String(s.n) === card.dataset.n) : null;
        if (src) openSourceModal(src);
        return;
      }
      const toggle = event.target.closest(".sources-toggle");
      if (toggle) {
        const wrap = toggle.closest(".sources");
        if (wrap) wrap.classList.toggle("is-open");
        return;
      }
      const action = event.target.closest("[data-action]");
      if (action && action.dataset.idx != null) {
        const msg = state.messages[Number(action.dataset.idx)];
        if (!msg) return;
        if (action.dataset.action === "copy") copyText(msg.content);
        if (action.dataset.action === "speak") {
          if (!("speechSynthesis" in window)) { toast("Speech is not available", "error"); return; }
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(stripMd(msg.content));
          utterance.rate = 1.03;
          window.speechSynthesis.speak(utterance);
        }
      }
    });

    // Materials delegation
    const materials = $("#materials-body");
    materials.addEventListener("click", (event) => {
      const docAction = event.target.closest("[data-doc-action]");
      if (docAction) {
        const id = docAction.dataset.id;
        const action = docAction.dataset.docAction;
        if (action === "ask") askAboutDoc(id);
        if (action === "practice") practiceDoc(id);
        if (action === "delete") deleteDoc(id);
        return;
      }
      if (event.target.closest("#mat-upload") || (event.target.closest("#dropzone") && !event.target.closest("#file-input"))) {
        const fileInput = $("#file-input");
        if (fileInput) fileInput.click();
      }
    });
    materials.addEventListener("change", (event) => {
      if (event.target.id === "file-input") {
        uploadFiles(event.target.files);
        event.target.value = "";
      }
    });
    materials.addEventListener("keydown", (event) => {
      if (event.target.closest("#dropzone") && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        const fileInput = $("#file-input");
        if (fileInput) fileInput.click();
      }
    });
    materials.addEventListener("dragover", (event) => {
      const zone = event.target.closest("#dropzone");
      if (!zone) return;
      event.preventDefault();
      zone.classList.add("is-drag");
    });
    materials.addEventListener("dragleave", (event) => {
      const zone = event.target.closest("#dropzone");
      if (zone && !zone.contains(event.relatedTarget)) zone.classList.remove("is-drag");
    });
    materials.addEventListener("drop", (event) => {
      const zone = event.target.closest("#dropzone");
      if (!zone) return;
      event.preventDefault();
      zone.classList.remove("is-drag");
      uploadFiles(event.dataTransfer.files);
    });

    // Quiz delegation
    const quiz = $("#quiz-body");
    quiz.addEventListener("click", (event) => {
      const go = event.target.closest("[data-quiz-go]");
      if (go) {
        const action = go.dataset.quizGo;
        if (action === "materials") { setView("materials"); return; }
        if (action === "generate") { generateQuiz(); return; }
        if (action === "exit") { if (confirm("Leave this quiz? Progress will be lost.")) { resetQuiz(); renderQuiz(); } return; }
        if (action === "check") { checkAnswer(); return; }
        if (action === "next") { nextQuestion(); return; }
        if (action === "submit") { submitQuiz(); return; }
      }
      const qdoc = event.target.closest("[data-qdoc]");
      if (qdoc) {
        const id = qdoc.dataset.qdoc;
        const s = state.quiz.setup;
        if (id === "all") {
          s.useAll = true;
          s.docs = [];
        } else if (s.useAll) {
          s.useAll = false;
          s.docs = [id];
        } else if (s.docs.includes(id)) {
          s.docs = s.docs.filter((d) => d !== id);
          if (!s.docs.length) s.useAll = true;
        } else {
          s.docs.push(id);
        }
        renderQuizSetup();
        return;
      }
      const qcount = event.target.closest("[data-qcount]");
      if (qcount) { state.quiz.setup.count = Number(qcount.dataset.qcount); renderQuizSetup(); return; }
      const qdiff = event.target.closest("[data-qdiff]");
      if (qdiff) { state.quiz.setup.difficulty = qdiff.dataset.qdiff; renderQuizSetup(); return; }
      const opt = event.target.closest("[data-opt]");
      if (opt) { selectOption(Number(opt.dataset.opt)); return; }
      const src = event.target.closest("[data-quiz-src]");
      if (src) {
        const qq = state.quiz.active.questions[Number(src.dataset.quizSrc)];
        if (qq) openSourceModal({ ...qq.source, n: null });
        return;
      }
      const res = event.target.closest("[data-res]");
      if (res) {
        const action = res.dataset.res;
        if (action === "review") {
          const list = $(".review-list");
          if (list) list.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        if (action === "cards") {
          const weak = (state.quiz.result && state.quiz.result.weak_concepts) || [];
          state.cards.deck = [];
          state.cards.index = 0;
          setView("cards");
          generateCards(weak.length ? weak : null);
          return;
        }
        if (action === "again") {
          resetQuiz();
          renderQuiz();
          return;
        }
      }
    });
    quiz.addEventListener("change", (event) => {
      if (event.target.id === "q-focus-weak") {
        state.quiz.setup.focusWeak = event.target.checked;
      }
    });

    // Flashcards delegation
    const cards = $("#cards-body");
    cards.addEventListener("click", (event) => {
      if (event.target.closest("#fc-scene")) { flipCard(); return; }
      const fc = event.target.closest("[data-fc]");
      if (!fc) return;
      const action = fc.dataset.fc;
      if (action === "exit") { if (confirm("Leave this deck?")) { state.cards.deck = []; state.cards.index = 0; renderCards(); } return; }
      if (action === "again") { gradeCard(false); return; }
      if (action === "known") { gradeCard(true); return; }
      if (action === "generate") { generateCards(); return; }
      if (action === "saved") { reviewSavedCards(); return; }
      if (action === "new") { state.cards.deck = []; state.cards.index = 0; state.cards.stats = { known: 0, again: 0 }; renderCards(); return; }
      if (action === "weak") {
        const weak = weakConcepts();
        if (!weak.length) { toast("No weak concepts yet — take a quiz first", "error"); return; }
        generateCards(weak);
        return;
      }
      if (action === "insights") { setView("insights"); return; }
      if (action === "materials") { setView("materials"); return; }
    });
    cards.addEventListener("change", (event) => {
      if (event.target.id === "fc-focus-weak") state.cards.focusWeak = event.target.checked;
    });

    // Count segmented control for cards
    cards.addEventListener("click", (event) => {
      const count = event.target.closest("[data-fcount]");
      if (count) {
        state.cards.count = Number(count.dataset.fcount);
        renderCards();
      }
    });

    // Insights delegation
    const insights = $("#insights-body");
    insights.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-ins]");
      if (!btn) return;
      const action = btn.dataset.ins;
      if (action === "upload") { setView("materials"); return; }
      if (action === "refresh") { loadInsights(true); toast("Insights refreshed"); return; }
      if (action === "plan") { generatePlan(); return; }
      if (action === "plan-copy") { if (state.plan) copyText(state.plan); return; }
      if (action === "weak-quiz") {
        state.quiz.setup.useAll = true;
        state.quiz.setup.focusWeak = true;
        resetQuiz();
        setView("quiz");
        generateQuiz(weakConcepts());
        return;
      }
      if (action === "weak-cards") {
        const weak = weakConcepts();
        setView("cards");
        if (weak.length) generateCards(weak);
        return;
      }
    });

    // Modal delegation
    $("#modal-root").addEventListener("click", (event) => {
      if (event.target.closest("[data-close]")) { closeModal(); return; }
      const session = event.target.closest("[data-session]");
      if (session) { openSession(session.dataset.session); return; }
      const scope = event.target.closest("[data-scope-doc]");
      if (scope) {
        closeModal();
        setFilter(scope.dataset.scopeDoc);
        newChat();
        setView("chat");
        return;
      }
    });

    // Sidebar docs
    $("#side-docs").addEventListener("click", (event) => {
      const doc = event.target.closest("[data-doc]");
      if (!doc) return;
      setFilter(doc.dataset.doc);
      setView("chat");
    });

    // Global drag & drop guard
    window.addEventListener("dragover", (event) => event.preventDefault());
    window.addEventListener("drop", (event) => event.preventDefault());

    // Keyboard shortcuts
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
      const tag = (document.activeElement && document.activeElement.tagName) || "";
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (!typing && state.view === "quiz" && state.quiz.active && !state.quiz.result) {
        if (["1", "2", "3", "4"].includes(event.key) && !state.quiz.checked) {
          event.preventDefault();
          selectOption(Number(event.key) - 1);
          return;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          if (state.quiz.checked) nextQuestion();
          else if (state.quiz.selected != null) checkAnswer();
          return;
        }
      }

      if (!typing && state.view === "cards" && state.cards.deck.length && state.cards.index < state.cards.deck.length) {
        if (event.code === "Space") { event.preventDefault(); flipCard(); return; }
        if (event.key === "ArrowLeft") { event.preventDefault(); gradeCard(false); return; }
        if (event.key === "ArrowRight") { event.preventDefault(); gradeCard(true); return; }
      }

      if (!typing && !event.metaKey && !event.ctrlKey && !event.altKey && ["1", "2", "3", "4", "5"].includes(event.key)) {
        setView(VIEWS[Number(event.key) - 1]);
      }
    });
  }

  /* ------------------------------------------------------------ boot */

  async function init() {
    bindEvents();
    const hash = location.hash.replace("#", "");
    setView(VIEWS.includes(hash) ? hash : "chat", { skipHash: true });

    await Promise.all([loadHealth(), loadDocs(), loadSuggestions(), loadInsights(true)]);
    updateScopeUI();
    if (state.docs.some((d) => d.status === "processing")) startPolling();
    setInterval(loadHealth, 30000);

    if (state.view === "chat") {
      setTimeout(() => { const input = $("#chat-input"); if (input) input.focus(); }, 120);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
