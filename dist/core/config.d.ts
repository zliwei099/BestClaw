/**
 * BestClaw Config Manager
 * 配置管理系统 - 支持 YAML/JSON 配置文件
 */
import type { Config, GatewayConfig, LLMConfig, ChannelConfig, SkillConfig } from '../types.js';
export interface ConfigOptions {
    configPath?: string;
    defaultConfig?: Partial<Config>;
}
export declare class ConfigManager {
    private config;
    private configPath;
    private configDir;
    constructor(options?: ConfigOptions);
    /**
     * 获取配置目录
     */
    private getConfigDir;
    /**
     * 加载配置
     */
    private loadConfig;
    /**
     * 从文件加载配置
     */
    private loadConfigFile;
    /**
     * 合并配置
     */
    private mergeConfig;
    /**
     * 获取当前配置
     */
    getConfig(): Config;
    /**
     * 获取网关配置
     */
    getGatewayConfig(): GatewayConfig;
    /**
     * 获取 LLM 配置
     */
    getLLMConfig(): LLMConfig;
    /**
     * 获取渠道配置
     */
    getChannelConfig(channelId: string): ChannelConfig | undefined;
    /**
     * 获取所有渠道配置
     */
    getAllChannelConfigs(): Record<string, ChannelConfig>;
    /**
     * 获取技能配置
     */
    getSkillConfigs(): SkillConfig[];
    /**
     * 更新配置
     */
    updateConfig(updates: Partial<Config>): void;
    /**
     * 更新网关配置
     */
    updateGatewayConfig(updates: Partial<GatewayConfig>): void;
    /**
     * 更新 LLM 配置
     */
    updateLLMConfig(updates: Partial<LLMConfig>): void;
    /**
     * 保存配置到文件
     */
    saveConfig(format?: 'yaml' | 'json'): void;
    /**
     * 创建默认配置文件
     */
    createDefaultConfig(): void;
    /**
     * 获取默认 YAML 配置内容
     */
    private getDefaultYAMLConfig;
    /**
     * 从环境变量加载配置
     */
    loadFromEnv(): void;
    /**
     * 获取配置文件路径
     */
    getConfigPath(): string;
    /**
     * 检查配置文件是否存在
     */
    configExists(): boolean;
}
export declare function getConfigManager(options?: ConfigOptions): ConfigManager;
export declare function resetConfigManager(): void;
//# sourceMappingURL=config.d.ts.map