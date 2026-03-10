# BestClaw 飞书通知设置指南

让 BestClaw 自动迭代的状态实时推送到你的飞书！

## 🎯 效果预览

设置完成后，你将收到以下通知：

- ✅ **任务规划完成** - 系统选择下一个开发任务时
- 🚀 **任务开始** - AI 开始编写代码时
- ✅ **任务完成** - 代码提交到 GitHub 后
- ❌ **任务失败** - 构建或提交出错时

---

## 📱 设置步骤

### 第一步：创建飞书机器人

1. **打开飞书**，进入你想接收通知的群聊
2. 点击群聊右上角的 **"..."** → **"设置"**
3. 选择 **"群机器人"** → **"添加机器人"**
4. 选择 **"自定义机器人"**
5. 给机器人起个名字，比如 **"BestClaw 助手"**
6. 点击 **"添加"**
7. **复制 webhook 地址**（格式如：`https://open.feishu.cn/open-apis/bot/v2/hook/xxx`）

### 第二步：配置 BestClaw

#### 方式 A：使用脚本配置（推荐）

```bash
cd ~/dev/openclaw/BestClaw

# 设置 webhook
node scripts/setup-feishu.mjs setup https://open.feishu.cn/open-apis/bot/v2/hook/xxx

# 测试通知
node scripts/setup-feishu.mjs test
```

#### 方式 B：环境变量配置

```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
export BESTCLAW_FEISHU_WEBHOOK="https://open.feishu.cn/open-apis/bot/v2/hook/xxx"

# 使配置生效
source ~/.zshrc
```

#### 方式 C：手动编辑配置

编辑 `.autodev-config.json`：

```json
{
  "notifications": {
    "feishu": {
      "enabled": true,
      "webhook": "https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
    }
  }
}
```

### 第三步：验证设置

```bash
# 查看配置状态
node scripts/setup-feishu.mjs status

# 发送测试消息
node scripts/setup-feishu.mjs test
```

如果成功，你会在飞书群里收到测试消息：

```
✅ BestClaw 测试通知

✅ 飞书通知配置成功！

您将在每次迭代时收到通知。
```

---

## 🔔 通知内容示例

### 任务规划完成
```
ℹ️ BestClaw 迭代规划完成

阶段: Phase 1
下一任务: 错误处理增强
规划时间: 2026-03-11 02:00:00
```

### 任务开发完成
```
✅ BestClaw 任务开发完成

任务: 日志系统
状态: 已完成
提交: a1b2c3d
耗时: 45秒
完成时间: 2026-03-11 01:15:00
```

### 任务开发失败
```
❌ BestClaw 任务开发失败

任务: 日志系统
错误: 构建失败
时间: 2026-03-11 01:15:00
```

---

## 🛠️ 管理命令

```bash
# 查看帮助
node scripts/setup-feishu.mjs

# 查看状态
node scripts/setup-feishu.mjs status

# 设置 webhook
node scripts/setup-feishu.mjs setup <webhook_url>

# 测试通知
node scripts/setup-feishu.mjs test

# 查看环境变量配置方式
node scripts/setup-feishu.mjs env
```

---

## 📋 常见问题

### Q: 为什么没有收到通知？

检查清单：
1. ✅ Webhook URL 是否正确
2. ✅ 机器人是否在群聊中
3. ✅ 网络连接是否正常
4. ✅ 运行 `node scripts/setup-feishu.mjs status` 查看状态

### Q: 可以发送到私聊吗？

目前只支持群聊。如需私聊，可以：
- 创建一个只有自己一个人的群
- 或者等待后续支持个人通知功能

### Q: 如何停用通知？

```bash
# 方式1：禁用配置
# 编辑 .autodev-config.json
# 将 enabled 改为 false

# 方式2：删除环境变量
unset BESTCLAW_FEISHU_WEBSHOOK
```

### Q: 可以自定义通知内容吗？

目前还不支持。如果你有需求，可以修改：
- `src/utils/feishu-notifier.ts` 中的消息格式

---

## 🔐 安全提示

1. **不要**将 webhook URL 提交到 GitHub
2. **不要**在代码中硬编码 webhook URL
3. **使用**环境变量或本地配置文件
4. **定期**更换 webhook URL（如需）

---

## 📝 配置文件说明

`.autodev-config.json` 中的通知配置：

```json
{
  "notifications": {
    "feishu": {
      "enabled": true,           // 是否启用
      "webhook": "xxx",          // webhook 地址
      "userId": "ou_xxx",        // 指定用户（可选）
      "chatId": "oc_xxx"         // 指定群聊（可选）
    }
  }
}
```

---

## 🚀 下一步

设置好飞书通知后，你的 BestClaw 就会自动在每次迭代时发送通知了！

运行一次迭代测试：

```bash
# 手动触发一次迭代
node scripts/auto-dev.mjs
```

你应该会收到飞书通知！🎉
