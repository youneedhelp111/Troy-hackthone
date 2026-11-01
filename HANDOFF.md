# StudyPal — 交接说明（HANDOFF）

> 面向：接手本项目的下一个 Claude 会话 / 协作者。读完这页即可直接继续，无需重新摸索。
> 生成时间：2026-11-01

## 项目一句话
Troy Hackathon「方向2 — Language Models」参赛项目 **StudyPal**：把课程材料（PDF/PPTX/DOCX/MD）本地索引后，用 DeepSeek 云端推理提供**带页码引用**的问答、练习测验、闪卡、学习洞察。

技术主线：RAG = 本地 embedding + BM25 混合检索 + RRF 融合；前端为原生 JS 单页应用（无构建步骤）；SSE 流式输出。

## 当前完成度：核心功能全部完成 ✅

### 后端（已逐项实测通过）
- FastAPI + Uvicorn（`app/main.py`），Python 3.13
- RAG：Ollama `nomic-embed-text`（768 维余弦）+ SQLite FTS5 BM25，RRF 融合 + 相似度阈值防文档泄漏
- DeepSeek 云端 API（`deepseek-flash`，OpenAI 兼容 `/chat/completions`，SSE 流式）
- SQLite WAL + FTS5（`unicode61 remove_diacritics 2`，CJK bigram 分词）
- 端点全部验证：chat / 上传 / quiz / flashcards / insights(analytics) / study-plan / health / settings

### 前端（`static/`，原生 JS SPA）
- 6 个视图：Chat / Materials / Practice(Quiz) / Flashcards / Insights / Settings
- **语言切换**：顶部地球按钮，中/英（`I18N` 字典 + `localStorage studypal.lang`）
- **设置面板**：用户自填 API Key / 域名(base URL) / 模型 → 写入 DB `settings` 表覆盖 `.env`（`GET/PUT /api/settings`）
- **首次部署引导**：启动时若 `has_key=false` 自动弹「连接 DeepSeek 密钥」弹窗（可折叠高级项含域名/模型；可跳过）
  - ⚠️ 本机 `.env` 已有 key → `has_key=true`，**不会弹**；全新 clone / key 留空才会弹
- 提交：`a9e6954 "Complete frontend i18n and Settings wiring"`

### 路演 PPT（两版，均已验证可打开）
- 中文：`docs/StudyPal-路演.pptx`（14 页）
- 英文：`docs/StudyPal-Pitch-EN.pptx`（14 页）
- 生成脚本：`docs/build_pitch.py`、`docs/build_pitch_en.py`

### 文档与素材
- `README.md` / `README.zh.md`、`BACKEND.md`、`DESIGN.md`、`requirements.txt`
- 截图：`docs/chat.png` `docs/materials.png` `docs/quiz.png` `docs/insights.png`
- 示例材料：`sample_data/`（ML 讲义 + OS 期中笔记 md/pdf）

## 如何运行
```bash
cd "C:\Users\King\Desktop\大四上学习生活\Troy Hackthone\studypal"
pip install -r requirements.txt
python run.py        # 或双击 run.cmd / start.bat，自动开浏览器 → http://127.0.0.1:8000
```
前置：
- `.env` 已配 `DEEPSEEK_KEY`（本机已配好，**勿提交**）
- embeddings 需本机 Ollama 已 `pull nomic-embed-text`；设 `EMBED_PROVIDER=none` 可退回纯 BM25（全云端，无需本地 Ollama）

## ⚠️ 安全红线
- `.env`（含真实 DeepSeek key）与 `data/` 已 gitignore，**绝对不能提交 / 公开**
- 已核验：仓库内 `git grep` 检索 key → **0 命中**，密钥未进任何被跟踪文件

## Git / 部署状态
- 仓库：`https://github.com/youneedhelp111/Troy-hackthone`（**当前 PUBLIC**）
- 分支 `main`，最新提交 `a9e6954`（已 push）
- 提交历史：`a9e6954` 前端 i18n+设置 · `bb54f57` 双语 README+一键启动+浏览器内配 key · `1617932` 初版

## 待办 / 待用户决策
1. **公开仓库可见性**：keep public / make private / delete —— 未定（密钥已确认没进库，公开也安全）
2. **前端浏览器实测**：i18n + 设置面板由 fork 用 grep/curl 自查（本机无 node，跑不了 `node --check`），**尚未人工目视确认**，建议做一次浏览器 smoke test
3. **会话清理**：还有 bg fork 待关；用户计划开全新会话接管

## 新会话接手清单
1. 读 `app/main.py`（后端全貌）→ `static/app.js`（前端全貌）→ `docs/StudyPal-路演.pptx`（路演稿）
2. 起服务 `python run.py`，浏览器逐页点一遍（尤其语言切换 + 设置 + 首次引导）
3. 若需演示「首次部署询问 API」：把 `.env` 的 `DEEPSEEK_KEY=` 留空再启动即可触发
