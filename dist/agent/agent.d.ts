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
export declare class Agent {
    private config;
    private systemPrompt;
    private tools;
    constructor(options: AgentOptions);
    /**
     * 处理消息
     */
    process(message: Message, session: Session): Promise<AgentResponse>;
    /**
     * 构建消息列表
     */
    private buildMessages;
    /**
     * 调用 LLM
     */
    private callLLM;
    /**
     * 调用 OpenAI API
     */
    private callOpenAI;
    /**
     * 调用 DeepSeek API
     */
    private callDeepSeek;
    /**
     * 调用 Anthropic API
     */
    private callAnthropic;
    /**
     * 调用 Minimax API
     */
    private callMinimax;
    /**
     * 调用本地模型
     */
    private callLocalModel;
    /**
     * 模拟响应（测试用）
     */
    private mockResponse;
    /**
     * 解析响应
     */
    private parseResponse;
    /**
     * 获取默认系统提示词
     */
    private getDefaultSystemPrompt;
    /**
     * 注册工具
     */
    registerTool(tool: Tool): void;
    /**
     * 获取已注册的工具
     */
    getTools(): Tool[];
}
//# sourceMappingURL=agent.d.ts.map