/**
 * Telegram Channel
 * Telegram Bot API 集成
 */
import { Channel } from './channel.js';
import type { ChannelConfig } from '../types.js';
export interface TelegramConfig extends ChannelConfig {
    botToken: string;
    webhookUrl?: string;
    polling?: boolean;
    allowedUpdates?: string[];
}
export declare class TelegramChannel extends Channel {
    private bot;
    private telegramConfig;
    constructor(config: TelegramConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendMessage(to: string, content: string, options?: any): Promise<void>;
    sendPhoto(chatId: string, photo: string | Buffer, caption?: string, options?: any): Promise<void>;
    sendDocument(chatId: string, document: string | Buffer, caption?: string, options?: any): Promise<void>;
    private setupEventHandlers;
    private convertToMessage;
    private importTelegramBot;
    /**
     * Get bot information
     */
    getBotInfo(): Promise<{
        id: number;
        username: string;
        first_name: string;
    }>;
    /**
     * Set webhook for receiving updates
     */
    setWebhook(url: string, options?: any): Promise<void>;
    /**
     * Delete webhook
     */
    deleteWebhook(): Promise<void>;
}
//# sourceMappingURL=telegram.d.ts.map