/**
 * BestClaw Core Types
 * 核心类型定义
 */

// 消息类型
export interface Message {
  id: string;
  content: string;
  sender: Sender;
  channel: ChannelInfo;
  timestamp: Date;
  attachments?: Attachment[];
}

export interface Sender {
  id: string;
  name: string;
  type: 'user' | 'bot';
}

export interface ChannelInfo {
  id: string;
  name: string;
  type: ChannelType;
}

export type ChannelType = 'whatsapp' | 'telegram' | 'discord' | 'slack' | 'feishu' | 'webchat' | 'cli';

// 附件类型
export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url?: string;
  filename?: string;
  mimeType?: string;
  data?: Buffer;
}

// Agent 响应
export interface AgentResponse {
  content: string;
  actions?: Action[];
  metadata?: Record<string, any>;
}

// 动作定义
export interface Action {
  type: string;
  params: Record<string, any>;
}

// 技能定义
export interface Skill {
  name: string;
  description: string;
  version: string;
  tools: Tool[];
  execute: (context: SkillContext) => Promise<any>;
}

export interface Tool {
  name: string;
  description: string;
  parameters: ParameterSchema;
  handler: (params: any) => Promise<any>;
}

export interface ParameterSchema {
  type: 'object';
  properties: Record<string, any>;
  required?: string[];
}

export interface SkillContext {
  message: Message;
  session: Session;
  tools: Map<string, Tool>;
}

// 会话定义
export interface Session {
  id: string;
  userId: string;
  channelId: string;
  messages: Message[];
  context: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// 配置定义
export interface Config {
  gateway: GatewayConfig;
  channels: Record<string, ChannelConfig>;
  llm: LLMConfig;
  skills: SkillConfig[];
}

export interface GatewayConfig {
  port: number;
  host: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface ChannelConfig {
  enabled: boolean;
  [key: string]: any;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'deepseek' | 'local';
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface SkillConfig {
  name: string;
  enabled: boolean;
  config?: Record<string, any>;
}

// 事件定义
export type EventType = 
  | 'message:received'
  | 'message:sent'
  | 'session:created'
  | 'session:updated'
  | 'skill:executed'
  | 'error';

export interface BestClawEvent {
  type: EventType;
  payload: any;
  timestamp: Date;
}

export type EventHandler = (event: BestClawEvent) => void | Promise<void>;
