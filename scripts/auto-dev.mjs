#!/usr/bin/env node
/**
 * BestClaw Auto-Dev Runner
 * 自动开发迭代脚本 - 带飞书通知
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const STATE_FILE = join(PROJECT_ROOT, '.dev-state.json');

// 开发路线图
const roadmap = [
  // Phase 1: 核心完善
  {
    id: 'config-system',
    phase: 'Phase 1',
    title: '配置文件系统',
    description: '实现 YAML/JSON 配置文件加载，支持用户自定义配置',
    priority: 'high',
    status: 'todo'
  },
  {
    id: 'logger',
    phase: 'Phase 1',
    title: '日志系统',
    description: '实现结构化日志，支持分级和文件输出',
    priority: 'high',
    status: 'todo'
  },
  {
    id: 'error-handling',
    phase: 'Phase 1',
    title: '错误处理增强',
    description: '统一错误类型，完善错误恢复机制',
    priority: 'medium',
    status: 'todo'
  },
  // Phase 2: 渠道扩展
  {
    id: 'telegram-channel',
    phase: 'Phase 2',
    title: 'Telegram 渠道',
    description: '实现 Telegram Bot API 集成',
    priority: 'high',
    status: 'todo',
    dependencies: ['config-system']
  },
  {
    id: 'discord-channel',
    phase: 'Phase 2',
    title: 'Discord 渠道',
    description: '实现 Discord Bot 集成',
    priority: 'high',
    status: 'todo',
    dependencies: ['config-system']
  },
  {
    id: 'feishu-channel',
    phase: 'Phase 2',
    title: '飞书渠道',
    description: '实现飞书 Bot 集成',
    priority: 'medium',
    status: 'todo',
    dependencies: ['config-system']
  },
  // Phase 3: 能力增强
  {
    id: 'browser-automation',
    phase: 'Phase 3',
    title: '浏览器自动化',
    description: '集成 Playwright，实现网页操作',
    priority: 'medium',
    status: 'todo'
  },
  {
    id: 'vector-store',
    phase: 'Phase 3',
    title: '向量存储',
    description: '集成向量数据库，支持语义搜索',
    priority: 'low',
    status: 'todo'
  }
];

// 飞书通知器 (动态导入)
let notifier = null;

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
  if (existsSync(STATE_FILE)) {
    return JSON.parse(readFileSync(STATE_FILE, 'utf-8'));
  }
  return {
    currentPhase: 'Phase 1',
    completedTasks: [],
    lastIteration: new Date().toISOString(),
    iterationCount: 0
  };
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function getNextTask(state) {
  const available = roadmap.filter(task => {
    if (task.status === 'done') return false;
    if (state.completedTasks.includes(task.id)) return false;
    if (task.dependencies) {
      return task.dependencies.every(dep => state.completedTasks.includes(dep));
    }
    return true;
  });
  
  // 按优先级排序
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  available.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  return available[0] || null;
}

function updateProgressFile(task, status) {
  const progressFile = join(PROJECT_ROOT, 'docs/PROGRESS.md');
  const now = new Date().toISOString().split('T')[0];
  
  let content = '';
  if (existsSync(progressFile)) {
    content = readFileSync(progressFile, 'utf-8');
  } else {
    content = '# BestClaw 开发进度\n\n';
  }
  
  const entry = `\n## ${now}\n\n- **任务**: ${task.title}\n- **状态**: ${status}\n- **描述**: ${task.description}\n`;
  
  content += entry;
  writeFileSync(progressFile, content);
}

async function runDevIteration() {
  console.log('🚀 Starting BestClaw Auto-Dev Iteration...\n');
  
  const state = loadState();
  state.iterationCount++;
  
  // 1. 检查当前状态
  console.log(`📊 Current State:`);
  console.log(`   - Phase: ${state.currentPhase}`);
  console.log(`   - Completed: ${state.completedTasks.length} tasks`);
  console.log(`   - Iterations: ${state.iterationCount}\n`);
  
  // 2. 选择下一个任务
  const task = getNextTask(state);
  if (!task) {
    console.log('✅ All tasks completed! Moving to next phase...');
    
    // 发送通知
    const notifier = await getNotifier();
    if (notifier?.isEnabled()) {
      await notifier.notify({
        title: 'BestClaw 阶段完成',
        content: `**阶段**: ${state.currentPhase}\n\n✅ 所有任务已完成！即将进入下一阶段。`,
        type: 'success'
      });
    }
    
    // 切换到下一阶段
    const phases = ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'];
    const currentIndex = phases.indexOf(state.currentPhase);
    if (currentIndex < phases.length - 1) {
      state.currentPhase = phases[currentIndex + 1];
      saveState(state);
    }
    return;
  }
  
  console.log(`🎯 Selected Task: ${task.title}`);
  console.log(`   Priority: ${task.priority}`);
  console.log(`   Description: ${task.description}\n`);
  
  // 3. 更新状态
  state.inProgressTask = task.id;
  saveState(state);
  
  // 4. 发送飞书通知
  const notifier = await getNotifier();
  if (notifier?.isEnabled()) {
    await notifier.notifyIterationPlanned(task.title, task.phase);
  }
  
  // 5. 更新进度文档
  updateProgressFile(task, '进行中');
  
  // 6. 生成开发提示
  const prompt = generateDevPrompt(task);
  console.log('📝 Generated development prompt:\n');
  console.log(prompt);
  console.log('\n---\n');
  
  // 7. 保存任务提示到文件
  const taskFile = join(PROJECT_ROOT, '.current-task.md');
  writeFileSync(taskFile, prompt);
  
  console.log('✨ Ready for development!');
  console.log(`\n💡 To execute this task, run:`);
  console.log(`   node scripts/execute-task.mjs`);
  
  // 8. 再次发送通知（包含详细信息）
  if (notifier?.isEnabled()) {
    await notifier.notify({
      title: 'BestClaw 准备开发',
      content: `**任务**: ${task.title}\n\n**描述**: ${task.description}\n\n**阶段**: ${task.phase}\n\n⏱️ 时间: ${new Date().toLocaleString()}`,
      type: 'info',
      taskName: task.title
    });
  }
  
  state.lastIteration = new Date().toISOString();
  saveState(state);
}

function generateDevPrompt(task) {
  return `# 开发任务: ${task.title}

## 任务信息
- **ID**: ${task.id}
- **阶段**: ${task.phase}
- **优先级**: ${task.priority}
- **状态**: 待实现

## 任务描述
${task.description}

## 实现要求
1. 遵循项目现有的代码风格
2. 使用 TypeScript 编写
3. 添加适当的类型定义
4. 包含基本的功能测试
5. 更新相关文档

## 文件位置
- 源代码: src/
- 测试: tests/
- 文档: docs/

## 提交规范
提交信息格式:
\`\`\`
feat: ${task.title}

${task.description}

- 实现功能
- 添加测试
- 更新文档
\`\`\`

## 验收标准
- [ ] 功能实现完整
- [ ] 代码通过类型检查
- [ ] 基本测试通过
- [ ] 文档已更新
- [ ] 代码已提交到 GitHub
`;
}

// 运行
runDevIteration().catch(console.error);
