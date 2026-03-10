/**
 * BestClaw Channels
 * 渠道抽象层 - 定义消息渠道接口
 */
import { EventEmitter } from 'events';
export class Channel extends EventEmitter {
    config;
    info;
    connected = false;
    constructor(info, config) {
        super();
        this.info = info;
        this.config = config;
    }
    /**
     * 获取渠道信息
     */
    getInfo() {
        return this.info;
    }
    /**
     * 检查是否已连接
     */
    isConnected() {
        return this.connected;
    }
    /**
     * 创建标准消息对象
     */
    createMessage(content, sender, attachments) {
        return {
            id: this.generateId(),
            content,
            sender,
            channel: this.info,
            timestamp: new Date(),
            attachments
        };
    }
    /**
     * 生成唯一 ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
/**
 * CLI 渠道实现
 */
export class CLIChannel extends Channel {
    rl;
    constructor(config = { enabled: true }) {
        super({ id: 'cli', name: 'CLI', type: 'cli' }, config);
    }
    async connect() {
        if (this.connected)
            return;
        const { createInterface } = await import('readline');
        this.rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });
        console.log('💻 CLI Channel connected. Type your messages (exit to quit):\n');
        this.rl.on('line', (input) => {
            if (input.trim().toLowerCase() === 'exit') {
                this.disconnect();
                process.exit(0);
            }
            const message = this.createMessage(input, { id: 'user', name: 'User', type: 'user' });
            this.emit('message', message);
        });
        this.connected = true;
        this.emit('connected');
    }
    async disconnect() {
        if (!this.connected)
            return;
        this.rl?.close();
        this.connected = false;
        this.emit('disconnected');
    }
    async sendMessage(to, content) {
        console.log(`\n🤖 ${content}\n`);
    }
}
/**
 * 渠道管理器
 */
export class ChannelsManager {
    channels = new Map();
    /**
     * 注册渠道
     */
    register(channel) {
        this.channels.set(channel.getInfo().id, channel);
    }
    /**
     * 获取渠道
     */
    get(id) {
        return this.channels.get(id);
    }
    /**
     * 获取所有渠道
     */
    getAll() {
        return Array.from(this.channels.values());
    }
    /**
     * 连接所有启用的渠道
     */
    async connectAll() {
        for (const channel of this.channels.values()) {
            if (!channel.isConnected()) {
                try {
                    await channel.connect();
                }
                catch (error) {
                    console.error(`Failed to connect channel ${channel.getInfo().id}:`, error);
                }
            }
        }
    }
    /**
     * 断开所有渠道
     */
    async disconnectAll() {
        for (const channel of this.channels.values()) {
            if (channel.isConnected()) {
                try {
                    await channel.disconnect();
                }
                catch (error) {
                    console.error(`Failed to disconnect channel ${channel.getInfo().id}:`, error);
                }
            }
        }
    }
}
//# sourceMappingURL=channel.js.map