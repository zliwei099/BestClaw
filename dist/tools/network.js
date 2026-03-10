/**
 * BestClaw Network Tools
 * 网络请求工具集
 */
export const networkTools = [
    {
        name: 'fetch',
        description: '发送 HTTP 请求',
        parameters: {
            type: 'object',
            properties: {
                url: { type: 'string', description: '请求 URL' },
                method: { type: 'string', description: '请求方法', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], default: 'GET' },
                headers: { type: 'object', description: '请求头' },
                body: { type: 'string', description: '请求体' },
                timeout: { type: 'number', description: '超时时间（毫秒）', default: 10000 }
            },
            required: ['url']
        },
        handler: async (params) => {
            const { url, method = 'GET', headers = {}, body, timeout = 10000 } = params;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            try {
                const response = await fetch(url, {
                    method,
                    headers,
                    body,
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                const responseHeaders = {};
                response.headers.forEach((value, key) => {
                    responseHeaders[key] = value;
                });
                const responseBody = await response.text();
                return {
                    status: response.status,
                    statusText: response.statusText,
                    headers: responseHeaders,
                    body: responseBody,
                    url: response.url
                };
            }
            catch (error) {
                clearTimeout(timeoutId);
                throw error;
            }
        }
    },
    {
        name: 'get',
        description: '发送 GET 请求',
        parameters: {
            type: 'object',
            properties: {
                url: { type: 'string', description: '请求 URL' },
                headers: { type: 'object', description: '请求头' }
            },
            required: ['url']
        },
        handler: async (params) => {
            const tool = networkTools.find(t => t.name === 'fetch');
            return tool.handler({ ...params, method: 'GET' });
        }
    },
    {
        name: 'post',
        description: '发送 POST 请求',
        parameters: {
            type: 'object',
            properties: {
                url: { type: 'string', description: '请求 URL' },
                body: { type: 'string', description: '请求体' },
                headers: { type: 'object', description: '请求头' }
            },
            required: ['url']
        },
        handler: async (params) => {
            const tool = networkTools.find(t => t.name === 'fetch');
            return tool.handler({ ...params, method: 'POST' });
        }
    },
    {
        name: 'download',
        description: '下载文件',
        parameters: {
            type: 'object',
            properties: {
                url: { type: 'string', description: '文件 URL' },
                outputPath: { type: 'string', description: '保存路径' }
            },
            required: ['url', 'outputPath']
        },
        handler: async (params) => {
            const { url, outputPath } = params;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const buffer = Buffer.from(await response.arrayBuffer());
            // 使用 file tool 保存文件
            const { writeFileSync } = await import('fs');
            writeFileSync(outputPath, buffer);
            return {
                success: true,
                path: outputPath,
                size: buffer.length,
                contentType: response.headers.get('content-type')
            };
        }
    }
];
//# sourceMappingURL=network.js.map