/**
 * BestClaw Agent
 * AI Agent 核心 - 处理大模型调用和推理
 */

import type { Message, Session, AgentResponse, LLMConfig, Tool } from '../types.js';

export interface AgentOptions {
  config: LLMConfig;
  systemPrompt?: string;
  tools?: Tool[];
}

export class Agent {
  private config: LLMConfig;
  private systemPrompt: string;
  private tools: Map<string, Tool> = new Map();

  constructor(options: AgentOptions) {
    this.config = options.config;
    this.systemPrompt = options.systemPrompt || this.getDefaultSystemPrompt();
    
    // 注册工具
    if (options.tools) {
      options.tools.forEach(tool => {
        this.tools.set(tool.name, tool);
      });
    }
  }

  /**
   * 处理消息
   */
  async process(message: Message, session: Session): Promise<AgentResponse> {
    console.log(`🤖 Agent processing message: ${message.content.slice(0, 50)}...`);

    try {
      // 构建对话上下文
      const messages = this.buildMessages(session, message);
      
      // 调用 LLM
      const response = await this.callLLM(messages);
      
      // 解析响应
      return this.parseResponse(response);
    } catch (error) {
      console.error('Agent processing error:', error);
      return {
        content: '抱歉，处理消息时出现了错误。请稍后重试。',
        metadata: { error: String(error) }
      };
    }
  }

  /**
   * 构建消息列表
   */
  private buildMessages(session: Session, currentMessage: Message): any[] {
    const messages: any[] = [
      { role: 'system', content: this.systemPrompt }
    ];

    // 添加历史消息
    const recentMessages = session.messages.slice(-10); // 最近10条
    for (const msg of recentMessages) {
      if (msg.id === currentMessage.id) continue;
      
      messages.push({
        role: msg.sender.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    // 添加当前消息
    messages.push({
      role: 'user',
      content: currentMessage.content
    });

    return messages;
  }

  /**
   * 调用 LLM
   */
  private async callLLM(messages: any[]): Promise<string> {
    const { provider, apiKey, baseUrl, model, temperature = 0.7, maxTokens = 2000 } = this.config;

    // 根据提供商调用不同的 API
    switch (provider) {
      case 'openai':
        return this.callOpenAI(messages, apiKey, baseUrl, model, temperature, maxTokens);
      case 'deepseek':
        return this.callDeepSeek(messages, apiKey, baseUrl, model, temperature, maxTokens);
      case 'anthropic':
        return this.callAnthropic(messages, apiKey, baseUrl, model, temperature, maxTokens);
      case 'local':
        return this.callLocalModel(messages, baseUrl, model, temperature, maxTokens);
      default:
        // 模拟响应（开发测试用）
        return this.mockResponse(messages);
    }
  }

  /**
   * 调用 OpenAI API
   */
  private async callOpenAI(
    messages: any[],
    apiKey?: string,
    baseUrl?: string,
    model?: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<string> {
    const url = baseUrl || 'https://api.openai.com/v1/chat/completions';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'gpt-3.5-turbo',
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * 调用 DeepSeek API
   */
  private async callDeepSeek(
    messages: any[],
    apiKey?: string,
    baseUrl?: string,
    model?: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<string> {
    const url = baseUrl || 'https://api.deepseek.com/chat/completions';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * 调用 Anthropic API
   */
  private async callAnthropic(
    messages: any[],
    apiKey?: string,
    baseUrl?: string,
    model?: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<string> {
    // 转换消息格式为 Anthropic 格式
    const systemMsg = messages.find(m => m.role === 'system')?.content || '';
    const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role,
      content: m.content
    }));

    const url = baseUrl || 'https://api.anthropic.com/v1/messages';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-haiku-20240307',
        max_tokens: maxTokens,
        temperature,
        system: systemMsg,
        messages: chatMessages
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }

  /**
   * 调用本地模型
   */
  private async callLocalModel(
    messages: any[],
    baseUrl?: string,
    model?: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<string> {
    const url = baseUrl || 'http://localhost:11434/v1/chat/completions';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'llama2',
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`Local model API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * 模拟响应（测试用）
   */
  private mockResponse(messages: any[]): string {
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    if (lastMessage.includes('你好') || lastMessage.includes('hello')) {
      return '你好！我是 BestClaw AI 助手，很高兴为你服务。';
    }
    
    if (lastMessage.includes('帮助') || lastMessage.includes('help')) {
      return '我可以帮你执行各种任务，包括文件操作、命令执行、网络请求等。请告诉我你需要什么帮助。';
    }
    
    return `收到你的消息："${lastMessage.slice(0, 50)}${lastMessage.length > 50 ? '...' : ''}"

我正在开发中，暂时只能提供基础回复。请配置 LLM API 密钥以获得完整的 AI 能力。`;
  }

  /**
   * 解析响应
   */
  private parseResponse(content: string): AgentResponse {
    // 尝试解析 JSON 格式的响应（包含动作）
    try {
      const parsed = JSON.parse(content);
      if (parsed.content && parsed.actions) {
        return parsed as AgentResponse;
      }
    } catch {
      // 不是 JSON 格式，直接返回文本
    }

    return { content };
  }

  /**
   * 获取默认系统提示词
   */
  private getDefaultSystemPrompt(): string {
    return `你是 BestClaw，一个智能 AI 助手。

你的能力包括：
1. 回答问题和提供信息
2. 执行文件操作（读取、写入、搜索）
3. 运行命令和脚本
4. 进行网络请求
5. 管理任务和提醒

请以友好、专业的方式回应用户的请求。如果用户要求执行可能有害的操作，请拒绝并解释原因。`;
  }

  /**
   * 注册工具
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * 获取已注册的工具
   */
  getTools(): Tool[] {
    return Array.from(this.tools.values());
  }
}
