#!/usr/bin/env node
/**
 * BestClaw CLI
 * 命令行入口
 */

import { Command } from 'commander';
import { BestClaw } from './index.js';
import { ConfigManager } from './core/config.js';
import type { Config } from './types.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 读取版本号
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program
  .name('bestclaw')
  .description('BestClaw - 简化版 OpenClaw AI Agent 框架')
  .version(packageJson.version);

// start 命令 - 启动网关
program
  .command('start')
  .description('启动 BestClaw 网关')
  .option('-p, --port <port>', '网关端口')
  .option('-h, --host <host>', '网关主机')
  .option('-c, --config <path>', '配置文件路径')
  .action(async (options) => {
    // 初始化配置管理器
    const configManager = new ConfigManager({
      configPath: options.config
    });
    
    // 从环境变量加载
    configManager.loadFromEnv();
    
    // 命令行参数覆盖
    if (options.port) {
      configManager.updateGatewayConfig({ port: parseInt(options.port) });
    }
    if (options.host) {
      configManager.updateGatewayConfig({ host: options.host });
    }
    
    const config = configManager.getConfig();

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
  .option('-c, --config <path>', '配置文件路径')
  .action(async (options) => {
    const configManager = new ConfigManager({
      configPath: options.config
    });
    configManager.loadFromEnv();
    
    const config = configManager.getConfig();

    const app = new BestClaw({ config });

    process.on('SIGINT', async () => {
      await app.stop();
      process.exit(0);
    });

    await app.start();
  });

// config 命令 - 配置管理
program
  .command('config')
  .description('配置管理')
  .option('-c, --config <path>', '配置文件路径')
  .option('-i, --init', '创建默认配置文件')
  .option('-s, --show', '显示当前配置')
  .action(async (options) => {
    const configManager = new ConfigManager({
      configPath: options.config
    });
    
    if (options.init) {
      configManager.createDefaultConfig();
      console.log('✅ 默认配置文件已创建');
      return;
    }
    
    if (options.show || (!options.init)) {
      console.log('Current configuration:');
      console.log(JSON.stringify(configManager.getConfig(), null, 2));
      console.log(`\nConfig file location: ${configManager.getConfigPath()}`);
      console.log(`Config exists: ${configManager.configExists() ? 'Yes' : 'No'}`);
    }
  });

// dev 命令 - 开发工具
program
  .command('dev')
  .description('开发工具')
  .option('--plan', '规划下一个开发任务')
  .option('--status', '查看开发状态')
  .action(async (options) => {
    if (options.plan) {
      const { execSync } = await import('child_process');
      execSync('node scripts/auto-dev.mjs', { stdio: 'inherit' });
      return;
    }
    
    if (options.status) {
      const { existsSync, readFileSync } = await import('fs');
      const stateFile = '.dev-state.json';
      if (existsSync(stateFile)) {
        const state = JSON.parse(readFileSync(stateFile, 'utf-8'));
        console.log('📊 开发状态:');
        console.log(`   当前阶段: ${state.currentPhase}`);
        console.log(`   已完成任务: ${state.completedTasks.length}`);
        console.log(`   迭代次数: ${state.iterationCount}`);
        if (state.inProgressTask) {
          console.log(`   进行中任务: ${state.inProgressTask}`);
        }
      } else {
        console.log('暂无开发状态记录');
      }
    }
  });

// 解析命令行参数
program.parse();

// 如果没有提供命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
