/**
 * BestClaw Channels
 * 渠道抽象层 - 定义消息渠道接口
 */
import type { Message, ChannelInfo, Sender, ChannelConfig } from '../types.js';
import { EventEmitter } from 'events';
export declare abstract class Channel extends EventEmitter {
    protected config: ChannelConfig;
    protected info: ChannelInfo;
    protected connected: boolean;
    constructor(info: ChannelInfo, config: ChannelConfig);
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
    getInfo(): ChannelInfo;
    /**
     * 检查是否已连接
     */
    isConnected(): boolean;
    /**
     * 创建标准消息对象
     */
    protected createMessage(content: string, sender: Sender, attachments?: any[]): Message;
    /**
     * 生成唯一 ID
     */
    protected generateId(): string;
}
/**
 * CLI 渠道实现
 */
export declare class CLIChannel extends Channel {
    private rl;
    constructor(config?: ChannelConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendMessage(to: string, content: string): Promise<void>;
}
/**
 * 渠道管理器
 */
export declare class ChannelsManager {
    private channels;
    /**
     * 注册渠道
     */
    register(channel: Channel): void;
    /**
     * 获取渠道
     */
    get(id: string): Channel | undefined;
    /**
     * 获取所有渠道
     */
    getAll(): Channel[];
    /**
     * 连接所有启用的渠道
     */
    connectAll(): Promise<void>;
    /**
     * 断开所有渠道
     */
    disconnectAll(): Promise<void>;
}
//# sourceMappingURL=channel.d.ts.map