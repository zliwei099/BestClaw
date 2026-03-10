#!/usr/bin/env node
/**
 * BestClaw CLI
 * 命令行入口
 */

import { Command } from 'commander';
import { BestClaw } from './index.js';
import type { Config } from './types.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取版本号
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

// 默认配置
const defaultConfig: Config = {
  gateway: {
    port: 18789,
    host: '127.0.0.1',
    logLevel: 'info'
  },
  channels: {
    cli: { enabled: true }
  },
  llm: {
    provider: 'deepseek',
    model: 'deepseek-chat',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    temperature: 0.7,
    maxTokens: 2000
  },
  skills: []
};

const program = new Command();

program
  .name('bestclaw')
  .description('BestClaw - 简化版 OpenClaw AI Agent 框架')
  .version(packageJson.version);

// start 命令 - 启动网关
program
  .command('start')
  .description('启动 BestClaw 网关')
  .option('-p, --port <port>', '网关端口', '18789')
  .option('-h, --host <host>', '网关主机', '127.0.0.1')
  .action(async (options) => {
    const config: Config = {
      ...defaultConfig,
      gateway: {
        ...defaultConfig.gateway,
        port: parseInt(options.port),
        host: options.host
      }
    };

    const app = new BestClaw({ config });

    // 优雅关闭
    process.on('SIGINT', async () => {
      await app.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await app.stop();
      process.exit(0);
    });

    await app.start();
  });

// chat 命令 - 交互式聊天
program
  .command('chat')
  .description('启动交互式聊天')
  .action(async () => {
    const config: Config = {
      ...defaultConfig,
      channels: {
        cli: { enabled: true }
      }
    };

    const app = new BestClaw({ config });

    process.on('SIGINT', async () => {
      await app.stop();
      process.exit(0);
    });

    await app.start();
  });

// config 命令 - 显示配置
program
  .command('config')
  .description('显示当前配置')
  .action(() => {
    console.log('Current configuration:');
    console.log(JSON.stringify(defaultConfig, null, 2));
  });

// 解析命令行参数
program.parse();

// 如果没有提供命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
