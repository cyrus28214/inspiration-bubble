# Inspiration Bubble (Beta) 🫧

Inspiration Bubble 是一个基于 AI 的灵感捕捉与思维导图生成工具。它允许用户通过语音或文本输入想法，利用大语言模型（LLM）实时分析上下文，自动生成和扩展思维导图结构。

本项目采用前后端分离架构，前端使用 Svelte 构建现代化的交互界面，后端基于 FastAPI 和 Pydantic AI 提供智能代理服务。

## ✨ 主要功能

*   **🗣️ 语音/文本双模输入**: 支持实时语音转文字（STT）和文本直接通过，无缝捕捉灵感。
*   **🧠 AI 智能分析**:后端集成 LLM Agent，根据当前输入及历史对话上下文，智能推断节点关系，自动更新思维导图。
*   **🗺️ 交互式思维导图**: 基于 `simple-mind-map` 实现，支持节点的自动布局、拖拽、缩放及编辑。
*   **🔒 实时反馈与锁定**: 在 AI 分析过程中，界面会自动锁定并提供加载反馈，防止冲突操作。
*   **📝 结构化历史**: 记录用户的灵感历史，保留上下文以供 AI 进行深度分析。

## 🛠️ 技术栈

### Frontend (前端)
*   **Framework**: [Svelte 5](https://svelte.dev/) (Reactive UI)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Language**: TypeScript
*   **Visualization**: [simple-mind-map](https://github.com/wanglin2/simple-mind-map)
*   **Package Manager**: `pnpm`

### Backend (后端)
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
*   **AI Framework**: [Pydantic AI](https://github.com/pydantic/pydantic-ai)
*   **Language**: Python 3.10+
*   **Package/Env Manager**: `uv`

---

## 🚀 快速开始

### 1. 环境准备

确保你的系统已安装：
*   Node.js & pnpm
*   Python & [uv](https://github.com/astral-sh/uv)

### 2. 后端设置 (Backend)

进入后端目录并配置环境变量：

```bash
cd backend

# 创建 .env 文件 (参考)
touch .env
```

在 `.env` 文件中填入必要的 LLM 配置 (基于 `config.py`):

```env
MODEL_SCOPE_API_KEY=your_api_key
MODEL_SCOPE_URL=https://api.openai.com/v1  # 或其他兼容 OpenAI 格式的 endpoint
MODEL_NAME=gpt-4o  # 或其他模型名称
```

运行后端服务：

```bash
# 使用 uv 同步依赖并运行
uv sync
uv run main.py
```

后端服务默认运行在 `http://0.0.0.0:8000`。
API 文档地址: `http://localhost:8000/docs`

### 3. 前端设置 (Frontend)

进入前端目录并启动开发服务器：

```bash
cd frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

前端页面默认运行在 `http://localhost:5173`。

---

## 📂 项目结构

```text
InspirationBubble-beta/
├── backend/                #后端服务
│   ├── main.py             # FastAPI 入口
│   ├── mindmap.py          # AI Agent 核心逻辑
│   ├── models.py           # Pydantic 数据模型
│   ├── config.py           # 配置管理
│   ├── openapi.yaml        # API 规范定义
│   └── pyproject.toml      # Python 依赖管理
│
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts      # API 接口定义
│   │   │   ├── components/ # Svelte 组件 (MindMap, InputSection, etc.)
│   │   │   ├── stores.ts   # Svelte 状态管理 (MindNode 数据结构)
│   │   │   └── utils/      # 工具函数 (数据转换等)
│   │   ├── App.svelte      # 根组件
│   │   └── main.ts         # 入口文件
│   └── vite.config.ts      # Vite 配置
│
└── README.md
```

## 🐳 Docker 部署 (Deployment)

本项目支持使用 Docker (或 Podman) 进行一键构建和部署。应用包含 Nginx 反向代理，统一部署在 7860 端口。

### 1. 构建镜像 (Build)

在项目根目录下运行以下命令构建镜像：

```bash
# 使用 Docker
docker build -t inspiration-bubble .

# 使用 Podman
podman build -t inspiration-bubble .
```

### 2. 运行容器 (Run)

启动容器并将容器内的 `7860` 端口映射到宿主机。

```bash
# 使用 Docker
docker run --rm -it -p 7860:7860 inspiration-bubble

# 使用 Podman
podman run --rm -it -p 7860:7860 inspiration-bubble
```

*   `--rm`: 容器停止后自动删除
*   `-it`: 交互模式 (显示日志)
*   `-p 7860:7860`: 端口映射

### 3. 访问应用

当终端显示 `Uvicorn running on ...` 时，打开浏览器访问：

👉 [http://localhost:7860](http://localhost:7860)
