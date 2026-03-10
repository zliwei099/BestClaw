/**
 * BestClaw Gateway
 * 核心网关 - 消息路由和会话管理
 */

import type { Message, Session, BestClawEvent, EventType, EventHandler, Config } from '../types.js';
import { EventEmitter } from 'events';

export class Gateway extends EventEmitter {
  private sessions: Map<string, Session> = new Map();
  private handlers: Map<EventType, EventHandler[]> = new Map();
  private config: Config;
  private started: boolean = false;

  constructor(config: Config) {
    super();
    this.config = config;
  }

  /**
   * 启动网关
   */
  async start(): Promise<void> {
    if (this.started) {
      throw new Error('Gateway already started');
    }

    console.log(`🚀 BestClaw Gateway starting on ${this.config.gateway.host}:${this.config.gateway.port}`);
    
    this.started = true;
    this.emit('started', { timestamp: new Date() });
    
    console.log('✅ Gateway started successfully');
  }

  /**
   * 停止网关
   */
  async stop(): Promise<void> {
    if (!this.started) {
      return;
    }

    console.log('🛑 Stopping Gateway...');
    
    this.started = false;
    this.emit('stopped', { timestamp: new Date() });
    
    console.log('✅ Gateway stopped');
  }

  /**
   * 接收消息
   */
  async receiveMessage(message: Message): Promise<void> {
    if (!this.started) {
      throw new Error('Gateway not started');
    }

    console.log(`📨 Received message from ${message.sender.name} on ${message.channel.type}`);
    
    // 获取或创建会话
    const session = this.getOrCreateSession(message);
    
    // 触发事件
    this.emitEvent('message:received', { message, session });
    
    // 触发消息处理流程
    this.emit('message', message, session);
  }

  /**
   * 发送消息
   */
  async sendMessage(sessionId: string, content: string, metadata?: any): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    console.log(`📤 Sending message to ${session.userId}`);
    
    this.emitEvent('message:sent', { 
      sessionId, 
      content, 
      metadata,
      timestamp: new Date()
    });
  }

  /**
   * 获取或创建会话
   */
  private getOrCreateSession(message: Message): Session {
    const sessionId = `${message.channel.id}:${message.sender.id}`;
    
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        userId: message.sender.id,
        channelId: message.channel.id,
        messages: [],
        context: {},
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.sessions.set(sessionId, session);
      this.emitEvent('session:created', { session });
    }

    // 更新会话
    session.messages.push(message);
    session.updatedAt = new Date();
    this.emitEvent('session:updated', { session });

    return session;
  }

  /**
   * 获取会话
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * 获取所有会话
   */
  getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  /**
   * 注册事件处理器
   */
  onEvent(type: EventType, handler: EventHandler): void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, []);
    }
    this.handlers.get(type)!.push(handler);
  }

  /**
   * 触发事件
   */
  private emitEvent(type: EventType, payload: any): void {
    const event = { type, payload, timestamp: new Date() };
    
    // 调用注册的处理器
    const handlers = this.handlers.get(type) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`Error in event handler for ${type}:`, error);
      }
    });

    // 触发 EventEmitter 事件
    this.emit(type, event);
  }

  /**
   * 检查网关是否运行中
   */
  isRunning(): boolean {
    return this.started;
  }

  /**
   * 获取配置
   */
  getConfig(): Config {
    return this.config;
  }
}
