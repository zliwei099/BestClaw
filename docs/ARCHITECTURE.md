# BestClaw 项目文档

## 架构设计

### 核心组件

```
┌─────────────────────────────────────────────────────────────┐
│                        BestClaw Gateway                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Gateway   │  │    Agent    │  │   Skills Manager    │ │
│  │   (核心)    │  │  (AI 核心)  │  │    (技能管理)        │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                    │            │
│         └────────────────┼────────────────────┘            │
│                          │                                 │
│  ┌───────────────────────┴─────────────────────────────┐   │
│  │                  Channels (渠道层)                    │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐   │   │
│  │  │  CLI   │ │Telegram│ │Discord │ │  Feishu    │   │   │
│  │  └────────┘ └────────┘ └────────┘ └────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 数据流

1. 用户通过渠道发送消息
2. Gateway 接收消息并创建/更新会话
3. Agent 处理消息，调用 LLM
4. Agent 根据需要调用 Skills/Tools
5. 响应通过渠道返回给用户

## 扩展开发

### 添加新渠道

```typescript
import { Channel } from 'bestclaw';

export class MyChannel extends Channel {
  async connect(): Promise<void> {
    // 连接逻辑
  }

  async disconnect(): Promise<void> {
    // 断开连接
  }

  async sendMessage(to: string, content: string): Promise<void> {
    // 发送消息
  }
}
```

### 添加新技能

```typescript
// skills/custom-skill/index.ts
export default {
  name: 'custom-skill',
  description: '自定义技能',
  version: '1.0.0',
  tools: [...],
  execute: async (context) => {
    // 技能逻辑
  }
};
```

## API 参考

### Gateway

```typescript
class Gateway {
  start(): Promise<void>
  stop(): Promise<void>
  receiveMessage(message: Message): Promise<void>
  sendMessage(sessionId: string, content: string): Promise<void>
  onEvent(type: EventType, handler: EventHandler): void
}
```

### Agent

```typescript
class Agent {
  process(message: Message, session: Session): Promise<AgentResponse>
  registerTool(tool: Tool): void
  getTools(): Tool[]
}
```

### SkillsManager

```typescript
class SkillsManager {
  initialize(): Promise<void>
  registerSkill(skill: Skill): void
  executeSkill(name: string, context: SkillContext): Promise<any>
  getAllTools(): Tool[]
}
```

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | - |
| `OPENAI_API_KEY` | OpenAI API 密钥 | - |
| `ANTHROPIC_API_KEY` | Anthropic API 密钥 | - |

### 配置文件

```json
{
  "gateway": {
    "port": 18789,
    "host": "127.0.0.1",
    "logLevel": "info"
  },
  "llm": {
    "provider": "deepseek",
    "model": "deepseek-chat",
    "temperature": 0.7,
    "maxTokens": 2000
  },
  "channels": {
    "cli": { "enabled": true }
  }
}
```

## 开发规范

### 代码风格

- 使用 TypeScript
- 遵循 ESLint 规范
- 函数和类使用 JSDoc 注释

### 提交规范

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具相关

## 迭代记录

### v1.0.0 (2026-03-11)

- ✅ 基础架构搭建
- ✅ 网关核心实现
- ✅ AI Agent 实现
- ✅ 技能系统实现
- ✅ 内置工具集
- ✅ CLI 渠道

### 计划

- [ ] Telegram 渠道
- [ ] Discord 渠道
- [ ] 飞书渠道
- [ ] Web UI
- [ ] 浏览器自动化
- [ ] 向量存储
