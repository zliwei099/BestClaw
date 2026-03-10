/**
 * BestClaw Feishu Notifier
 * 飞书通知模块 - 推送开发迭代状态
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface FeishuConfig {
  webhook?: string;
  userId?: string;
  chatId?: string;
  enabled: boolean;
}

export interface NotifyOptions {
  title: string;
  content: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  taskId?: string;
  taskName?: string;
  duration?: number;
}

export class FeishuNotifier {
  private config: FeishuConfig;
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.config = this.loadConfig();
  }

  /**
   * 加载配置
   */
  private loadConfig(): FeishuConfig {
    // 1. 从环境变量读取
    if (process.env.BESTCLAW_FEISHU_WEBHOOK) {
      return {
        webhook: process.env.BESTCLAW_FEISHU_WEBHOOK,
        userId: process.env.BESTCLAW_FEISHU_USER_ID,
        chatId: process.env.BESTCLAW_FEISHU_CHAT_ID,
        enabled: true
      };
    }

    // 2. 从配置文件读取
    const configPath = join(this.projectRoot, '.autodev-config.json');
    if (existsSync(configPath)) {
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf-8'));
        if (config.notifications?.feishu) {
          return {
            ...config.notifications.feishu,
            enabled: true
          };
        }
      } catch (e) {
        console.error('Failed to load feishu config:', e);
      }
    }

    return { enabled: false };
  }

  /**
   * 检查是否启用
   */
  isEnabled(): boolean {
    return this.config.enabled && !!this.config.webhook;
  }

  /**
   * 发送通知
   */
  async notify(options: NotifyOptions): Promise<boolean> {
    if (!this.isEnabled()) {
      console.log('Feishu notifier disabled');
      return false;
    }

    try {
      const message = this.buildMessage(options);
      
      const response = await fetch(this.config.webhook!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        console.error('Failed to send feishu notification:', await response.text());
        return false;
      }

      console.log('✅ Feishu notification sent');
      return true;
    } catch (error) {
      console.error('Error sending feishu notification:', error);
      return false;
    }
  }

  /**
   * 构建飞书消息
   */
  private buildMessage(options: NotifyOptions): any {
    const colorMap = {
      info: 'blue',
      success: 'green',
      warning: 'orange',
      error: 'red'
    };

    const emojiMap = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    const color = colorMap[options.type || 'info'];
    const emoji = emojiMap[options.type || 'info'];

    // 使用卡片消息格式
    return {
      msg_type: 'interactive',
      card: {
        config: {
          wide_screen_mode: true
        },
        header: {
          title: {
            tag: 'plain_text',
            content: `${emoji} ${options.title}`
          },
          template: color
        },
        elements: [
          {
            tag: 'div',
            text: {
              tag: 'lark_md',
              content: options.content
            }
          }
        ]
      }
    };
  }

  /**
   * 通知任务开始
   */
  async notifyTaskStart(taskName: string, taskDescription: string): Promise<boolean> {
    return this.notify({
      title: 'BestClaw 开始开发新任务',
      content: `**任务**: ${taskName}\n\n**描述**: ${taskDescription}\n\n⏱️ 开始时间: ${new Date().toLocaleString()}`,
      type: 'info',
      taskName
    });
  }

  /**
   * 通知任务完成
   */
  async notifyTaskComplete(taskName: string, commitHash: string, duration?: number): Promise<boolean> {
    const durationStr = duration ? `\n\n⏱️ 耗时: ${Math.round(duration / 1000)}秒` : '';
    
    return this.notify({
      title: 'BestClaw 任务开发完成',
      content: `**任务**: ${taskName}\n\n✅ 状态: 已完成\n\n🔀 提交: ${commitHash}${durationStr}\n\n📅 完成时间: ${new Date().toLocaleString()}`,
      type: 'success',
      taskName,
      duration
    });
  }

  /**
   * 通知任务失败
   */
  async notifyTaskFailed(taskName: string, error: string): Promise<boolean> {
    return this.notify({
      title: 'BestClaw 任务开发失败',
      content: `**任务**: ${taskName}\n\n❌ 错误: ${error}\n\n📅 时间: ${new Date().toLocaleString()}`,
      type: 'error',
      taskName
    });
  }

  /**
   * 通知迭代规划
   */
  async notifyIterationPlanned(taskName: string, phase: string): Promise<boolean> {
    return this.notify({
      title: 'BestClaw 迭代规划完成',
      content: `**阶段**: ${phase}\n\n**下一任务**: ${taskName}\n\n📅 规划时间: ${new Date().toLocaleString()}`,
      type: 'info',
      taskName
    });
  }
}

// 导出便捷函数
export function createNotifier(projectRoot?: string): FeishuNotifier {
  return new FeishuNotifier(projectRoot);
}
