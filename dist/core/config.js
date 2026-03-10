/**
 * BestClaw Config Manager
 * 配置管理系统 - 支持 YAML/JSON 配置文件
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { parse as parseYAML, stringify as stringifyYAML } from 'yaml';
export class ConfigManager {
    config;
    configPath;
    configDir;
    constructor(options = {}) {
        this.configDir = this.getConfigDir();
        this.configPath = options.configPath || join(this.configDir, 'bestclaw.yaml');
        this.config = this.loadConfig(options.defaultConfig);
    }
    /**
     * 获取配置目录
     */
    getConfigDir() {
        // 优先使用 BESTCLAW_CONFIG_DIR 环境变量
        if (process.env.BESTCLAW_CONFIG_DIR) {
            return process.env.BESTCLAW_CONFIG_DIR;
        }
        // 否则使用用户主目录
        const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
        return join(homeDir, '.bestclaw');
    }
    /**
     * 加载配置
     */
    loadConfig(defaultConfig) {
        // 默认配置
        const baseConfig = {
            gateway: {
                port: 18789,
                host: '127.0.0.1',
                logLevel: 'info'
            },
            channels: {
                cli: { enabled: true }
            },
            llm: {
                provider: 'deepseek',
                model: 'deepseek-chat',
                temperature: 0.7,
                maxTokens: 2000
            },
            skills: []
        };
        // 合并默认配置
        const mergedConfig = this.mergeConfig(baseConfig, defaultConfig || {});
        // 如果配置文件存在，加载它
        if (existsSync(this.configPath)) {
            try {
                const fileConfig = this.loadConfigFile(this.configPath);
                return this.mergeConfig(mergedConfig, fileConfig);
            }
            catch (error) {
                console.warn(`Warning: Failed to load config from ${this.configPath}:`, error);
            }
        }
        return mergedConfig;
    }
    /**
     * 从文件加载配置
     */
    loadConfigFile(path) {
        const content = readFileSync(path, 'utf-8');
        const ext = path.split('.').pop()?.toLowerCase();
        if (ext === 'yaml' || ext === 'yml') {
            return parseYAML(content);
        }
        else if (ext === 'json') {
            return JSON.parse(content);
        }
        // 尝试自动检测格式
        try {
            return parseYAML(content);
        }
        catch {
            return JSON.parse(content);
        }
    }
    /**
     * 合并配置
     */
    mergeConfig(base, override) {
        return {
            gateway: { ...base.gateway, ...override.gateway },
            channels: { ...base.channels, ...override.channels },
            llm: { ...base.llm, ...override.llm },
            skills: override.skills || base.skills
        };
    }
    /**
     * 获取当前配置
     */
    getConfig() {
        return this.config;
    }
    /**
     * 获取网关配置
     */
    getGatewayConfig() {
        return this.config.gateway;
    }
    /**
     * 获取 LLM 配置
     */
    getLLMConfig() {
        return this.config.llm;
    }
    /**
     * 获取渠道配置
     */
    getChannelConfig(channelId) {
        return this.config.channels[channelId];
    }
    /**
     * 获取所有渠道配置
     */
    getAllChannelConfigs() {
        return this.config.channels;
    }
    /**
     * 获取技能配置
     */
    getSkillConfigs() {
        return this.config.skills;
    }
    /**
     * 更新配置
     */
    updateConfig(updates) {
        this.config = this.mergeConfig(this.config, updates);
    }
    /**
     * 更新网关配置
     */
    updateGatewayConfig(updates) {
        this.config.gateway = { ...this.config.gateway, ...updates };
    }
    /**
     * 更新 LLM 配置
     */
    updateLLMConfig(updates) {
        this.config.llm = { ...this.config.llm, ...updates };
    }
    /**
     * 保存配置到文件
     */
    saveConfig(format = 'yaml') {
        // 确保配置目录存在
        const dir = dirname(this.configPath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        let content;
        let savePath = this.configPath;
        if (format === 'json') {
            content = JSON.stringify(this.config, null, 2);
            savePath = savePath.replace(/\.ya?ml$/, '.json');
        }
        else {
            content = stringifyYAML(this.config, {
                indent: 2,
                lineWidth: 0
            });
        }
        writeFileSync(savePath, content, 'utf-8');
        console.log(`Config saved to ${savePath}`);
    }
    /**
     * 创建默认配置文件
     */
    createDefaultConfig() {
        const dir = dirname(this.configPath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        const defaultConfig = this.getDefaultYAMLConfig();
        writeFileSync(this.configPath, defaultConfig, 'utf-8');
        console.log(`Default config created at ${this.configPath}`);
    }
    /**
     * 获取默认 YAML 配置内容
     */
    getDefaultYAMLConfig() {
        return `# BestClaw Configuration
# 配置文件路径: ~/.bestclaw/bestclaw.yaml

# 网关配置
gateway:
  port: 18789
  host: 127.0.0.1
  logLevel: info

# LLM 配置
llm:
  provider: deepseek  # 可选: openai, anthropic, deepseek, local
  model: deepseek-chat
  apiKey: \${DEEPSEEK_API_KEY}  # 从环境变量读取
  baseUrl: \${DEEPSEEK_BASE_URL}  # 可选，自定义 API 地址
  temperature: 0.7
  maxTokens: 2000

# 渠道配置
channels:
  cli:
    enabled: true
  telegram:
    enabled: false
    botToken: \${TELEGRAM_BOT_TOKEN}
  discord:
    enabled: false
    token: \${DISCORD_BOT_TOKEN}
  feishu:
    enabled: false
    appId: \${FEISHU_APP_ID}
    appSecret: \${FEISHU_APP_SECRET}

# 技能配置
skills:
  - name: file
    enabled: true
  - name: exec
    enabled: true
  - name: network
    enabled: true
`;
    }
    /**
     * 从环境变量加载配置
     */
    loadFromEnv() {
        const envConfig = {};
        // Gateway
        if (process.env.BESTCLAW_PORT) {
            envConfig.gateway = {
                ...this.config.gateway,
                port: parseInt(process.env.BESTCLAW_PORT)
            };
        }
        if (process.env.BESTCLAW_HOST) {
            envConfig.gateway = {
                ...envConfig.gateway,
                ...this.config.gateway,
                host: process.env.BESTCLAW_HOST
            };
        }
        // LLM
        const llmConfig = {};
        if (process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) {
            llmConfig.apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
        }
        if (process.env.DEEPSEEK_BASE_URL) {
            llmConfig.baseUrl = process.env.DEEPSEEK_BASE_URL;
        }
        if (process.env.BESTCLAW_MODEL) {
            llmConfig.model = process.env.BESTCLAW_MODEL;
        }
        if (Object.keys(llmConfig).length > 0) {
            envConfig.llm = { ...this.config.llm, ...llmConfig };
        }
        if (Object.keys(envConfig).length > 0) {
            this.updateConfig(envConfig);
        }
    }
    /**
     * 获取配置文件路径
     */
    getConfigPath() {
        return this.configPath;
    }
    /**
     * 检查配置文件是否存在
     */
    configExists() {
        return existsSync(this.configPath);
    }
}
// 导出单例
let configManagerInstance = null;
export function getConfigManager(options) {
    if (!configManagerInstance) {
        configManagerInstance = new ConfigManager(options);
    }
    return configManagerInstance;
}
export function resetConfigManager() {
    configManagerInstance = null;
}
//# sourceMappingURL=config.js.map