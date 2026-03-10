#!/usr/bin/env node
/**
 * BestClaw Auto-Dev Monitor
 * 监控自动开发系统状态
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const STATE_FILE = join(PROJECT_ROOT, '.dev-state.json');
const LOG_FILE = '/tmp/bestclaw-cron.log';

function loadState() {
  if (!existsSync(STATE_FILE)) {
    return null;
  }
  return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
}

function showStatus() {
  console.log('🦞 BestClaw Auto-Dev System Status\n');
  console.log('=' .repeat(50));
  
  // 1. Cron 任务状态
  console.log('\n📅 Cron Jobs:');
  try {
    const output = execSync('openclaw cron list', { encoding: 'utf-8' });
    console.log(output);
  } catch (e) {
    console.log('   ⚠️  Unable to fetch cron status');
  }
  
  // 2. 开发状态
  console.log('\n📊 Development State:');
  const state = loadState();
  if (state) {
    console.log(`   Current Phase: ${state.currentPhase}`);
    console.log(`   Completed Tasks: ${state.completedTasks.length}`);
    console.log(`   Iteration Count: ${state.iterationCount}`);
    console.log(`   Last Iteration: ${new Date(state.lastIteration).toLocaleString()}`);
    if (state.inProgressTask) {
      console.log(`   In Progress: ${state.inProgressTask}`);
    }
  } else {
    console.log('   No state file found');
  }
  
  // 3. 当前任务
  console.log('\n📝 Current Task:');
  const taskFile = join(PROJECT_ROOT, '.current-task.md');
  if (existsSync(taskFile)) {
    const content = readFileSync(taskFile, 'utf-8');
    const title = content.match(/# 开发任务: (.+)/)?.[1] || 'Unknown';
    console.log(`   Title: ${title}`);
    console.log(`   File: .current-task.md`);
  } else {
    console.log('   No active task');
  }
  
  // 4. 最近日志
  console.log('\n📜 Recent Log Entries:');
  if (existsSync(LOG_FILE)) {
    try {
      const log = execSync(`tail -20 "${LOG_FILE}"`, { encoding: 'utf-8' });
      console.log(log);
    } catch (e) {
      console.log('   Unable to read log file');
    }
  } else {
    console.log('   No log file found');
  }
  
  // 5. Git 状态
  console.log('\n🔀 Git Status:');
  try {
    const status = execSync('git status --short', { cwd: PROJECT_ROOT, encoding: 'utf-8' });
    if (status.trim()) {
      console.log('   Uncommitted changes:');
      console.log(status);
    } else {
      console.log('   Working tree clean');
    }
    
    const lastCommit = execSync('git log -1 --oneline', { cwd: PROJECT_ROOT, encoding: 'utf-8' });
    console.log(`   Last commit: ${lastCommit.trim()}`);
  } catch (e) {
    console.log('   Unable to get git status');
  }
  
  console.log('\n' + '='.repeat(50));
}

function showHelp() {
  console.log(`
BestClaw Auto-Dev Monitor

Usage:
  node scripts/monitor.mjs [command]

Commands:
  status    Show system status (default)
  logs      Show full cron logs
  next      Show next scheduled task
  help      Show this help message

Examples:
  node scripts/monitor.mjs
  node scripts/monitor.mjs status
  node scripts/monitor.mjs logs
`);
}

// 主函数
const command = process.argv[2] || 'status';

switch (command) {
  case 'status':
    showStatus();
    break;
  case 'logs':
    try {
      const logs = execSync(`cat "${LOG_FILE}"`, { encoding: 'utf-8' });
      console.log(logs);
    } catch (e) {
      console.log('No logs available');
    }
    break;
  case 'next':
    try {
      const output = execSync('openclaw cron list', { encoding: 'utf-8' });
      console.log(output);
    } catch (e) {
      console.log('Unable to fetch schedule');
    }
    break;
  case 'help':
  default:
    showHelp();
}
