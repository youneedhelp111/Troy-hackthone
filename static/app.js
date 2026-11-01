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

  const VIEWS = ["chat", "materials", "quiz", "cards", "insights", "settings"];

  /* ------------------------------------------------------------ i18n */

  const I18N = {
    en: {
      "nav.chat": "Chat", "nav.materials": "Materials", "nav.practice": "Practice",
      "nav.flashcards": "Flashcards", "nav.insights": "Insights", "nav.settings": "Settings",
      "side.materials": "Materials", "side.empty": "No materials yet",
      "side.note": "Local index · Cloud reasoning",
      "health.aiReady": "AI ready", "health.keywordOnly": "Keyword search only", "health.offline": "Backend offline",
      "meta.chat.title": "Chat", "meta.chat.sub": "Ask anything about your materials", "meta.chat.action": "New chat",
      "meta.materials.title": "Materials", "meta.materials.sub": "Your notes, slides and PDFs — indexed locally", "meta.materials.action": "Upload",
      "meta.practice.title": "Practice", "meta.practice.sub": "Auto-generated questions from your own materials", "meta.practice.action": "New quiz",
      "meta.flashcards.title": "Flashcards", "meta.flashcards.sub": "Active recall, one card at a time", "meta.flashcards.action": "New deck",
      "meta.insights.title": "Insights", "meta.insights.sub": "Where you stand and what to study next", "meta.insights.action": "Refresh",
      "meta.settings.title": "Settings", "meta.settings.sub": "Language, model and API access", "meta.settings.action": "Save",
      "scope.all": "All materials", "chat.placeholder": "Ask anything about your materials…",
      "chat.hint": "Enter to send · Shift+Enter for a new line",
      "common.send": "Send", "common.stop": "Stop generating", "common.copy": "Copy", "common.readAloud": "Read aloud",
      "common.delete": "Delete", "common.ask": "Ask", "common.practice": "Practice", "common.history": "History",
      "common.close": "Close", "common.copied": "Copied to clipboard",
      "chat.welcomeReadyTitle": "Study smarter, not longer",
      "chat.welcomeEmptyTitle": "Turn your notes into a tutor",
      "chat.welcomeReadyBody": "Ask questions about your own course materials. Every answer cites the exact page so you can check it.",
      "chat.welcomeEmptyBody": "Upload your lecture notes, slides or a PDF. StudyPal indexes them locally, then answers with page-level citations.",
      "chat.welcomeReadyNote": "Your files stay on this machine. Answers are grounded in your materials.",
      "chat.welcomeEmptyNote": "Local index · cloud reasoning · no account needed",
      "chat.source": "source", "chat.sources": "sources", "chat.cited": "cited", "chat.sourceLabel": "Source",
      "chat.thinking": "Thinking…", "chat.untitled": "Untitled", "chat.msg": "msg",
      "chat.historyTitle": "Chat history", "chat.recentSessions": "Recent sessions",
      "chat.pickUp": "Pick up where you left off.", "chat.noConversations": "No conversations yet.",
      "chat.chatFailed": "Chat failed", "chat.hiccup": "The AI service hiccuped. Try again in a moment.",
      "chat.wentWrong": "Something went wrong", "chat.noAnswer": "I couldn't produce an answer. Try again.",
      "chat.speechUnavailable": "Speech is not available",
      "sugg.1": "Explain the key idea in my notes", "sugg.2": "Compare two important concepts",
      "sugg.3": "Give me a worked example", "sugg.4": "What is most likely to be on the exam?",
      "materials.ready": "Ready", "materials.failed": "Failed", "materials.indexing": "Indexing",
      "materials.slides": "slides", "materials.pages": "pages", "materials.chunks": "chunks",
      "materials.processFailed": "Processing failed. Try re-uploading.",
      "materials.deleteConfirm": "Delete \"{title}\"? This removes its index.",
      "materials.deleted": "Document deleted", "materials.askKeyIdea": "What are the key ideas in \"{title}\"?",
      "materials.yourMaterials": "Your materials",
      "materials.subtitle": "PDF, slides and notes are parsed, chunked and indexed on this machine.",
      "materials.uploadFiles": "Upload files", "materials.dropHere": "Drop files here, or click to browse",
      "materials.dropSub": "Up to 40 MB each · multiple files supported", "materials.files": "files",
      "materials.uploadedIndexing": "uploaded — indexing", "materials.uploadFailed": "Upload failed",
      "materials.networkError": "Network error", "materials.uploadFailedServer": "Upload failed — is the server running?",
      "materials.how1": "Upload", "materials.how1d": "Drop in PDFs, slides or notes.",
      "materials.how2": "Auto-index", "materials.how2d": "Parsed, chunked and searched locally.",
      "materials.how3": "Ask & cite", "materials.how3d": "Every answer links back to the page.",
      "quiz.line1": "Reading your materials…", "quiz.line2": "Finding testable ideas…",
      "quiz.line3": "Drafting questions…", "quiz.line4": "Checking every answer against the source…",
      "card.line1": "Skimming your notes…", "card.line2": "Picking the highest-yield ideas…",
      "card.line3": "Writing prompts and answers…",
      "quiz.building": "Building your quiz", "quiz.noMaterialsTitle": "No materials to practise yet",
      "quiz.noMaterialsBody": "Upload lecture notes or a PDF first. StudyPal writes questions from your own material, not the internet.",
      "quiz.uploadMaterials": "Upload materials", "quiz.buildQuiz": "Build a quiz",
      "quiz.buildSub": "Questions are generated only from your uploaded materials, with the source page attached to every answer.",
      "quiz.scope": "Scope", "quiz.documents": "document", "quiz.questions": "Questions",
      "quiz.difficulty": "Difficulty", "quiz.easy": "Easy", "quiz.medium": "Medium", "quiz.hard": "Hard",
      "quiz.focusWeak": "Focus on my weak spots", "quiz.takeQuizFirst": "Take a quiz first to build your mastery map",
      "quiz.generate": "Generate quiz", "quiz.generateHint": "Takes 20–40 seconds. Every question is checked against your sources.",
      "quiz.question": "Question", "quiz.of": "of", "quiz.exit": "Exit", "quiz.concept": "Concept",
      "quiz.correct": "Correct", "quiz.notQuite": "Not quite", "quiz.noExplanation": "No explanation provided.",
      "quiz.viewSource": "View source", "quiz.scoring": "Scoring…", "quiz.seeResults": "See results",
      "quiz.nextQuestion": "Next question", "quiz.checkAnswer": "Check answer",
      "quiz.keysHint": "Keys 1–4 select · Enter confirms",
      "quiz.excellent": "Excellent work", "quiz.solid": "Solid understanding",
      "quiz.gettingThere": "Getting there", "quiz.worthAnother": "Worth another pass",
      "quiz.score": "score", "quiz.solidMost": "You're solid on most of it. {n} question{s} need another look.",
      "quiz.allCorrect": "Every answer was correct. Try hard mode to stretch further.",
      "quiz.correctCount": "correct", "quiz.toReview": "to review", "quiz.total": "total",
      "quiz.reviewMistakes": "Review mistakes", "quiz.generateFlashcards": "Generate flashcards",
      "quiz.newQuiz": "New quiz", "quiz.yourAnswer": "Your answer", "quiz.correctAnswer": "Correct answer",
      "quiz.source": "Source", "quiz.uploadFirst": "Upload materials first",
      "quiz.leaveConfirm": "Leave this quiz? Progress will be lost.",
      "card.building": "Building your deck", "card.deckComplete": "Deck complete",
      "card.youMarked": "You marked {known} of {total} cards as known ({pct}%).",
      "card.newDeck": "New deck", "card.weakSpots": "Weak spots", "card.seeInsights": "See insights",
      "card.card": "Card", "card.of": "of", "card.exitDeck": "Exit deck", "card.prompt": "Prompt",
      "card.flipHint": "Click or press Space to flip", "card.flip": "Flip card", "card.answer": "Answer",
      "card.again": "Again", "card.gotIt": "Got it", "card.tip": "Space flips · ← Again · → Got it",
      "card.buildDeck": "Build a flashcard deck",
      "card.buildSub": "Active recall beats re-reading. Cards are generated from your materials and graded into your mastery map.",
      "card.cards": "Cards", "card.focusWeakConcepts": "Focus on weak concepts",
      "card.generateDeck": "Generate deck", "card.reviewSaved": "Review saved cards",
      "card.noMaterials": "No materials yet", "card.noMaterialsBody": "Upload a PDF or your lecture slides first, then generate a deck.",
      "card.leaveConfirm": "Leave this deck?", "card.leaveNew": "Leave this deck and build a new one?", "card.noWeak": "No weak concepts yet — take a quiz first",
      "card.noSaved": "No saved cards yet — generate a deck first", "card.savedCard": "Saved card",
      "insights.reading": "Reading your progress", "insights.crunching": "Crunching quiz results…",
      "insights.emptyTitle": "Your mastery map starts with a document",
      "insights.emptyBody": "Upload your course materials, ask a few questions, and take one quiz. Insights will fill in from there.",
      "insights.noMastery": "Take a quiz or review flashcards to build your mastery map.",
      "insights.title": "Insights", "insights.sub": "What you've covered, what stuck, and what to do next.",
      "insights.materials": "Materials", "insights.indexedChunks": "indexed chunks",
      "insights.questionsAnswered": "Questions answered", "insights.quizzesGenerated": "quizzes generated",
      "insights.quizAccuracy": "Quiz accuracy", "insights.acrossAttempts": "across all attempts",
      "insights.cardReviews": "Card reviews", "insights.cardsInDecks": "cards in your decks",
      "insights.conceptMastery": "Concept mastery", "insights.smoothed": "Smoothed accuracy from quizzes and flashcards",
      "insights.focusNext": "Focus next", "insights.basedOnMissed": "Based on what you've missed",
      "insights.thisWeek": "This week", "insights.weekSub": "Quiz attempts · flashcard reviews · questions asked",
      "insights.actions": "actions", "insights.aiPlan": "AI study plan", "insights.regenerate": "Regenerate",
      "insights.turnIntoPlan": "Turn this into a plan",
      "insights.prioritizing": "Prioritising {topics}", "insights.planDefault": "A 3-hour plan built from your materials",
      "insights.generatePlan": "Generate 3-hour plan", "insights.writing": "Writing…",
      "insights.planReady": "Study plan ready", "insights.refreshed": "Insights refreshed",
      "insights.quizWeakSpots": "Quiz weak spots", "insights.flashcards": "Flashcards", "insights.attempt": "attempt", "insights.attempts": "attempts",
      "settings.title": "Settings", "settings.sub": "Language, model and API access",
      "settings.language": "Language", "settings.baseUrl": "Base URL (domain)", "settings.apiKey": "API key",
      "settings.model": "Model", "settings.keyHint": "Leave blank to keep the current key.",
      "settings.keyMissing": "No key set yet — paste your API key here.", "settings.keyPlaceholder": "sk-…",
      "settings.save": "Save settings", "settings.saved": "Settings saved", "settings.saveFailed": "Could not save settings",
      "settings.keySaved": "API key saved", "settings.testing": "Testing…", "settings.advanced": "Advanced",
      "settings.baseUrlHint": "Leave blank to keep the current endpoint.",
      "settings.onboardTitle": "Connect your DeepSeek API key",
      "settings.onboardSub": "StudyPal uses DeepSeek to write answers, quizzes and flashcards. Paste a key to get started — it's stored only on this machine.",
      "settings.onboardHint": "Get a key at platform.deepseek.com",
      "settings.onboardSave": "Save & continue", "settings.onboardLater": "Skip for now",
      "chat.fromYourMaterials": "From your materials", "chat.askOnlyThisDoc": "Ask only this document",
    },
    zh: {
      "nav.chat": "聊天", "nav.materials": "材料", "nav.practice": "练习",
      "nav.flashcards": "闪卡", "nav.insights": "洞察", "nav.settings": "设置",
      "side.materials": "材料", "side.empty": "暂无材料",
      "side.note": "本地索引 · 云端推理",
      "health.aiReady": "AI 就绪", "health.keywordOnly": "仅关键词检索", "health.offline": "后端离线",
      "meta.chat.title": "聊天", "meta.chat.sub": "就你的材料提问任何问题", "meta.chat.action": "新对话",
      "meta.materials.title": "材料", "meta.materials.sub": "你的笔记、幻灯片与 PDF，本地索引", "meta.materials.action": "上传",
      "meta.practice.title": "练习", "meta.practice.sub": "从你的材料自动生成题目", "meta.practice.action": "新测验",
      "meta.flashcards.title": "闪卡", "meta.flashcards.sub": "主动回忆，一次一张", "meta.flashcards.action": "新卡组",
      "meta.insights.title": "洞察", "meta.insights.sub": "你的进度与下一步学什么", "meta.insights.action": "刷新",
      "meta.settings.title": "设置", "meta.settings.sub": "语言、模型与 API 访问", "meta.settings.action": "保存",
      "scope.all": "全部材料", "chat.placeholder": "就你的材料提问任何问题…",
      "chat.hint": "回车发送 · Shift+回车换行",
      "common.send": "发送", "common.stop": "停止生成", "common.copy": "复制", "common.readAloud": "朗读",
      "common.delete": "删除", "common.ask": "提问", "common.practice": "练习", "common.history": "历史",
      "common.close": "关闭", "common.copied": "已复制到剪贴板",
      "chat.welcomeReadyTitle": "学得更聪明，不必更久",
      "chat.welcomeEmptyTitle": "把笔记变成你的助教",
      "chat.welcomeReadyBody": "就你的课程材料提问。每条回答都会标注出处页码，方便你核对。",
      "chat.welcomeEmptyBody": "上传你的讲义、幻灯片或 PDF。StudyPal 会在本地建立索引，然后带页码引用地回答。",
      "chat.welcomeReadyNote": "文件留在这台机器上，回答基于你的材料。",
      "chat.welcomeEmptyNote": "本地索引 · 云端推理 · 无需账号",
      "chat.source": "来源", "chat.sources": "处来源", "chat.cited": "已引用", "chat.sourceLabel": "来源",
      "chat.thinking": "思考中…", "chat.untitled": "未命名", "chat.msg": "条",
      "chat.historyTitle": "聊天记录", "chat.recentSessions": "最近的会话",
      "chat.pickUp": "接着上次继续。", "chat.noConversations": "还没有对话。",
      "chat.chatFailed": "对话失败", "chat.hiccup": "AI 服务暂时开小差了，请稍后再试。",
      "chat.wentWrong": "出错了", "chat.noAnswer": "我无法生成回答，请重试。",
      "chat.speechUnavailable": "语音不可用",
      "sugg.1": "解释我笔记里的核心概念", "sugg.2": "比较两个重要概念",
      "sugg.3": "给我一个例题", "sugg.4": "考试最可能考什么？",
      "materials.ready": "就绪", "materials.failed": "失败", "materials.indexing": "索引中",
      "materials.slides": "页", "materials.pages": "页", "materials.chunks": "分块",
      "materials.processFailed": "处理失败，请重新上传。",
      "materials.deleteConfirm": "删除“{title}”？这会移除它的索引。",
      "materials.deleted": "材料已删除", "materials.askKeyIdea": "“{title}”的核心要点是什么？",
      "materials.yourMaterials": "你的材料",
      "materials.subtitle": "PDF、幻灯片和笔记会在这台机器上解析、分块并建立索引。",
      "materials.uploadFiles": "上传文件", "materials.dropHere": "拖文件到这里，或点击浏览",
      "materials.dropSub": "单个最大 40 MB · 支持多文件", "materials.files": "个文件",
      "materials.uploadedIndexing": "已上传 — 正在索引", "materials.uploadFailed": "上传失败",
      "materials.networkError": "网络错误", "materials.uploadFailedServer": "上传失败 — 服务器在运行吗？",
      "materials.how1": "上传", "materials.how1d": "放入 PDF、幻灯片或笔记。",
      "materials.how2": "自动索引", "materials.how2d": "本地解析、分块与检索。",
      "materials.how3": "提问与引用", "materials.how3d": "每条回答都链接回原文。",
      "quiz.line1": "正在阅读你的材料…", "quiz.line2": "正在寻找可考的知识点…",
      "quiz.line3": "正在起草题目…", "quiz.line4": "正在逐题核对来源…",
      "card.line1": "正在浏览你的笔记…", "card.line2": "正在挑选高价值知识点…",
      "card.line3": "正在编写题目与答案…",
      "quiz.building": "正在生成测验", "quiz.noMaterialsTitle": "还没有可练习的材料",
      "quiz.noMaterialsBody": "先上传讲义或 PDF。StudyPal 只根据你的材料出题，而不是从网上找题。",
      "quiz.uploadMaterials": "上传材料", "quiz.buildQuiz": "创建测验",
      "quiz.buildSub": "题目仅根据你上传的材料生成，每道题都附带来源页码。",
      "quiz.scope": "范围", "quiz.documents": "份材料", "quiz.questions": "题数",
      "quiz.difficulty": "难度", "quiz.easy": "简单", "quiz.medium": "中等", "quiz.hard": "困难",
      "quiz.focusWeak": "专注我的薄弱点", "quiz.takeQuizFirst": "先做一次测验来建立掌握度地图",
      "quiz.generate": "生成测验", "quiz.generateHint": "需要 20–40 秒。每道题都会对照来源核对。",
      "quiz.question": "第", "quiz.of": "题，共", "quiz.exit": "退出", "quiz.concept": "概念",
      "quiz.correct": "回答正确", "quiz.notQuite": "还差一点", "quiz.noExplanation": "未提供解析。",
      "quiz.viewSource": "查看来源", "quiz.scoring": "判分中…", "quiz.seeResults": "查看结果",
      "quiz.nextQuestion": "下一题", "quiz.checkAnswer": "检查答案",
      "quiz.keysHint": "按 1–4 选择 · 回车确认",
      "quiz.excellent": "表现出色", "quiz.solid": "掌握扎实",
      "quiz.gettingThere": "渐入佳境", "quiz.worthAnother": "值得再练一遍",
      "quiz.score": "得分", "quiz.solidMost": "大部分你都掌握得不错，还有 {n} 题需要再看看。",
      "quiz.allCorrect": "全部答对！试试困难模式更进一步。",
      "quiz.correctCount": "正确", "quiz.toReview": "待复习", "quiz.total": "总计",
      "quiz.reviewMistakes": "复习错题", "quiz.generateFlashcards": "生成闪卡",
      "quiz.newQuiz": "新测验", "quiz.yourAnswer": "你的回答", "quiz.correctAnswer": "正确答案",
      "quiz.source": "来源", "quiz.uploadFirst": "请先上传材料",
      "quiz.leaveConfirm": "离开这个测验？进度将丢失。",
      "card.building": "正在生成卡组", "card.deckComplete": "卡组完成",
      "card.youMarked": "你把 {total} 张中的 {known} 张标记为已掌握（{pct}%）。",
      "card.newDeck": "新卡组", "card.weakSpots": "薄弱点", "card.seeInsights": "查看洞察",
      "card.card": "卡", "card.of": "，共", "card.exitDeck": "退出卡组", "card.prompt": "问题",
      "card.flipHint": "点击或按空格翻面", "card.flip": "翻面", "card.answer": "答案",
      "card.again": "没记住", "card.gotIt": "记住了", "card.tip": "空格翻面 · ← 没记住 · → 记住了",
      "card.buildDeck": "创建闪卡组",
      "card.buildSub": "主动回忆胜过反复阅读。闪卡根据你的材料生成，并计入掌握度地图。",
      "card.cards": "卡数", "card.focusWeakConcepts": "专注薄弱概念",
      "card.generateDeck": "生成卡组", "card.reviewSaved": "复习已保存的闪卡",
      "card.noMaterials": "暂无材料", "card.noMaterialsBody": "先上传 PDF 或讲义幻灯片，再生成卡组。",
      "card.leaveConfirm": "离开这个卡组？", "card.leaveNew": "离开这个卡组并新建一个？", "card.noWeak": "还没有薄弱概念 — 先做一次测验",
      "card.noSaved": "还没有保存的闪卡 — 先生成一组", "card.savedCard": "已保存的闪卡",
      "insights.reading": "正在读取你的进度", "insights.crunching": "正在汇总测验结果…",
      "insights.emptyTitle": "你的掌握度地图从一份材料开始",
      "insights.emptyBody": "上传课程材料、问几个问题、做一次测验，洞察会随之而来。",
      "insights.noMastery": "做一次测验或复习闪卡来建立掌握度地图。",
      "insights.title": "洞察", "insights.sub": "你学过了什么、记住了什么，以及下一步该做什么。",
      "insights.materials": "材料", "insights.indexedChunks": "个已索引分块",
      "insights.questionsAnswered": "已回答题目", "insights.quizzesGenerated": "套测验已生成",
      "insights.quizAccuracy": "测验正确率", "insights.acrossAttempts": "全部作答平均",
      "insights.cardReviews": "闪卡复习", "insights.cardsInDecks": "张闪卡",
      "insights.conceptMastery": "概念掌握度", "insights.smoothed": "来自测验与闪卡的平滑正确率",
      "insights.focusNext": "下一步专注", "insights.basedOnMissed": "根据你的错题",
      "insights.thisWeek": "本周", "insights.weekSub": "测验作答 · 闪卡复习 · 提问",
      "insights.actions": "次活动", "insights.aiPlan": "AI 学习计划", "insights.regenerate": "重新生成",
      "insights.turnIntoPlan": "把它变成学习计划",
      "insights.prioritizing": "优先处理 {topics}", "insights.planDefault": "根据你的材料生成 3 小时计划",
      "insights.generatePlan": "生成 3 小时计划", "insights.writing": "撰写中…",
      "insights.planReady": "学习计划已就绪", "insights.refreshed": "洞察已刷新",
      "insights.quizWeakSpots": "测验薄弱点", "insights.flashcards": "闪卡", "insights.attempt": "次", "insights.attempts": "次",
      "settings.title": "设置", "settings.sub": "语言、模型与 API 访问",
      "settings.language": "语言", "settings.baseUrl": "接口地址（域名）", "settings.apiKey": "API 密钥",
      "settings.model": "模型", "settings.keyHint": "留空则保持当前密钥不变。",
      "settings.keyMissing": "尚未设置密钥 — 在此粘贴你的 API 密钥。", "settings.keyPlaceholder": "sk-…",
      "settings.save": "保存设置", "settings.saved": "设置已保存", "settings.saveFailed": "无法保存设置",
      "settings.keySaved": "API 密钥已保存", "settings.testing": "正在测试…", "settings.advanced": "高级设置",
      "settings.baseUrlHint": "留空则保持当前接口地址。",
      "settings.onboardTitle": "连接你的 DeepSeek API 密钥",
      "settings.onboardSub": "StudyPal 使用 DeepSeek 生成回答、测验与闪卡。粘贴一个密钥即可开始 — 它只保存在本机。",
      "settings.onboardHint": "在 platform.deepseek.com 获取密钥",
      "settings.onboardSave": "保存并继续", "settings.onboardLater": "暂时跳过",
      "chat.fromYourMaterials": "来自你的材料", "chat.askOnlyThisDoc": "仅就本文档提问",
    },
  };

  let LANG = (() => {
    try { return localStorage.getItem("studypal.lang") === "zh" ? "zh" : "en"; }
    catch (_) { return "en"; }
  })();

  function t(key, vars) {
    let s = (I18N[LANG] && I18N[LANG][key]) || I18N.en[key] || key;
    if (vars) for (const k in vars) s = s.split(`{${k}}`).join(vars[k]);
    return s;
  }

  function metaFor(view) {
    return {
      chat: { title: t("meta.chat.title"), sub: t("meta.chat.sub"), action: t("meta.chat.action") },
      materials: { title: t("meta.materials.title"), sub: t("meta.materials.sub"), action: t("meta.materials.action") },
      quiz: { title: t("meta.practice.title"), sub: t("meta.practice.sub"), action: t("meta.practice.action") },
      cards: { title: t("meta.flashcards.title"), sub: t("meta.flashcards.sub"), action: t("meta.flashcards.action") },
      insights: { title: t("meta.insights.title"), sub: t("meta.insights.sub"), action: t("meta.insights.action") },
      settings: { title: t("meta.settings.title"), sub: t("meta.settings.sub"), action: t("meta.settings.action") },
    }[view];
  }

  const QUIZ_LINES = () => [t("quiz.line1"), t("quiz.line2"), t("quiz.line3"), t("quiz.line4")];
  const CARD_LINES = () => [t("card.line1"), t("card.line2"), t("card.line3")];

  const state = {
    view: "chat",
    docs: [],
    filter: "all",
    health: null,
    suggestions: [],
    settings: null,
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
    out = out.replace(/\[(\d{1,2})\]/g, `<button type="button" class="cite" data-cite="$1" title="${t("quiz.viewSource")} $1">$1</button>`);
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
    if (state.filter === "all") return t("scope.all");
    const doc = docById(state.filter);
    return doc ? docTitle(doc) : t("scope.all");
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
      toast(t("common.copied"));
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast(t("common.copied"));
    }
  }

  /* ------------------------------------------------------------ modal */

  function openModal(html) {
    const root = $("#modal-root");
    root.innerHTML = `
      <div class="modal-backdrop" data-close="1"></div>
      <div class="modal-panel" role="dialog" aria-modal="true">
        <button class="modal-close" type="button" aria-label="${t("common.close")}" data-close="1">${icons.x}</button>
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
      <div class="modal-kicker">${source.n ? `${t("chat.sourceLabel")} ${source.n} · ` : ""}p.${esc(source.page || 1)}</div>
      <div class="modal-title">${esc(source.doc_title || t("chat.sourceLabel"))}</div>
      <div class="modal-sub">${doc ? `${esc((doc.kind || "file").toUpperCase())} · ${doc.pages || 0} ${t("materials.pages")} · ${doc.chunk_count || 0} ${t("materials.chunks")}` : t("chat.fromYourMaterials")}</div>
      <div class="modal-snippet">${esc(source.snippet || "")}</div>
      ${source.doc_id ? `<div class="row" style="margin-top:16px;justify-content:flex-end"><button class="btn btn-sm" data-scope-doc="${esc(source.doc_id)}">${t("chat.askOnlyThisDoc")}</button></div>` : ""}
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
      label.textContent = ready ? t("health.aiReady") : t("health.keywordOnly");
      pill.title = `LLM: ${health.llm_model} · Embeddings: ${health.embed_model || "BM25"} · ${health.documents} docs / ${health.chunks} chunks`;
    } catch (_) {
      state.health = null;
      pill.classList.remove("is-ok");
      pill.classList.add("is-bad");
      label.textContent = t("health.offline");
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
      box.innerHTML = `<div class="side-empty">${t("side.empty")}</div>`;
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
    select.innerHTML = `<option value="all">${t("scope.all")}</option>` +
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
    } else if (view === "settings") {
      renderSettings();
      if (!state.settings) loadSettings();
    }
  }

  function updateTopbar() {
    const meta = metaFor(state.view);
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
    return [t("sugg.1"), t("sugg.2"), t("sugg.3"), t("sugg.4")];
  }

  function welcomeHTML() {
    const ready = hasReadyDocs();
    const suggestions = state.suggestions.length ? state.suggestions : defaultSuggestions();
    return `
      <div class="welcome">
        <div class="welcome-mark">${icons.spark}</div>
        <h2>${ready ? t("chat.welcomeReadyTitle") : t("chat.welcomeEmptyTitle")}</h2>
        <p>${ready ? t("chat.welcomeReadyBody") : t("chat.welcomeEmptyBody")}</p>
        <div class="suggestions">
          ${suggestions.slice(0, 4).map((text, i) => `
            <button class="suggestion" type="button" data-suggestion="${i}">
              <span class="sic">${[icons.chat, icons.target, icons.cards, icons.sparkSmall][i % 4]}</span>
              <span>${esc(text)}</span>
            </button>`).join("")}
        </div>
        <div class="welcome-note"><span class="lock">${icons.lock}</span>${ready
          ? t("chat.welcomeReadyNote")
          : t("chat.welcomeEmptyNote")}</div>
      </div>`;
  }

  function sourcesHTML(sources, idx) {
    if (!sources.length) return "";
    const srcWord = sources.length > 1 ? t("chat.sources") : t("chat.source");
    return `
      <div class="sources" data-idx="${idx}">
        <button type="button" class="sources-toggle">${icons.chevron} ${sources.length} ${srcWord}
          <span class="badge">${t("chat.cited")}</span>
        </button>
        <div class="source-grid">
          ${sources.map((s) => `
            <button type="button" class="source-card" data-idx="${idx}" data-n="${esc(s.n)}">
              <div class="sc-top">[${esc(s.n)}] <span class="pg">p.${esc(s.page)}</span></div>
              <div class="sc-title">${esc(s.doc_title || t("chat.sourceLabel"))}</div>
              <div class="sc-snip">${esc(s.snippet || "")}</div>
            </button>`).join("")}
        </div>
      </div>`;
  }

  function messageHTML(msg, idx) {
    const isUser = msg.role === "user";
    const body = msg.content
      ? (isUser ? esc(msg.content).replace(/\n/g, "<br>") : md(msg.content))
      : (msg.streaming ? `<span class="faint">${t("chat.thinking")}</span>` : "");
    return `
      <div class="msg ${isUser ? "user" : "assistant"}" data-idx="${idx}">
        ${isUser ? "" : `<div class="msg-avatar">${icons.spark}</div>`}
        <div class="msg-col">
          ${isUser ? "" : '<div class="msg-meta">StudyPal</div>'}
          <div class="msg-body">${body}${msg.streaming ? '<span class="stream-cursor"></span>' : ""}</div>
          ${!isUser && msg.sources && msg.sources.length ? sourcesHTML(msg.sources, idx) : ""}
          ${!isUser && !msg.streaming && msg.content ? `
            <div class="msg-actions">
              <button type="button" class="msg-action" data-action="copy" data-idx="${idx}">${icons.copy} ${t("common.copy")}</button>
              <button type="button" class="msg-action" data-action="speak" data-idx="${idx}">${icons.volume} ${t("common.readAloud")}</button>
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
        let detail = t("chat.chatFailed");
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
          toast(data.message || t("chat.hiccup"), "error");
        } else if (event === "done") {
          if (data.sources) ai.sources = data.sources;
        }
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        const ai = state.messages[aiIdx];
        ai.error = true;
        ai.content = ai.content || `${t("chat.wentWrong")}: ${err.message}`;
        toast(err.message, "error");
      }
    } finally {
      const ai = state.messages[aiIdx];
      ai.streaming = false;
      if (!ai.content && !ai.error) ai.content = t("chat.noAnswer");
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
      btn.title = t("common.stop");
      btn.setAttribute("aria-label", t("common.stop"));
    } else {
      btn.classList.remove("is-stop");
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M5 12h13M13 6l6 6-6 6"/></svg>';
      btn.title = t("common.send");
      btn.setAttribute("aria-label", t("common.send"));
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
      <div class="modal-kicker">${t("chat.historyTitle")}</div>
      <div class="modal-title">${t("chat.recentSessions")}</div>
      <div class="modal-sub">${sessions.length ? t("chat.pickUp") : t("chat.noConversations")}</div>
      <div class="session-list">
        ${sessions.map((s) => `
          <button class="session-item" type="button" data-session="${esc(s.id)}">
            <span class="si-icon">${icons.chat}</span>
            <span class="si-title">${esc(s.title || t("chat.untitled"))}</span>
            <span class="si-count">${s.messages} ${t("chat.msg")}</span>
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
    return status === "ready" ? t("materials.ready") : status === "failed" ? t("materials.failed") : t("materials.indexing");
  }

  function docCardHTML(doc) {
    const ready = doc.status === "ready";
    const kind = (doc.kind || "doc").toLowerCase();
    const concepts = (doc.concepts || []).slice(0, 4);
    const extra = Math.max(0, (doc.concepts || []).length - 4);
    const pageWord = kind === "pptx" ? t("materials.slides") : t("materials.pages");
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
          <span><b>${doc.chunk_count || 0}</b> ${t("materials.chunks")}</span>
          <span>${formatBytes(doc.size)}</span>
        </div>
        ${concepts.length ? `<div class="doc-concepts">${concepts.map((c) => `<span class="concept">${esc(c)}</span>`).join("")}${extra ? `<span class="concept more">+${extra}</span>` : ""}</div>` : ""}
        ${doc.summary ? `<div class="doc-summary">${esc(doc.summary)}</div>` : ""}
        ${doc.status === "processing" ? '<div class="progress-track"><i></i></div>' : ""}
        ${doc.status === "failed" ? `<div class="doc-error">${esc(doc.error || t("materials.processFailed"))}</div>` : ""}
        <div class="doc-actions">
          <button class="btn btn-sm" type="button" data-doc-action="ask" data-id="${esc(doc.id)}" ${ready ? "" : "disabled"}>${t("common.ask")}</button>
          <button class="btn btn-sm" type="button" data-doc-action="practice" data-id="${esc(doc.id)}" ${ready ? "" : "disabled"}>${t("common.practice")}</button>
          <button class="btn btn-sm btn-icon" type="button" data-doc-action="delete" data-id="${esc(doc.id)}" title="${t("common.delete")}" aria-label="${t("common.delete")}">${icons.trash}</button>
        </div>
      </article>`;
  }

  function howItWorksHTML() {
    return `
      <div class="stat-grid" style="margin-top:22px">
        <div class="stat-card"><div class="sv">01</div><div class="sl">${t("materials.how1")}</div><div class="sd">${t("materials.how1d")}</div></div>
        <div class="stat-card"><div class="sv">02</div><div class="sl">${t("materials.how2")}</div><div class="sd">${t("materials.how2d")}</div></div>
        <div class="stat-card"><div class="sv">03</div><div class="sl">${t("materials.how3")}</div><div class="sd">${t("materials.how3d")}</div></div>
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
          <h2 class="section-title">${t("materials.yourMaterials")}</h2>
          <p class="section-sub">${t("materials.subtitle")}</p>
        </div>
        <button class="btn btn-primary" type="button" id="mat-upload">${icons.plus} ${t("materials.uploadFiles")}</button>
      </div>
      <div class="dropzone" id="dropzone" tabindex="0" role="button" aria-label="${t("materials.uploadFiles")}">
        <div class="dz-icon">${icons.upload}</div>
        <div class="dz-title">${t("materials.dropHere")}</div>
        <div class="dz-sub">${t("materials.dropSub")}</div>
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
    state.uploads.push({ id, name: files.length > 1 ? `${files.length} ${t("materials.files")}` : files[0].name, pct: 0, error: "" });
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
        toast(files.length > 1 ? `${files.length} ${t("materials.files")} ${t("materials.uploadedIndexing")}` : `${files[0].name} ${t("materials.uploadedIndexing")}`);
        loadDocs();
        startPolling();
        setTimeout(() => {
          state.uploads = state.uploads.filter((u) => u.id !== id);
          const q = $("#upload-queue");
          if (q) q.innerHTML = uploadQueueHTML();
        }, 1400);
      } else {
        let detail = t("materials.uploadFailed");
        try { detail = JSON.parse(xhr.responseText).detail || detail; } catch (_) { /* ignore */ }
        if (upload) { upload.error = detail; upload.pct = 0; }
        const q = $("#upload-queue");
        if (q) q.innerHTML = uploadQueueHTML();
        toast(detail, "error");
      }
    };
    xhr.onerror = () => {
      const upload = state.uploads.find((u) => u.id === id);
      if (upload) upload.error = t("materials.networkError");
      const q = $("#upload-queue");
      if (q) q.innerHTML = uploadQueueHTML();
      toast(t("materials.uploadFailedServer"), "error");
    };
    xhr.send(form);
  }

  async function deleteDoc(id) {
    const doc = docById(id);
    if (!doc) return;
    if (!confirm(t("materials.deleteConfirm", { title: docTitle(doc) }))) return;
    try {
      await api(`/api/documents/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (state.filter === id) state.filter = "all";
      toast(t("materials.deleted"));
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
      input.value = t("materials.askKeyIdea", { title: docTitle(doc) });
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
      box.innerHTML = loadingHTML(t("quiz.building"), QUIZ_LINES());
      startRotator(QUIZ_LINES());
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
          <h3>${t("quiz.noMaterialsTitle")}</h3>
          <p>${t("quiz.noMaterialsBody")}</p>
          <button class="btn btn-primary" type="button" data-quiz-go="materials">${icons.upload} ${t("quiz.uploadMaterials")}</button>
        </div>`;
      return;
    }

    const weak = (state.insights && state.insights.weak) || [];
    box.innerHTML = `
      <div class="quiz-setup">
        <div class="panel setup-panel">
          <div class="setup-title">${t("quiz.buildQuiz")}</div>
          <div class="setup-sub">${t("quiz.buildSub")}</div>

          <div class="field">
            <div class="field-label"><span>${t("quiz.scope")}</span><span class="field-hint">${ready.length} ${t("quiz.documents")}</span></div>
            <div class="chip-row">
              <button class="chip ${s.useAll ? "is-on" : ""}" type="button" data-qdoc="all"><span class="cdot"></span>${t("scope.all")}</button>
              ${ready.map((d) => `<button class="chip ${!s.useAll && s.docs.includes(d.id) ? "is-on" : ""}" type="button" data-qdoc="${esc(d.id)}"><span class="cdot"></span>${esc(docTitle(d))}</button>`).join("")}
            </div>
          </div>

          <div class="field">
            <div class="field-label"><span>${t("quiz.questions")}</span></div>
            <div class="seg">
              ${[5, 8, 10].map((n) => `<button type="button" class="${s.count === n ? "is-on" : ""}" data-qcount="${n}">${n}</button>`).join("")}
            </div>
          </div>

          <div class="field">
            <div class="field-label"><span>${t("quiz.difficulty")}</span></div>
            <div class="seg">
              <button type="button" class="${s.difficulty === "easy" ? "is-on" : ""}" data-qdiff="easy">${t("quiz.easy")}</button>
              <button type="button" class="${s.difficulty === "medium" ? "is-on accent" : ""}" data-qdiff="medium">${t("quiz.medium")}</button>
              <button type="button" class="${s.difficulty === "hard" ? "is-on" : ""}" data-qdiff="hard">${t("quiz.hard")}</button>
            </div>
          </div>

          <div class="field">
            <label class="check-row">
              <input type="checkbox" id="q-focus-weak" ${s.focusWeak ? "checked" : ""}>
              <span>
                <span class="cr-title">${t("quiz.focusWeak")}</span>
                <span class="cr-sub">${weak.length ? weak.slice(0, 3).map((w) => w.concept).join(" · ") : t("quiz.takeQuizFirst")}</span>
              </span>
            </label>
          </div>

          <div class="generate-row">
            <button class="btn btn-primary btn-lg" type="button" data-quiz-go="generate">${icons.spark} ${t("quiz.generate")}</button>
            <span class="tiny faint">${t("quiz.generateHint")}</span>
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
        <div class="fb-head">${ok ? icons.check : icons.x} ${ok ? t("quiz.correct") : t("quiz.notQuite")}</div>
        <div class="fb-text">${esc(qq.explanation || t("quiz.noExplanation"))}</div>
        <div class="fb-source">${icons.book}<span><b>${esc(qq.source.doc_title)}</b> · p.${esc(qq.source.page)}</span>
          <button class="btn btn-sm btn-ghost" type="button" data-quiz-src="${q.index}">${t("quiz.viewSource")}</button>
        </div>
      </div>` : "";

    box.innerHTML = `
      <div class="quiz-run">
        <div class="quiz-top">
          <span class="quiz-count">${t("quiz.question")} <b>${q.index + 1}</b> ${t("quiz.of")} <b>${qq_total()}</b></span>
          <span class="quiz-progress"><i style="width:${((q.index + (checked ? 1 : 0)) / qq_total()) * 100}%"></i></span>
          <button class="btn btn-sm btn-ghost" type="button" data-quiz-go="exit">${t("quiz.exit")}</button>
        </div>
        <div class="question-card panel">
          <div class="q-concept">${icons.sparkSmall} ${esc(qq.concept || t("quiz.concept"))}</div>
          <div class="q-text">${esc(qq.question)}</div>
          <div class="options">${optionsHTML}</div>
          ${feedback}
          <div class="quiz-next">
            ${checked
              ? `<button class="btn btn-primary" type="button" data-quiz-go="${isLast ? "submit" : "next"}" ${q.submitting ? "disabled" : ""}>${q.submitting ? t("quiz.scoring") : (isLast ? t("quiz.seeResults") : t("quiz.nextQuestion"))}</button>`
              : `<button class="btn btn-primary" type="button" data-quiz-go="check" ${q.selected == null ? "disabled" : ""}>${t("quiz.checkAnswer")}</button>`}
          </div>
        </div>
        <div class="tiny faint" style="text-align:center;margin-top:14px">${t("quiz.keysHint")}</div>
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
    if (percent >= 85) return t("quiz.excellent");
    if (percent >= 70) return t("quiz.solid");
    if (percent >= 50) return t("quiz.gettingThere");
    return t("quiz.worthAnother");
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
          <div class="score-value"><b>${pct}%</b><span>${t("quiz.score")}</span></div>
        </div>
        <div class="result-title">${scoreTitle(pct)}</div>
        <div class="result-sub">${wrong.length
          ? t("quiz.solidMost", { n: wrong.length, s: wrong.length > 1 ? "s" : "" })
          : t("quiz.allCorrect")}</div>
        <div class="result-stats">
          <span><b>${r.score}</b> ${t("quiz.correctCount")}</span>
          <span><b>${r.total - r.score}</b> ${t("quiz.toReview")}</span>
          <span><b>${r.total}</b> ${t("quiz.total")}</span>
        </div>
        ${r.weak_concepts.length ? `<div class="result-weak">${r.weak_concepts.map((c) => `<span class="concept">${esc(c)}</span>`).join("")}</div>` : ""}
        <div class="result-actions">
          <button class="btn" type="button" data-res="review" ${wrong.length ? "" : "disabled"}>${icons.book} ${t("quiz.reviewMistakes")}</button>
          <button class="btn" type="button" data-res="cards">${icons.cards} ${t("quiz.generateFlashcards")}</button>
          <button class="btn btn-primary" type="button" data-res="again">${icons.target} ${t("quiz.newQuiz")}</button>
        </div>
        ${wrong.length ? `
          <div class="review-list">
            ${r.results.map((res, i) => {
              const qq = questions[i];
              return `<details class="review-item ${res.correct ? "is-correct" : ""}">
                <summary><span class="ri-mark">${res.correct ? "✓" : "×"}</span><span>${esc(qq.question)}</span></summary>
                <div class="review-body">
                  <div class="rb-row">${t("quiz.yourAnswer")}: <b class="${res.correct ? "good" : "bad"}">${res.selected != null ? esc(qq.options[res.selected]) : "—"}</b></div>
                  ${res.correct ? "" : `<div class="rb-row">${t("quiz.correctAnswer")}: <b class="good">${esc(qq.options[res.answer_index])}</b></div>`}
                  <div class="rb-row">${esc(qq.explanation || "")}</div>
                  <div class="rb-row faint">${t("quiz.source")}: ${esc(qq.source.doc_title)} · p.${esc(qq.source.page)}</div>
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
      toast(t("quiz.uploadFirst"), "error");
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
      box.innerHTML = loadingHTML(t("card.building"), CARD_LINES());
      startRotator(CARD_LINES());
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
            <h3>${t("card.deckComplete")}</h3>
            <p>${t("card.youMarked", { known, total, pct })}</p>
            <div class="result-actions">
              <button class="btn" type="button" data-fc="new">${icons.plus} ${t("card.newDeck")}</button>
              <button class="btn" type="button" data-fc="weak">${icons.target} ${t("card.weakSpots")}</button>
              <button class="btn btn-primary" type="button" data-fc="insights">${icons.chart} ${t("card.seeInsights")}</button>
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
            <div class="fc-progress">${t("card.card")} <b>${c.index + 1}</b> ${t("card.of")} <b>${c.deck.length}</b></div>
            <div class="row">
              <span class="tiny faint">${esc(card.concept || "")}</span>
              <button class="btn btn-sm btn-ghost" type="button" data-fc="exit">${t("card.exitDeck")}</button>
            </div>
          </div>
          <div class="fc-scene" id="fc-scene" role="button" tabindex="0" aria-label="${t("card.flip")}">
            <div class="fc-card${c.flipped ? " is-flipped" : ""}" data-fc-card>
              <div class="fc-face fc-front">
                <div class="fc-tag">${esc(card.concept || t("quiz.concept"))}</div>
                <div class="fc-side">${t("card.prompt")}</div>
                <div class="fc-front-text">${esc(card.front)}</div>
                <div class="fc-hint">${t("card.flipHint")}</div>
              </div>
              <div class="fc-face fc-back">
                <div class="fc-tag">${esc(card.concept || t("card.answer"))}</div>
                <div class="fc-side">${t("card.answer")}</div>
                <div class="fc-back-text">${esc(card.back)}</div>
                <div class="fc-hint">${esc(card.doc_title || "")}${card.page ? ` · p.${esc(card.page)}` : ""}</div>
              </div>
            </div>
          </div>
          <div class="fc-controls">
            <button class="btn fc-again" type="button" data-fc="again" ${c.busy ? "disabled" : ""}>← ${t("card.again")}</button>
            <button class="btn fc-known" type="button" data-fc="known" ${c.busy ? "disabled" : ""}>${t("card.gotIt")} →</button>
          </div>
          <div class="fc-tip">${t("card.tip")}</div>
        </div>`;
      return;
    }

    const weak = (state.insights && state.insights.weak) || [];
    box.innerHTML = `
      <div class="fc-empty">
        <div class="panel setup-panel">
          <div class="setup-title">${t("card.buildDeck")}</div>
          <div class="setup-sub">${t("card.buildSub")}</div>
          ${hasReadyDocs() ? `
            <div class="field">
              <div class="field-label"><span>${t("card.cards")}</span></div>
              <div class="seg">${[8, 10, 15].map((n) => `<button type="button" class="${c.count === n ? "is-on" : ""}" data-fcount="${n}">${n}</button>`).join("")}</div>
            </div>
            <div class="field">
              <label class="check-row">
                <input type="checkbox" id="fc-focus-weak" ${c.focusWeak ? "checked" : ""}>
                <span><span class="cr-title">${t("card.focusWeakConcepts")}</span>
                <span class="cr-sub">${weak.length ? weak.slice(0, 3).map((w) => w.concept).join(" · ") : t("quiz.takeQuizFirst")}</span></span>
              </label>
            </div>
            <div class="generate-row">
              <button class="btn btn-primary btn-lg" type="button" data-fc="generate">${icons.spark} ${t("card.generateDeck")}</button>
              <button class="btn" type="button" data-fc="saved">${t("card.reviewSaved")}</button>
            </div>` : `
            <div class="empty-state" style="padding:40px 10px 20px">
              <div class="es-icon">${icons.cards}</div>
              <h3>${t("card.noMaterials")}</h3>
              <p>${t("card.noMaterialsBody")}</p>
              <button class="btn btn-primary" type="button" data-fc="materials">${icons.upload} ${t("quiz.uploadMaterials")}</button>
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
      toast(t("quiz.uploadFirst"), "error");
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
        doc_title: f.doc_title || t("card.savedCard"),
        page: null,
      }));
      if (!cards.length) {
        toast(t("card.noSaved"), "error");
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
      box.innerHTML = loadingHTML(t("insights.reading"), [t("insights.crunching")]);
      startRotator([t("insights.crunching")]);
      return;
    }
    stopRotator();

    if (!data.documents.length) {
      box.innerHTML = `
        <div class="empty-state">
          <div class="es-icon">${icons.chart}</div>
          <h3>${t("insights.emptyTitle")}</h3>
          <p>${t("insights.emptyBody")}</p>
          <button class="btn btn-primary" type="button" data-ins="upload">${icons.upload} ${t("quiz.uploadMaterials")}</button>
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
            <div class="mr-top"><span class="mr-name">${esc(m.concept)}</span><span class="mr-pct">${pct}% · ${m.total} ${m.total === 1 ? t("insights.attempt") : t("insights.attempts")}</span></div>
            <div class="mastery-bar"><i class="${tone}" style="width:${Math.max(4, pct)}%"></i></div>
          </div>`;
        }).join("")
      : `<div class="tiny faint" style="padding:18px 0">${t("insights.noMastery")}</div>`;

    const weak = data.weak || [];
    const recs = data.recommendations || [];

    box.innerHTML = `
      <div class="row-between" style="margin-bottom:20px">
        <div>
          <h2 class="section-title">${t("insights.title")}</h2>
          <p class="section-sub">${t("insights.sub")}</p>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat-card"><div class="sv">${s.documents}</div><div class="sl">${t("insights.materials")}</div><div class="sd">${s.chunks} ${t("insights.indexedChunks")}</div></div>
        <div class="stat-card"><div class="sv">${s.questions_answered}</div><div class="sl">${t("insights.questionsAnswered")}</div><div class="sd">${s.quizzes} ${t("insights.quizzesGenerated")}</div></div>
        <div class="stat-card"><div class="sv">${s.accuracy}%</div><div class="sl">${t("insights.quizAccuracy")}</div><div class="sd">${t("insights.acrossAttempts")}</div></div>
        <div class="stat-card"><div class="sv">${s.card_reviews}</div><div class="sl">${t("insights.cardReviews")}</div><div class="sd">${s.flashcards} ${t("insights.cardsInDecks")}</div></div>
      </div>

      <div class="insights-grid">
        <div class="panel">
          <div class="panel-head"><div><h2>${t("insights.conceptMastery")}</h2><p>${t("insights.smoothed")}</p></div></div>
          <div class="mastery-list">${masteryRows}</div>
        </div>
        <div class="panel">
          <div class="panel-head"><div><h2>${t("insights.focusNext")}</h2><p>${t("insights.basedOnMissed")}</p></div></div>
          <div class="rec-list">
            ${recs.slice(0, 4).map((r) => `
              <div class="rec-card">
                <div class="rc-title"><span class="rc-dot"></span>${esc(r.title)}</div>
                <div class="rc-body">${esc(r.body)}</div>
              </div>`).join("")}
          </div>
          ${weak.length ? `
            <div class="row" style="margin-top:16px;flex-wrap:wrap">
              <button class="btn btn-sm btn-primary" type="button" data-ins="weak-quiz">${icons.target} ${t("insights.quizWeakSpots")}</button>
              <button class="btn btn-sm" type="button" data-ins="weak-cards">${icons.cards} ${t("insights.flashcards")}</button>
            </div>` : ""}
        </div>
      </div>

      <div class="panel activity-card">
        <div class="panel-head" style="margin-bottom:4px">
          <div><h2>${t("insights.thisWeek")}</h2><p>${t("insights.weekSub")}</p></div>
          <span class="tiny faint">${data.activity.reduce((sum, a) => sum + a.total, 0)} ${t("insights.actions")}</span>
        </div>
        <div class="activity-chart">
          ${data.activity.map((a) => `
            <div class="act-col">
              <div class="act-bars" title="${a.total} ${t("insights.actions")}">
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
            <div class="row"><span class="tiny" style="color:var(--mint);letter-spacing:.08em;text-transform:uppercase;font-weight:650">${t("insights.aiPlan")}</span></div>
            <div class="plan-actions" style="margin:0">
              <button class="btn btn-sm" type="button" data-ins="plan-copy">${icons.copy} ${t("common.copy")}</button>
              <button class="btn btn-sm" type="button" data-ins="plan">${icons.refresh} ${t("insights.regenerate")}</button>
            </div>
          </div>
          <div class="md">${md(state.plan)}</div>
        </div>` : `
        <div class="plan-box">
          <div class="row-between">
            <div>
              <div style="font-size:14px;font-weight:620">${t("insights.turnIntoPlan")}</div>
              <div class="tiny faint" style="margin-top:4px">${weak.length ? t("insights.prioritizing", { topics: weak.slice(0, 2).map((w) => w.concept).join(LANG === "zh" ? "、" : " and ") }) : t("insights.planDefault")}</div>
            </div>
            <button class="btn btn-primary" type="button" data-ins="plan" ${state.planLoading ? "disabled" : ""}>${state.planLoading ? `<span class="spinner"></span> ${t("insights.writing")}` : `${icons.spark} ${t("insights.generatePlan")}`}</button>
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
      toast(t("insights.planReady"));
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

    $("#lang-btn").addEventListener("click", () => setLang(LANG === "zh" ? "en" : "zh"));

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
          if (!confirm(t("card.leaveNew"))) return;
        }
        state.cards.deck = [];
        state.cards.index = 0;
        state.cards.stats = { known: 0, again: 0 };
        state.cards.loading = false;
        renderCards();
      } else if (state.view === "insights") {
        loadInsights(true);
        toast(t("insights.refreshed"));
      } else if (state.view === "settings") {
        submitSettings();
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
          if (!("speechSynthesis" in window)) { toast(t("chat.speechUnavailable"), "error"); return; }
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
        if (action === "exit") { if (confirm(t("quiz.leaveConfirm"))) { resetQuiz(); renderQuiz(); } return; }
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
      if (action === "exit") { if (confirm(t("card.leaveConfirm"))) { state.cards.deck = []; state.cards.index = 0; renderCards(); } return; }
      if (action === "again") { gradeCard(false); return; }
      if (action === "known") { gradeCard(true); return; }
      if (action === "generate") { generateCards(); return; }
      if (action === "saved") { reviewSavedCards(); return; }
      if (action === "new") { state.cards.deck = []; state.cards.index = 0; state.cards.stats = { known: 0, again: 0 }; renderCards(); return; }
      if (action === "weak") {
        const weak = weakConcepts();
        if (!weak.length) { toast(t("card.noWeak"), "error"); return; }
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
      if (action === "refresh") { loadInsights(true); toast(t("insights.refreshed")); return; }
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

    // Settings delegation
    const settingsBody = $("#settings-body");
    settingsBody.addEventListener("click", (event) => {
      const lang = event.target.closest("[data-lang]");
      if (lang) { setLang(lang.dataset.lang); return; }
      if (event.target.closest("#set-save")) { submitSettings(); return; }
    });

    // Modal delegation
    $("#modal-root").addEventListener("click", (event) => {
      if (event.target.closest("[data-close]")) { closeModal(); return; }
      const ob = event.target.closest("[data-ob]");
      if (ob) { if (ob.dataset.ob === "save") submitOnboarding(); else closeModal(); return; }
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

      if (!typing && !event.metaKey && !event.ctrlKey && !event.altKey && ["1", "2", "3", "4", "5", "6"].includes(event.key)) {
        setView(VIEWS[Number(event.key) - 1]);
      }
    });
  }

  /* ------------------------------------------------------------ settings & i18n */

  function setLang(lang) {
    const next = lang === "zh" ? "zh" : "en";
    if (next === LANG) return;
    LANG = next;
    try { localStorage.setItem("studypal.lang", LANG); } catch (_) { /* ignore */ }
    applyLang();
  }

  function applyLang() {
    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    const lbl = $("#lang-btn-label");
    if (lbl) lbl.textContent = LANG === "zh" ? "EN" : "中文";
    updateTopbar();
    renderSideDocs();
    loadHealth();
    setView(state.view, { skipHash: true });
  }

  async function loadSettings() {
    try {
      const data = await api("/api/settings");
      state.settings = data;
      renderSettings();
      return data;
    } catch (_) {
      state.settings = null;
      renderSettings();
      return null;
    }
  }

  function renderSettings() {
    const box = $("#settings-body");
    if (!box) return;
    const s = state.settings || { has_key: false, base_url: "", model: "" };
    const keyStatus = s.has_key
      ? `${t("settings.keySaved")}${s.key_preview ? " · " + esc(s.key_preview) : ""}`
      : t("settings.keyMissing");
    box.innerHTML = `
      <div class="quiz-setup">
        <div class="panel setup-panel">
          <div class="setup-title">${t("settings.title")}</div>
          <div class="setup-sub">${t("settings.sub")}</div>

          <div class="field">
            <div class="field-label"><span>${t("settings.language")}</span></div>
            <div class="seg">
              <button type="button" class="${LANG === "en" ? "is-on" : ""}" data-lang="en">English</button>
              <button type="button" class="${LANG === "zh" ? "is-on" : ""}" data-lang="zh">中文</button>
            </div>
          </div>

          <div class="field">
            <div class="field-label"><span>${t("settings.apiKey")}</span><span class="field-hint">${keyStatus}</span></div>
            <input class="field-input" type="password" id="set-key" placeholder="${t("settings.keyPlaceholder")}" autocomplete="off" />
            <div class="field-hint" style="margin-top:8px">${t("settings.keyHint")}</div>
          </div>

          <div class="field">
            <div class="field-label"><span>${t("settings.baseUrl")}</span></div>
            <input class="field-input" type="text" id="set-base" value="${esc(s.base_url || "")}" placeholder="https://api.deepseek.com/v1" spellcheck="false" />
            <div class="field-hint" style="margin-top:8px">${t("settings.baseUrlHint")}</div>
          </div>

          <div class="field">
            <div class="field-label"><span>${t("settings.model")}</span></div>
            <input class="field-input" type="text" id="set-model" value="${esc(s.model || "")}" placeholder="deepseek-flash" spellcheck="false" />
          </div>

          <div class="generate-row">
            <button class="btn btn-primary" type="button" id="set-save">${t("settings.save")}</button>
          </div>
        </div>
      </div>`;
  }

  async function saveSettings({ key, base, model } = {}) {
    const payload = {};
    if (key && key.trim()) payload.api_key = key.trim();
    if (base && base.trim()) payload.base_url = base.trim();
    if (model && model.trim()) payload.model = model.trim();
    const data = await api("/api/settings", { method: "PUT", body: JSON.stringify(payload) });
    state.settings = data;
    renderSettings();
    return data;
  }

  async function submitSettings() {
    const key = ($("#set-key") && $("#set-key").value) || "";
    const base = ($("#set-base") && $("#set-base").value) || "";
    const model = ($("#set-model") && $("#set-model").value) || "";
    const btn = $("#set-save");
    if (btn) { btn.disabled = true; btn.textContent = t("settings.testing"); }
    try {
      await saveSettings({ key, base, model });
      toast(t("settings.saved"));
      loadHealth();
    } catch (err) {
      toast(err.message || t("settings.saveFailed"), "error");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = t("settings.save"); }
    }
  }

  function openOnboarding() {
    const s = state.settings || { has_key: false, base_url: "", model: "" };
    openModal(`
      <div class="modal-kicker">StudyPal</div>
      <div class="modal-title">${t("settings.onboardTitle")}</div>
      <div class="modal-sub">${t("settings.onboardSub")}</div>
      <div class="field" style="margin-top:20px">
        <div class="field-label"><span>${t("settings.apiKey")}</span></div>
        <input class="field-input" type="password" id="ob-key" placeholder="${t("settings.keyPlaceholder")}" autocomplete="off" />
        <div class="field-hint" style="margin-top:8px">${t("settings.onboardHint")}</div>
      </div>
      <details class="ob-advanced">
        <summary>${t("settings.advanced")}</summary>
        <div class="field">
          <div class="field-label"><span>${t("settings.baseUrl")}</span></div>
          <input class="field-input" type="text" id="ob-base" value="${esc(s.base_url || "")}" placeholder="https://api.deepseek.com/v1" spellcheck="false" />
        </div>
        <div class="field">
          <div class="field-label"><span>${t("settings.model")}</span></div>
          <input class="field-input" type="text" id="ob-model" value="${esc(s.model || "")}" placeholder="deepseek-flash" spellcheck="false" />
        </div>
      </details>
      <div class="row" style="margin-top:22px;gap:10px;justify-content:flex-end">
        <button class="btn btn-ghost" type="button" data-ob="later">${t("settings.onboardLater")}</button>
        <button class="btn btn-primary" type="button" data-ob="save">${t("settings.onboardSave")}</button>
      </div>`);
  }

  async function submitOnboarding() {
    const key = ($("#ob-key") && $("#ob-key").value) || "";
    const base = ($("#ob-base") && $("#ob-base").value) || "";
    const model = ($("#ob-model") && $("#ob-model").value) || "";
    if (!key.trim() && !(state.settings && state.settings.has_key)) {
      toast(t("settings.keyMissing"), "error");
      return;
    }
    const btn = $(".modal-root [data-ob='save']");
    if (btn) { btn.disabled = true; btn.textContent = t("settings.testing"); }
    try {
      await saveSettings({ key, base, model });
      closeModal();
      toast(t("settings.keySaved"));
      loadHealth();
    } catch (err) {
      if (btn) { btn.disabled = false; btn.textContent = t("settings.onboardSave"); }
      toast(err.message || t("settings.saveFailed"), "error");
    }
  }

  async function maybeShowOnboarding() {
    let s = state.settings;
    if (!s) s = await loadSettings();
    if (!s || !s.has_key) openOnboarding();
  }

  /* ------------------------------------------------------------ boot */

  async function init() {
    bindEvents();
    const hash = location.hash.replace("#", "");
    setView(VIEWS.includes(hash) ? hash : "chat", { skipHash: true });
    applyLang();

    await Promise.all([loadHealth(), loadDocs(), loadSuggestions(), loadInsights(true), loadSettings()]);
    updateScopeUI();
    if (state.docs.some((d) => d.status === "processing")) startPolling();
    setInterval(loadHealth, 30000);

    if (state.view === "chat") {
      setTimeout(() => { const input = $("#chat-input"); if (input) input.focus(); }, 120);
    }

    if (LANG === "zh") applyLang();
    maybeShowOnboarding();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
