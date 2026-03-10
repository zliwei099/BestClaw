/**
 * BestClaw Agent
 * AI Agent 核心 - 处理大模型调用和推理
 */
export class Agent {
    config;
    systemPrompt;
    tools = new Map();
    constructor(options) {
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
    async process(message, session) {
        console.log(`🤖 Agent processing message: ${message.content.slice(0, 50)}...`);
        try {
            // 构建对话上下文
            const messages = this.buildMessages(session, message);
            // 调用 LLM
            const response = await this.callLLM(messages);
            // 解析响应
            return this.parseResponse(response);
        }
        catch (error) {
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
    buildMessages(session, currentMessage) {
        const messages = [
            { role: 'system', content: this.systemPrompt }
        ];
        // 添加历史消息
        const recentMessages = session.messages.slice(-10); // 最近10条
        for (const msg of recentMessages) {
            if (msg.id === currentMessage.id)
                continue;
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
    async callLLM(messages) {
        const { provider, apiKey, baseUrl, model, temperature = 0.7, maxTokens = 2000 } = this.config;
        // 根据提供商调用不同的 API
        switch (provider) {
            case 'openai':
                return this.callOpenAI(messages, apiKey, baseUrl, model, temperature, maxTokens);
            case 'deepseek':
                return this.callDeepSeek(messages, apiKey, baseUrl, model, temperature, maxTokens);
            case 'anthropic':
                return this.callAnthropic(messages, apiKey, baseUrl, model, temperature, maxTokens);
            case 'minimax':
                return this.callMinimax(messages, apiKey, baseUrl, model, temperature, maxTokens);
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
    async callOpenAI(messages, apiKey, baseUrl, model, temperature, maxTokens) {
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
    async callDeepSeek(messages, apiKey, baseUrl, model, temperature, maxTokens) {
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
    async callAnthropic(messages, apiKey, baseUrl, model, temperature, maxTokens) {
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
     * 调用 Minimax API
     */
    async callMinimax(messages, apiKey, baseUrl, model, temperature, maxTokens) {
        const url = baseUrl || 'https://api.minimax.chat/v1/text/chatcompletion_v2';
        // 检查 API Key 格式
        // Minimax 通常需要 GroupId.ApiKey 格式
        if (!apiKey) {
            console.warn('Minimax API Key not provided, using mock response');
            return this.mockResponse(messages);
        }
        // Minimax 需要特定的请求格式
        const requestBody = {
            model: model || 'abab6.5s-chat',
            messages: messages.map(m => ({
                sender_type: m.role === 'user' ? 'USER' : 'BOT',
                text: m.content
            })),
            temperature: temperature ?? 0.7,
            max_tokens: maxTokens ?? 2000
        };
        // Minimax Authorization 格式可能是 GroupId.ApiKey
        const authHeader = apiKey.includes('.')
            ? `Bearer ${apiKey}`
            : `Bearer ${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        // 检查 Minimax 错误响应
        if (data.base_resp?.status_code !== 0 && data.base_resp?.status_code !== undefined) {
            console.error('Minimax API error:', data.base_resp?.status_msg);
            // 认证失败时返回 mock 响应
            if (data.base_resp?.status_code === 1004) {
                console.warn('Minimax authentication failed, falling back to mock response');
                return this.mockResponse(messages);
            }
            throw new Error(`Minimax API error: ${data.base_resp?.status_msg || 'Unknown error'}`);
        }
        // Minimax 成功响应格式处理
        if (data.reply) {
            return data.reply;
        }
        if (data.choices?.[0]?.message?.content) {
            return data.choices[0].message.content;
        }
        if (data.choices?.[0]?.text) {
            return data.choices[0].text;
        }
        if (data.data?.reply) {
            return data.data.reply;
        }
        console.warn('Unexpected Minimax response format, using mock response');
        return this.mockResponse(messages);
    }
    /**
     * 调用本地模型
     */
    async callLocalModel(messages, baseUrl, model, temperature, maxTokens) {
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
    mockResponse(messages) {
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
    parseResponse(content) {
        // 尝试解析 JSON 格式的响应（包含动作）
        try {
            const parsed = JSON.parse(content);
            if (parsed.content && parsed.actions) {
                return parsed;
            }
        }
        catch {
            // 不是 JSON 格式，直接返回文本
        }
        return { content };
    }
    /**
     * 获取默认系统提示词
     */
    getDefaultSystemPrompt() {
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
    registerTool(tool) {
        this.tools.set(tool.name, tool);
    }
    /**
     * 获取已注册的工具
     */
    getTools() {
        return Array.from(this.tools.values());
    }
}
//# sourceMappingURL=agent.js.map