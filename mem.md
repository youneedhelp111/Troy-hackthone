# StudyPal — 记忆与项目简要（mem.md）

> 生成：2026-11-01 · Troy Hackathon 2026 ·「方向2 — Language Models」
> 用途：给未来接手的会话/协作者的项目记忆 + 简要，读这一页即可快速进入状态。

## 一句话

StudyPal 把课程材料（PDF / PPTX / DOCX / MD）本地索引后，用 DeepSeek 云端推理提供**带页码引用**的问答、练习测验、闪卡、学习洞察。

## 项目简要

- **定位**：AI 学习搭子（AI study buddy），黑客松参赛项目。
- **后端**：FastAPI + Uvicorn，Python 3.13，`app/main.py`。
- **前端**：原生 JS 单页应用（无构建步骤），`static/`。
- **数据库**：SQLite（WAL + FTS5，CJK bigram 分词，支持中文检索）。
- **RAG**：本地 embedding（Ollama `nomic-embed-text`，768 维余弦）+ BM25，RRF 融合 + 相似度阈值防跨文档泄漏。
- **LLM**：DeepSeek 云端 API（`deepseek-flash`，OpenAI 兼容，SSE 流式）。

### 6 个视图

Chat / Materials / Practice(Quiz) / Flashcards / Insights / Settings，外加顶部**中英文切换**。

### 完成度

核心功能全部完成，后端各端点已逐项实测通过。

## 关键记忆（非显然点）

- **API key 位置**：`studypal/.env` 的 `DEEPSEEK_KEY`（已 gitignore，**勿提交 / 勿公开**）。用户可在前端 Settings 页改 key / base_url / model，写入 DB `settings` 表即时覆盖 `.env`，无需重启。
- **仓库**：`https://github.com/youneedhelp111/Troy-hackthone`（**当前 PUBLIC**）。可见性 keep-public / private / delete **尚未最终决定**。
- **embedding 回退**：设 `EMBED_PROVIDER=none` 可退回纯 BM25（全云端，无需本地 Ollama）。
- **语言切换**：`localStorage["studypal.lang"]`，`I18N` 字典 en/zh，`t(key)` 取词。
- **首次引导**：`has_key=false` 时前端自动弹「连接 DeepSeek」弹窗。
- **运行时设置**：`app/settings.py` 每次请求实时读 DB，改设置即时生效。
- **端口**：`127.0.0.1:8000`（仅本机，未暴露外网）。

## 部署 / 运行

- **一键**：`lazy_start.bat`（装 Python → 装依赖 → 启动 + 开浏览器 → 停止后自动 commit + push）。
- **常规**：`python run.py`（或 `start.bat` / `start.sh`）。
- **依赖**：`pip install -r requirements.txt`。
- **新机器**：装 Git → `git clone` → 双击 `lazy_start.bat`。

## 文件结构

```
studypal/
  app/        main.py(路由) rag.py(检索) ingest.py(解析/索引) llm.py(DeepSeek)
              settings.py(运行时设置) db.py(SQLite/FTS5) config.py prompts.py
  static/     index.html app.js styles.css
  data/       SQLite + 上传（gitignored）
  docs/       PPT（中英两版）截图 build_pitch*.py
  sample_data/  示例材料（ML 讲义 + OS 笔记）
  HANDOFF.md  详细交接文档
  mem.md      本文件
```

## 待办 / 待决策

1. **仓库可见性**：keep public / make private / delete（未定）。
2. 前端建议做一次真实浏览器 smoke test（i18n + 设置页 + 首次引导弹窗）。
3. fork 会话已全部删除，仅保留主会话（已清理）。

## 给未来会话的提示

- 改完前端后浏览器要**硬刷新（Ctrl+Shift+R）**，否则可能看到旧缓存。
- DeepSeek key 只存在于本机 `.env` 和 `data/studypal.db`；新机器 clone 后没有，需重新填或走首次引导。
- 换 embedding 模型要同步改 `.env` 的 `EMBED_DIM`。
- 提交时记得 `.env` 与 `data/` 已被 gitignore，`git add -A` 不会误提交密钥。
