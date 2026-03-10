/**
 * BestClaw Config Manager
 * 配置管理系统 - 支持 YAML/JSON 配置文件
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { parse as parseYAML, stringify as stringifyYAML } from 'yaml';
import type { Config, GatewayConfig, LLMConfig, ChannelConfig, SkillConfig } from '../types.js';

export interface ConfigOptions {
  configPath?: string;
  defaultConfig?: Partial<Config>;
}

export class ConfigManager {
  private config: Config;
  private configPath: string;
  private configDir: string;

  constructor(options: ConfigOptions = {}) {
    this.configDir = this.getConfigDir();
    this.configPath = options.configPath || join(this.configDir, 'bestclaw.yaml');
    this.config = this.loadConfig(options.defaultConfig);
  }

  /**
   * 获取配置目录
   */
  private getConfigDir(): string {
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
  private loadConfig(defaultConfig?: Partial<Config>): Config {
    // 默认配置
    const baseConfig: Config = {
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
      } catch (error) {
        console.warn(`Warning: Failed to load config from ${this.configPath}:`, error);
      }
    }

    return mergedConfig;
  }

  /**
   * 从文件加载配置
   */
  private loadConfigFile(path: string): Partial<Config> {
    const content = readFileSync(path, 'utf-8');
    const ext = path.split('.').pop()?.toLowerCase();

    if (ext === 'yaml' || ext === 'yml') {
      return parseYAML(content) as Partial<Config>;
    } else if (ext === 'json') {
      return JSON.parse(content);
    }

    // 尝试自动检测格式
    try {
      return parseYAML(content) as Partial<Config>;
    } catch {
      return JSON.parse(content);
    }
  }

  /**
   * 合并配置
   */
  private mergeConfig(base: Config, override: Partial<Config>): Config {
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
  getConfig(): Config {
    return this.config;
  }

  /**
   * 获取网关配置
   */
  getGatewayConfig(): GatewayConfig {
    return this.config.gateway;
  }

  /**
   * 获取 LLM 配置
   */
  getLLMConfig(): LLMConfig {
    return this.config.llm;
  }

  /**
   * 获取渠道配置
   */
  getChannelConfig(channelId: string): ChannelConfig | undefined {
    return this.config.channels[channelId];
  }

  /**
   * 获取所有渠道配置
   */
  getAllChannelConfigs(): Record<string, ChannelConfig> {
    return this.config.channels;
  }

  /**
   * 获取技能配置
   */
  getSkillConfigs(): SkillConfig[] {
    return this.config.skills;
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<Config>): void {
    this.config = this.mergeConfig(this.config, updates);
  }

  /**
   * 更新网关配置
   */
  updateGatewayConfig(updates: Partial<GatewayConfig>): void {
    this.config.gateway = { ...this.config.gateway, ...updates };
  }

  /**
   * 更新 LLM 配置
   */
  updateLLMConfig(updates: Partial<LLMConfig>): void {
    this.config.llm = { ...this.config.llm, ...updates };
  }

  /**
   * 保存配置到文件
   */
  saveConfig(format: 'yaml' | 'json' = 'yaml'): void {
    // 确保配置目录存在
    const dir = dirname(this.configPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    let content: string;
    let savePath = this.configPath;

    if (format === 'json') {
      content = JSON.stringify(this.config, null, 2);
      savePath = savePath.replace(/\.ya?ml$/, '.json');
    } else {
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
  createDefaultConfig(): void {
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
  private getDefaultYAMLConfig(): string {
    return `# BestClaw Configuration
# 配置文件路径: ~/.bestclaw/bestclaw.yaml

# 网关配置
gateway:
  port: 18789
  host: 127.0.0.1
  logLevel: info

# LLM 配置
llm:
  provider: minimax  # 可选: openai, anthropic, deepseek, minimax, local
  model: abab6.5s-chat  # minimax 模型
  apiKey: \${MINIMAX_API_KEY}  # 从环境变量读取
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
  loadFromEnv(): void {
    const envConfig: Partial<Config> = {};

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
    const llmConfig: Partial<LLMConfig> = {};
    
    // 检查各种 API Key
    if (process.env.MINIMAX_API_KEY) {
      llmConfig.provider = 'minimax';
      llmConfig.apiKey = process.env.MINIMAX_API_KEY;
      llmConfig.model = process.env.MINIMAX_MODEL || 'abab6.5s-chat';
    } else if (process.env.DEEPSEEK_API_KEY) {
      llmConfig.provider = 'deepseek';
      llmConfig.apiKey = process.env.DEEPSEEK_API_KEY;
      llmConfig.model = process.env.BESTCLAW_MODEL || 'deepseek-chat';
    } else if (process.env.OPENAI_API_KEY) {
      llmConfig.provider = 'openai';
      llmConfig.apiKey = process.env.OPENAI_API_KEY;
      llmConfig.model = process.env.BESTCLAW_MODEL || 'gpt-3.5-turbo';
    } else if (process.env.ANTHROPIC_API_KEY) {
      llmConfig.provider = 'anthropic';
      llmConfig.apiKey = process.env.ANTHROPIC_API_KEY;
      llmConfig.model = process.env.BESTCLAW_MODEL || 'claude-3-haiku-20240307';
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
  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * 检查配置文件是否存在
   */
  configExists(): boolean {
    return existsSync(this.configPath);
  }
}

// 导出单例
let configManagerInstance: ConfigManager | null = null;

export function getConfigManager(options?: ConfigOptions): ConfigManager {
  if (!configManagerInstance) {
    configManagerInstance = new ConfigManager(options);
  }
  return configManagerInstance;
}

export function resetConfigManager(): void {
  configManagerInstance = null;
}
