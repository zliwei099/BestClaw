/**
 * BestClaw - 主入口
 */
import { Gateway } from './core/gateway.js';
import { Agent } from './agent/agent.js';
import { SkillsManager } from './skills/skills-manager.js';
import { ChannelsManager } from './channels/channel.js';
import type { Config } from './types.js';
export interface BestClawOptions {
    config: Config;
}
export declare class BestClaw {
    gateway: Gateway;
    agent: Agent;
    skills: SkillsManager;
    channels: ChannelsManager;
    private config;
    private logger;
    constructor(options: BestClawOptions);
    /**
     * 启动 BestClaw
     */
    start(): Promise<void>;
    /**
     * 停止 BestClaw
     */
    stop(): Promise<void>;
    /**
     * 设置事件处理器
     */
    private setupEventHandlers;
    /**
     * 设置渠道
     */
    private setupChannels;
    /**
     * 发送响应
     */
    private sendResponse;
}
export * from './types.js';
export * from './core/gateway.js';
export * from './core/config.js';
export * from './agent/agent.js';
export * from './skills/skills-manager.js';
export * from './channels/channel.js';
export * from './utils/logger.js';
//# sourceMappingURL=index.d.ts.map