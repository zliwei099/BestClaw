# BestClaw 🦞

一个简化版的 OpenClaw AI Agent 框架，本地优先、可扩展、支持多渠道接入。

## 项目简介

BestClaw 是一个自主 AI Agent 网关，灵感来源于 [OpenClaw](https://github.com/openclaw/openclaw)。它能够：

- 🤖 **AI 智能助手** - 连接主流大模型（OpenAI、DeepSeek、Anthropic 等）
- 🔧 **技能插件系统** - 通过插件扩展功能（文件操作、命令执行、网络请求等）
- 📱 **多渠道接入** - 支持 CLI、WhatsApp、Telegram、Discord、飞书等
- 🏠 **本地优先** - 数据本地存储，隐私可控
- 🚀 **易于扩展** - 简洁的架构，方便自定义开发

## 快速开始

### 安装

```bash
# 克隆项目
git clone https://github.com/zliwei099/BestClaw.git
cd BestClaw

# 安装依赖
npm install

# 编译 TypeScript
npm run build
```

### 配置

设置环境变量：

```bash
export DEEPSEEK_API_KEY="your-api-key"
# 或
export OPENAI_API_KEY="your-api-key"
```

### 启动

```bash
# 启动交互式聊天
npm run dev chat

# 或启动网关服务
npm run dev start
```

## 项目结构

```
BestClaw/
├── src/
│   ├── core/           # 网关核心
│   ├── agent/          # AI Agent
│   ├── skills/         # 技能系统
│   ├── channels/       # 渠道抽象层
│   ├── tools/          # 工具集
│   ├── types.ts        # 类型定义
│   ├── index.ts        # 主入口
│   └── cli.ts          # CLI 入口
├── skills/             # 自定义技能目录
├── config/             # 配置文件
├── docs/               # 文档
└── tests/              # 测试
```

## 核心功能

### 1. 网关核心 (Gateway)

消息路由和会话管理，处理所有消息的收发和会话状态维护。

### 2. AI Agent

支持多厂商 LLM API：
- OpenAI (GPT-4, GPT-3.5)
- DeepSeek
- Anthropic (Claude)
- 本地模型 (Ollama)

### 3. 技能系统 (Skills)

内置技能：
- **文件操作** - 读取、写入、搜索文件
- **命令执行** - 运行系统命令和脚本
- **网络请求** - HTTP 请求和网页抓取

自定义技能开发：

```typescript
// skills/my-skill/index.ts
import type { Skill } from 'bestclaw';

export default {
  name: 'my-skill',
  description: '我的自定义技能',
  version: '1.0.0',
  tools: [
    {
      name: 'do-something',
      description: '执行某些操作',
      parameters: {
        type: 'object',
        properties: {
          input: { type: 'string' }
        },
        required: ['input']
      },
      handler: async (params) => {
        return { result: `处理: ${params.input}` };
      }
    }
  ],
  execute: async (context) => {
    // 技能执行逻辑
  }
} as Skill;
```

### 4. 渠道系统 (Channels)

已支持：
- ✅ CLI

计划支持：
- 🔄 WhatsApp
- 🔄 Telegram
- 🔄 Discord
- 🔄 飞书
- 🔄 Slack

## 开发计划

- [x] 基础架构搭建
- [x] 网关核心实现
- [x] AI Agent 实现
- [x] 技能系统实现
- [x] 内置工具集（文件、执行、网络）
- [x] CLI 渠道
- [ ] 更多渠道接入
- [ ] 浏览器自动化
- [ ] 向量存储和检索
- [ ] Web UI 控制面板
- [ ] 移动端支持

## 贡献

欢迎提交 Issue 和 PR！

## 许可证

MIT
