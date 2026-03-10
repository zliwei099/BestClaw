/**
 * BestClaw Gateway
 * 核心网关 - 消息路由和会话管理
 */
import type { Message, Session, EventType, EventHandler, Config } from '../types.js';
import { EventEmitter } from 'events';
export declare class Gateway extends EventEmitter {
    private sessions;
    private handlers;
    private config;
    private started;
    private logger;
    constructor(config: Config);
    /**
     * 启动网关
     */
    start(): Promise<void>;
    /**
     * 停止网关
     */
    stop(): Promise<void>;
    /**
     * 接收消息
     */
    receiveMessage(message: Message): Promise<void>;
    /**
     * 发送消息
     */
    sendMessage(sessionId: string, content: string, metadata?: any): Promise<void>;
    /**
     * 获取或创建会话
     */
    private getOrCreateSession;
    /**
     * 获取会话
     */
    getSession(sessionId: string): Session | undefined;
    /**
     * 获取所有会话
     */
    getAllSessions(): Session[];
    /**
     * 注册事件处理器
     */
    onEvent(type: EventType, handler: EventHandler): void;
    /**
     * 触发事件
     */
    private emitEvent;
    /**
     * 检查网关是否运行中
     */
    isRunning(): boolean;
    /**
     * 获取配置
     */
    getConfig(): Config;
}
//# sourceMappingURL=gateway.d.ts.map