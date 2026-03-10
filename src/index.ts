/**
 * BestClaw - 主入口
 */

import { Gateway } from './core/gateway.js';
import { Agent } from './agent/agent.js';
import { SkillsManager } from './skills/skills-manager.js';
import { ChannelsManager, CLIChannel } from './channels/channel.js';
import type { Config, Message, Session, AgentResponse } from './types.js';

export interface BestClawOptions {
  config: Config;
}

export class BestClaw {
  public gateway: Gateway;
  public agent: Agent;
  public skills: SkillsManager;
  public channels: ChannelsManager;
  private config: Config;

  constructor(options: BestClawOptions) {
    this.config = options.config;
    
    // 初始化核心组件
    this.gateway = new Gateway(this.config);
    this.channels = new ChannelsManager();
    this.skills = new SkillsManager();
    this.agent = new Agent({
      config: this.config.llm,
      tools: []
    });

    this.setupEventHandlers();
  }

  /**
   * 启动 BestClaw
   */
  async start(): Promise<void> {
    console.log('🦞 Starting BestClaw...\n');

    // 初始化技能系统
    await this.skills.initialize();
    
    // 更新 Agent 的工具
    this.agent = new Agent({
      config: this.config.llm,
      tools: this.skills.getAllTools()
    });

    // 启动网关
    await this.gateway.start();

    // 注册并连接渠道
    await this.setupChannels();

    console.log('\n✅ BestClaw is ready!\n');
  }

  /**
   * 停止 BestClaw
   */
  async stop(): Promise<void> {
    console.log('\n🛑 Stopping BestClaw...');
    
    await this.channels.disconnectAll();
    await this.gateway.stop();
    
    console.log('✅ BestClaw stopped');
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    // 网关收到消息
    this.gateway.on('message', async (message: Message, session: Session) => {
      try {
        // 调用 Agent 处理
        const response = await this.agent.process(message, session);
        
        // 发送响应
        await this.sendResponse(session, response);
      } catch (error) {
        console.error('Error processing message:', error);
        await this.sendResponse(session, {
          content: '抱歉，处理消息时出现了错误。'
        });
      }
    });
  }

  /**
   * 设置渠道
   */
  private async setupChannels(): Promise<void> {
    // CLI 渠道
    const cliChannel = new CLIChannel(this.config.channels.cli);
    
    cliChannel.on('message', async (message: Message) => {
      await this.gateway.receiveMessage(message);
    });

    this.channels.register(cliChannel);
    
    // 连接 CLI 渠道
    if (this.config.channels.cli?.enabled !== false) {
      await cliChannel.connect();
    }
  }

  /**
   * 发送响应
   */
  private async sendResponse(session: Session, response: AgentResponse): Promise<void> {
    // 发送到对应渠道
    const channel = this.channels.get(session.channelId);
    if (channel) {
      await channel.sendMessage(session.userId, response.content);
    }

    // 同时通过网关发送
    await this.gateway.sendMessage(session.id, response.content, response.metadata);
  }
}

// 导出所有模块
export * from './types.js';
export * from './core/gateway.js';
export * from './agent/agent.js';
export * from './skills/skills-manager.js';
export * from './channels/channel.js';
