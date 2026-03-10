# 🦞 BestClaw 24小时自动迭代系统

BestClaw 现在具备**24小时自动迭代开发**能力！系统每小时自动规划并执行开发任务，实现项目的自我进化。

## 🚀 快速开始

```bash
# 查看系统状态
cd ~/dev/openclaw/BestClaw
node scripts/monitor.mjs

# 查看定时任务
openclaw cron list

# 查看开发日志
tail -f /tmp/bestclaw-cron.log
```

## ⚙️ 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                   OpenClaw Gateway                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐                                        │
│  │  Cron Scheduler │──▶ 每小时触发                          │
│  │  (定时任务调度)  │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐     ┌─────────────────┐                │
│  │   Task Planner  │──▶  │  AI Developer   │                │
│  │   (任务规划器)   │     │   (AI开发代理)   │                │
│  └─────────────────┘     └────────┬────────┘                │
│                                    │                         │
│                                    ▼                         │
│                           ┌─────────────────┐                │
│                           │  GitHub Commit  │                │
│                           │   (代码提交)     │                │
│                           └─────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📅 定时任务

| 任务 | 频率 | 状态 |
|------|------|------|
| bestclaw-plan-task | 每小时 | ✅ 运行中 |

## 🔄 迭代流程

1. **每小时整点** - Cron 任务触发
2. **规划任务** - 选择路线图中的下一个任务
3. **AI 开发** - 实现功能、编写代码
4. **测试验证** - 运行构建确保无错误
5. **提交代码** - 推送到 GitHub
6. **更新文档** - 记录开发进度到飞书

## 📊 监控命令

```bash
# 系统状态
node scripts/monitor.mjs

# Cron 管理
openclaw cron list          # 列出任务
openclaw cron disable bestclaw-plan-task  # 暂停
openclaw cron enable bestclaw-plan-task   # 恢复
openclaw cron run bestclaw-plan-task      # 立即执行

# 开发管理
node scripts/auto-dev.mjs       # 手动规划任务
node scripts/execute-task.mjs   # 手动执行任务
```

## 📈 开发进度

### Phase 1: 核心完善 ✅
- [x] 配置文件系统
- [ ] 日志系统 (下一个)
- [ ] 错误处理增强

### Phase 2: 渠道扩展
- [ ] Telegram 渠道
- [ ] Discord 渠道
- [ ] 飞书渠道

### Phase 3: 能力增强
- [ ] 浏览器自动化
- [ ] 向量存储

## 📚 文档

- [项目开发记录](https://www.feishu.cn/docx/VwNLdowsjoGQBAxk5xWc7YsVnlf)
- [定时迭代系统](https://www.feishu.cn/docx/TGDMdaHm3o0b87xqv8cc1bqpncd)
- [架构设计](docs/ARCHITECTURE.md)
- [使用指南](docs/AUTO_DEV_GUIDE.md)

## 🔧 配置

系统配置文件: `.autodev-config.json`

```json
{
  "settings": {
    "autoExecute": false,
    "requireApproval": true,
    "maxIterationsPerDay": 24
  }
}
```

## ⚠️ 注意事项

1. 自动生成的代码建议人工审查
2. API 密钥通过环境变量管理
3. 失败任务会记录到日志，不影响后续迭代
4. 可通过 `openclaw cron disable` 随时暂停

---

*让代码自己写代码* 🚀
