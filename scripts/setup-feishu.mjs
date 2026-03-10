#!/usr/bin/env node
/**
 * BestClaw Feishu Notification Setup
 * 设置飞书通知
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const CONFIG_FILE = join(PROJECT_ROOT, '.autodev-config.json');

function showHelp() {
  console.log(`
BestClaw Feishu 通知设置

使用方法:
  node scripts/setup-feishu.mjs [命令] [参数]

命令:
  setup <webhook_url>   设置飞书 webhook
  test                  测试通知
  status                查看当前配置
  env                   显示环境变量配置方式

示例:
  node scripts/setup-feishu.mjs setup https://open.feishu.cn/open-apis/bot/v2/hook/xxx
  node scripts/setup-feishu.mjs test
  
获取 Webhook URL:
  1. 在飞书群聊中添加"自定义机器人"
  2. 复制 webhook 地址
  3. 运行 setup 命令
`);
}

function loadConfig() {
  if (existsSync(CONFIG_FILE)) {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  }
  return {
    version: '1.0.0',
    name: 'BestClaw Auto-Dev System',
    settings: {
      autoExecute: false,
      requireApproval: true,
      maxIterationsPerDay: 24,
      notificationChannel: 'last',
      logFile: '/tmp/bestclaw-cron.log'
    }
  };
}

function saveConfig(config) {
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  console.log('✅ 配置已保存');
}

async function setupWebhook(webhookUrl) {
  if (!webhookUrl || !webhookUrl.includes('open.feishu.cn')) {
    console.error('❌ 无效的飞书 webhook URL');
    console.log('请从飞书群聊的自定义机器人设置中获取');
    return;
  }

  const config = loadConfig();
  config.notifications = config.notifications || {};
  config.notifications.feishu = {
    webhook: webhookUrl,
    enabled: true
  };

  saveConfig(config);
  console.log('✅ 飞书通知已启用');
  console.log(`Webhook: ${webhookUrl}`);
  
  console.log('\n💡 建议测试一下通知功能:');
  console.log('  node scripts/setup-feishu.mjs test');
}

async function testNotification() {
  console.log('🧪 测试飞书通知...\n');
  
  const { FeishuNotifier } = await import('../src/utils/feishu-notifier.js');
  const notifier = new FeishuNotifier(PROJECT_ROOT);
  
  if (!notifier.isEnabled()) {
    console.error('❌ 飞书通知未启用');
    console.log('\n请先设置 webhook:');
    console.log('  node scripts/setup-feishu.mjs setup <webhook_url>');
    return;
  }

  const success = await notifier.notify({
    title: 'BestClaw 测试通知',
    content: '✅ 飞书通知配置成功！\n\n您将在每次迭代时收到通知。',
    type: 'success'
  });

  if (success) {
    console.log('✅ 测试通知已发送，请检查飞书');
  } else {
    console.error('❌ 发送失败，请检查配置');
  }
}

function showStatus() {
  const config = loadConfig();
  
  console.log('📊 飞书通知状态\n');
  console.log('='.repeat(40));
  
  if (config.notifications?.feishu?.enabled) {
    console.log('状态: ✅ 已启用');
    console.log(`Webhook: ${config.notifications.feishu.webhook?.substring(0, 50)}...`);
  } else {
    console.log('状态: ❌ 未启用');
  }
  
  console.log('='.repeat(40));
}

function showEnvSetup() {
  console.log(`
环境变量配置方式

您可以通过环境变量配置飞书通知，无需修改配置文件：

export BESTCLAW_FEISHU_WEBHOOK="https://open.feishu.cn/open-apis/bot/v2/hook/xxx"

可选配置:
export BESTCLAW_FEISHU_USER_ID="ou_xxx"    # 指定接收用户
export BESTCLAW_FEISHU_CHAT_ID="oc_xxx"    # 指定接收群聊

将这些添加到您的 ~/.zshrc 或 ~/.bashrc 文件中。
`);
}

// 主函数
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'setup':
    setupWebhook(arg);
    break;
  case 'test':
    testNotification();
    break;
  case 'status':
    showStatus();
    break;
  case 'env':
    showEnvSetup();
    break;
  default:
    showHelp();
}
