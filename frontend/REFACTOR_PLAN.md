# 项目重构功能比对与计划 (Refactoring Gap Analysis & Plan)

## 1. 概览 (Overview)

通过对比原版项目 `MVP_Upload/app.js` 与 Svelte 重构版 `InspirationBubble-beta/inspiration-bubble`，发现 Svelte 版本虽然完成了基础架构和部分组件的迁移，但在**核心交互逻辑**、**数据层集成**以及**复杂排版算法**方面仍有大量功能缺失。

以下是详细的功能差异分析及后续实施计划。

## 2. 功能差异矩阵 (Feature Gap Matrix)

| 模块 (Module) | 功能点 (Feature) | 原版 (Original) | Svelte 版 (Current State) | 缺口等级 (Severity) |
| :--- | :--- | :--- | :--- | :--- |
| **💡 输入与处理** | **后端 API 集成** | 真实调用 `/api/analyze` (或其他端点) 获取分析数据 | Mock 模拟数据 (随机位置、硬编码文本) | 🔴 严重 |
| **🕸️ 可视化核心** | **混合排版/力导向** | 包含复杂的**级联思维导图算法 (V2)** + 力导向模拟 | 仅有力导向模拟 (Force Simulation) | 🔴 严重 |
| | **自动排版/折叠** | 支持一键自动排版、自动收起拥挤节点 (Auto-Collapse) | 按钮存在但无逻辑绑定 | 🔴 严重 |
| | **右键交互** | 右键菜单：设为核心、删除节点 (递归删除) | 组件内有事件发出的代码，但父级未处理，功能未实装 | 🔴 严重 |
| | **节点折叠 (Expand)** | 气泡上有折叠/展开子节点的 `+` 按钮逻辑 | 未实装 | 🟠 中等 |
| **📝 侧边栏/信息** | **思维导图视图** | 层次化的文本树形视图 (Sidebar Mindmap Tree) | **完全缺失** | 🔴 严重 |
| | **AI 灵感推荐** | 异步加载 AI 总结与标签 (`summarizeSearchResult`) | 仅渲染静态列表，缺乏异步获取详情的逻辑 | 🟠 中等 |
| | **历史记录** | 展开查看详细 Summary，标签展示 | 已实现基础展开，需微调样式细节 | 🟢 已完成 |
| | **会议纪要** | 实时语音转写 + 下载带格式的 .txt | 基础转写已实现，下载格式需对齐原版头部/尾部信息 | 🟡 轻微 |

## 3. 详细待办计划 (Implementation Plan)

### 阶段一：核心可视化与交互完善 (Core Visualization)

- [x] **实现右键菜单系统 (Context Menu)**
    - [x] 在 `BubbleCanvas` 或全局层级添加 `ContextMenu` 组件。
    - [x] 实现 `toggleCore` (设为/取消核心) 逻辑及样式更新。
    - [x] 实现 `deleteWithDescendants` (递归删除节点及其子节点) 逻辑。
    - [x] 绑定 `Bubble` 组件的 `contextmenu` 事件。

- [ ] **移植级联排版算法 (Cascading Layout)**
    - 将 `app.js` 中的 `applyMindMapLayout`、`calculateSubtreeHeight`、`assignCoords` 等逻辑移植到 `simulation.ts` 或新建布局工具类。
    - 实现 `performAutoCollapse` 逻辑，处理节点过多时的自动折叠。
    - 激活顶部的 `自动排版` 按钮。

- [ ] **完善节点折叠/展开功能**
    - 在 `Bubble` 组件中完善折叠按钮 UI（当有子节点时显示）。
    - 实现 `toggleCollapse` 状态更新，并联动排版算法。

### 阶段二：后端重构与数据对接 (Backend Refactoring & Integration)

**目标 (Goal):** 采用 API-First 模式，使用 FastAPI 重构后端，并优化 API 接口设计。

- [x] **API 协议设计 (API Design First)**
    - [x] 分析原有 `MVP_Upload` 业务逻辑，梳理所有数据交互需求。
    - [x] 编写 OpenAPI (Swagger) 规范文档 (`openapi.yaml` 或 `.json`)。
    - [ ] 优化接口结构（RESTful 风格），明确 Request/Response 类型定义。

- [ ] **后端实现 (FastAPI Implementation)**
    - 初始化 FastAPI 项目结构。
    - 实现核心业务端点：
      - `POST /api/analyze` (想法分析与气泡生成)
      - `GET /api/inspiration` (灵感推荐获取)
      - `POST /api/summarize` (灵感内容总结)
    - 集成 AI 服务 (LLM 调用、搜索引擎 API 等)。

- [ ] **前端对接 (Frontend Integration)**
    - 生成或编写 TypeScript 类型定义 (Interfaces) 以匹配 OpenAPI 规范。
    - 使用 `fetch` 或 `axios` 封装强类型的 API Client。
    - 移除 `InputSection` 中的 Mock 数据，接入真实 `POST /api/analyze` 接口。
    - 在 `InspirationSection` 中接入 `GET /api/inspiration` 及 `POST /api/summarize` 异步接口。
    - 确保 API 返回数据正确映射到 Svelte Store (`thoughts`, `keywords`, `connections`)。

### 阶段三：缺失组件补全 (Missing Components)

- [ ] **开发 Mindmap Tree 视图**
    - 在 Sidebar (可能是右侧) 新增 `MindMapSection` 组件。
    - 实现递归渲染树形结构的组件，展示层次化的文本摘要。
    - 确保树形节点点击能联动高亮画布上的气泡 (可选增强)。

### 阶段四：细节打磨 (Polishing)

- [ ] **会议纪要增强**
    - 优化 `downloadMinutes` 方法，添加原版中的 "灵感气泡 - AI会议纪要" 头部和尾部签名。
- [ ] **动画效果**
    - 检查节点 Entering/Exiting 动画，确保删除节点时有过渡效果。

---

*该计划旨在1:1还原原版核心功能，作为重构的开发指引。*
