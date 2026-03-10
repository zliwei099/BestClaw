# BestClaw 自动迭代系统使用指南

## 系统概述

BestClaw 自动迭代系统允许项目**自我持续开发**，通过 AI 代理自动完成开发任务。

```
┌─────────────────────────────────────────────────────────────┐
│                    自动迭代循环                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. 规划任务  ──▶  2. 实现功能  ──▶  3. 测试验证            │
│        ▲                                     │              │
│        │                                     ▼              │
│   5. 下一轮迭代  ◀──  4. 提交推送  ◀──  完成                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 快速开始

### 方式1: 手动触发迭代

```bash
# 1. 进入项目目录
cd ~/dev/openclaw/BestClaw

# 2. 规划下一个任务
node scripts/auto-dev.mjs

# 3. 实现任务 (由 AI 代理执行)
# 这一步需要人工或 AI 代理介入

# 4. 完成任务并提交
node scripts/execute-task.mjs
```

### 方式2: 使用 OpenClaw Cron 定时迭代

在你的 OpenClaw 配置中添加 cron 任务：

```bash
# 每小时检查并开发
openclaw cron add --name bestclaw-dev --schedule "0 * * * *" \
  --command "cd ~/dev/openclaw/BestClaw && node scripts/auto-dev.mjs"

# 或每4小时执行一次完整迭代
openclaw cron add --name bestclaw-iteration --schedule "0 */4 * * *" \
  --command "cd ~/dev/openclaw/BestClaw && node scripts/auto-dev.mjs && node scripts/execute-task.mjs"
```

### 方式3: Heartbeat 驱动开发

在 `~/.openclaw/workspace/HEARTBEAT.md` 中添加：

```markdown
# HEARTBEAT.md

## BestClaw Auto-Dev Check

- [ ] 检查是否需要开发迭代
- [ ] 运行: cd ~/dev/openclaw/BestClaw && node scripts/auto-dev.mjs
```

## 开发路线图

### Phase 1: 核心完善 (当前)
- [x] 配置文件系统
- [ ] 日志系统
- [ ] 错误处理增强

### Phase 2: 渠道扩展
- [ ] Telegram 渠道
- [ ] Discord 渠道
- [ ] 飞书渠道

### Phase 3: 能力增强
- [ ] 浏览器自动化
- [ ] 向量存储
- [ ] 任务调度

### Phase 4: 生态建设
- [ ] Web UI
- [ ] 移动端 App
- [ ] 插件市场

## 如何添加新任务

编辑 `scripts/auto-dev.mjs` 中的 `roadmap` 数组：

```javascript
const roadmap = [
  {
    id: 'unique-task-id',
    phase: 'Phase X',
    title: '任务名称',
    description: '任务描述',
    priority: 'high',  // high | medium | low
    status: 'todo',
    dependencies: ['dependency-task-id']  // 可选
  }
];
```

## 状态文件

`.dev-state.json` 记录开发状态：

```json
{
  "currentPhase": "Phase 1",
  "completedTasks": ["config-system"],
  "inProgressTask": null,
  "lastIteration": "2026-03-11T01:00:00.000Z",
  "iterationCount": 1
}
```

## CLI 命令

```bash
# 查看开发状态
bestclaw dev --status

# 规划下一个任务
bestclaw dev --plan

# 初始化配置文件
bestclaw config --init

# 查看当前配置
bestclaw config --show
```

## AI 代理集成

要让 AI 代理执行实际开发，可以使用：

```bash
# 启动 AI 开发代理
openclaw spawn-agent --name BestClaw-Dev \
  --task "读取 ~/dev/openclaw/BestClaw/.current-task.md，实现该功能，提交代码"
```

## 监控与日志

### 查看开发日志
```bash
tail -f docs/PROGRESS.md
```

### 查看 Git 提交历史
```bash
cd ~/dev/openclaw/BestClaw && git log --oneline
```

## 注意事项

1. **代码审查**: 自动生成的代码需要人工审查
2. **测试覆盖**: 确保添加足够的测试用例
3. **安全性**: 注意 API 密钥等敏感信息的处理
4. **资源限制**: 控制开发频率，避免 API 调用超限

## 自定义开发策略

可以修改 `scripts/` 目录下的脚本来自定义开发流程：

- `auto-dev.mjs` - 任务规划
- `execute-task.mjs` - 任务执行

例如，添加代码审查步骤：

```javascript
// 在 execute-task.mjs 中添加
if (!runCommand('npm run lint', '代码检查')) {
  console.error('代码检查未通过');
  return;
}
```

## 未来计划

- [ ] 智能任务分解
- [ ] 代码自动生成
- [ ] 自动测试生成
- [ ] Bug 自动修复
- [ ] 代码重构建议
