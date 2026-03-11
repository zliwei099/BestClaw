/**
 * BestClaw Channels
 * 渠道抽象层 - 定义消息渠道接口
 */

export { TelegramChannel, TelegramConfig } from './telegram.js';

import type { Message, ChannelInfo, Sender, ChannelConfig } from '../types.js';
import { EventEmitter } from 'events';

export abstract class Channel extends EventEmitter {
  protected config: ChannelConfig;
  protected info: ChannelInfo;
  protected connected: boolean = false;

  constructor(info: ChannelInfo, config: ChannelConfig) {
    super();
    this.info = info;
    this.config = config;
  }

  /**
   * 连接渠道
   */
  abstract connect(): Promise<void>;

  /**
   * 断开渠道连接
   */
  abstract disconnect(): Promise<void>;

  /**
   * 发送消息
   */
  abstract sendMessage(to: string, content: string, options?: any): Promise<void>;

  /**
   * 获取渠道信息
   */
  getInfo(): ChannelInfo {
    return this.info;
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * 创建标准消息对象
   */
  protected createMessage(content: string, sender: Sender, attachments?: any[]): Message {
    return {
      id: this.generateId(),
      content,
      sender,
      channel: this.info,
      timestamp: new Date(),
      attachments
    };
  }

  /**
   * 生成唯一 ID
   */
  protected generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * CLI 渠道实现
 */
export class CLIChannel extends Channel {
  private rl: any;

  constructor(config: ChannelConfig = { enabled: true }) {
    super(
      { id: 'cli', name: 'CLI', type: 'cli' },
      config
    );
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    const { createInterface } = await import('readline');
    
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('💻 CLI Channel connected. Type your messages (exit to quit):\n');

    this.rl.on('line', (input: string) => {
      if (input.trim().toLowerCase() === 'exit') {
        this.disconnect();
        process.exit(0);
      }

      const message = this.createMessage(
        input,
        { id: 'user', name: 'User', type: 'user' }
      );

      this.emit('message', message);
    });

    this.connected = true;
    this.emit('connected');
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    this.rl?.close();
    this.connected = false;
    this.emit('disconnected');
  }

  async sendMessage(to: string, content: string): Promise<void> {
    console.log(`\n🤖 ${content}\n`);
  }
}

/**
 * 渠道管理器
 */
export class ChannelsManager {
  private channels: Map<string, Channel> = new Map();

  /**
   * 注册渠道
   */
  register(channel: Channel): void {
    this.channels.set(channel.getInfo().id, channel);
  }

  /**
   * 获取渠道
   */
  get(id: string): Channel | undefined {
    return this.channels.get(id);
  }

  /**
   * 获取所有渠道
   */
  getAll(): Channel[] {
    return Array.from(this.channels.values());
  }

  /**
   * 连接所有启用的渠道
   */
  async connectAll(): Promise<void> {
    for (const channel of this.channels.values()) {
      if (!channel.isConnected()) {
        try {
          await channel.connect();
        } catch (error) {
          console.error(`Failed to connect channel ${channel.getInfo().id}:`, error);
        }
      }
    }
  }

  /**
   * 断开所有渠道
   */
  async disconnectAll(): Promise<void> {
    for (const channel of this.channels.values()) {
      if (channel.isConnected()) {
        try {
          await channel.disconnect();
        } catch (error) {
          console.error(`Failed to disconnect channel ${channel.getInfo().id}:`, error);
        }
      }
    }
  }
}
