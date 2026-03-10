#!/usr/bin/env node
/**
 * BestClaw Task Executor
 * 执行当前开发任务 - 带飞书通知
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const TASK_FILE = join(PROJECT_ROOT, '.current-task.md');
const STATE_FILE = join(PROJECT_ROOT, '.dev-state.json');

// 飞书通知器
let notifier = null;
let startTime = Date.now();

async function getNotifier() {
  if (!notifier) {
    try {
      const { FeishuNotifier } = await import('../dist/utils/feishu-notifier.js');
      notifier = new FeishuNotifier(PROJECT_ROOT);
    } catch (e) {
      console.log('Feishu notifier not available');
    }
  }
  return notifier;
}

function loadState() {
  return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function runCommand(cmd, description) {
  console.log(`\n🔨 ${description}...`);
  try {
    execSync(cmd, { cwd: PROJECT_ROOT, stdio: 'inherit' });
    console.log(`   ✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`   ❌ ${description} failed`);
    return false;
  }
}

function updateProgressFile(taskTitle) {
  const progressFile = join(PROJECT_ROOT, 'docs/PROGRESS.md');
  const now = new Date().toISOString().split('T')[0];
  
  let content = '';
  if (existsSync(progressFile)) {
    content = readFileSync(progressFile, 'utf-8');
  }
  
  // 将"进行中"更新为"已完成"
  content = content.replace(
    new RegExp(`- \\*\\*任务\\*\\*: ${taskTitle}.*?- \\*\\*状态\\*\\*: 进行中`, 's'),
    `- **任务**: ${taskTitle}\n- **状态**: 已完成`
  );
  
  writeFileSync(progressFile, content);
}

async function executeTask() {
  const notifier = await getNotifier();
  
  if (!existsSync(TASK_FILE)) {
    console.error('❌ No current task found. Run: node scripts/auto-dev.mjs');
    
    if (notifier?.isEnabled()) {
      await notifier.notify({
        title: 'BestClaw 执行失败',
        content: '❌ 没有找到待执行的任务\n\n请先运行: node scripts/auto-dev.mjs',
        type: 'error'
      });
    }
    
    process.exit(1);
  }
  
  const state = loadState();
  if (!state.inProgressTask) {
    console.error('❌ No task in progress');
    process.exit(1);
  }
  
  const taskContent = readFileSync(TASK_FILE, 'utf-8');
  const taskTitle = taskContent.match(/# 开发任务: (.+)/)?.[1] || 'Unknown';
  
  console.log('🚀 Executing development task...\n');
  console.log(`Task: ${taskTitle}\n`);
  
  // 发送开始通知
  if (notifier?.isEnabled()) {
    await notifier.notifyTaskStart(taskTitle, '开始执行任务...');
  }
  
  // 运行构建
  if (!runCommand('npm run build', 'Building project')) {
    console.error('\n⚠️ Build failed. Please fix errors and retry.');
    
    if (notifier?.isEnabled()) {
      await notifier.notifyTaskFailed(taskTitle, '构建失败');
    }
    
    return;
  }
  
  // Git 操作
  console.log('\n📤 Committing changes...');
  
  let commitHash = '';
  
  try {
    execSync('git add .', { cwd: PROJECT_ROOT });
    
    const commitMsg = `feat: ${taskTitle}

Auto-generated implementation by BestClaw Auto-Dev

- Created example feature
- Added basic structure
- Updated documentation
`;
    
    execSync(`git commit -m "${commitMsg}"`, { cwd: PROJECT_ROOT });
    console.log('   ✅ Changes committed');
    
    // 获取 commit hash
    commitHash = execSync('git rev-parse --short HEAD', { 
      cwd: PROJECT_ROOT, 
      encoding: 'utf-8' 
    }).trim();
    
    // 推送到 GitHub
    console.log('\n☁️ Pushing to GitHub...');
    execSync('git push origin main', { cwd: PROJECT_ROOT });
    console.log('   ✅ Pushed to GitHub');
    
  } catch (error) {
    console.error('   ⚠️ Git operations failed:', error);
    
    if (notifier?.isEnabled()) {
      await notifier.notifyTaskFailed(taskTitle, 'Git 操作失败: ' + error.message);
    }
    
    return;
  }
  
  // 更新状态
  state.completedTasks.push(state.inProgressTask);
  delete state.inProgressTask;
  saveState(state);
  
  // 更新进度文档
  updateProgressFile(taskTitle);
  
  // 计算耗时
  const duration = Date.now() - startTime;
  
  // 发送完成通知
  if (notifier?.isEnabled()) {
    await notifier.notifyTaskComplete(taskTitle, commitHash, duration);
  }
  
  console.log('\n✨ Task completed successfully!');
  console.log('\n📊 Next steps:');
  console.log('   1. Run: node scripts/auto-dev.mjs  # 规划下一个任务');
  console.log('   2. Run: node scripts/execute-task.mjs  # 执行下一个任务');
}

executeTask().catch(async (error) => {
  console.error(error);
  
  const notifier = await getNotifier();
  if (notifier?.isEnabled()) {
    await notifier.notify({
      title: 'BestClaw 执行异常',
      content: `❌ 任务执行过程中发生异常\n\n错误: ${error.message}`,
      type: 'error'
    });
  }
});
