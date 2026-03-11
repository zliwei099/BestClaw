/**
 * Telegram Channel
 * Telegram Bot API 集成
 */

import { Channel } from './channel.js';
import type { Message, Sender, ChannelConfig, ChannelInfo } from '../types.js';

export interface TelegramConfig extends ChannelConfig {
  botToken: string;
  webhookUrl?: string;
  polling?: boolean;
  allowedUpdates?: string[];
}

export class TelegramChannel extends Channel {
  private bot: any;
  private telegramConfig: TelegramConfig;

  constructor(config: TelegramConfig) {
    const info: ChannelInfo = {
      id: 'telegram',
      name: 'Telegram',
      type: 'telegram'
    };
    super(info, config);
    this.telegramConfig = config;
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    try {
      const TelegramBot = await this.importTelegramBot();
      
      this.bot = new TelegramBot(this.telegramConfig.botToken, {
        polling: this.telegramConfig.polling ?? true,
        allowedUpdates: this.telegramConfig.allowedUpdates
      });

      this.setupEventHandlers();

      this.connected = true;
      this.emit('connected');
      
      console.log('📱 Telegram Channel connected');
    } catch (error) {
      console.error('Failed to connect Telegram channel:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) return;

    try {
      if (this.telegramConfig.polling ?? true) {
        this.bot.stopPolling();
      }
      this.connected = false;
      this.emit('disconnected');
      console.log('📱 Telegram Channel disconnected');
    } catch (error) {
      console.error('Error disconnecting Telegram channel:', error);
      throw error;
    }
  }

  async sendMessage(to: string, content: string, options?: any): Promise<void> {
    if (!this.connected) {
      throw new Error('Telegram channel not connected');
    }

    try {
      const chatId = to;
      const parseMode = options?.parseMode || 'Markdown';
      
      await this.bot.sendMessage(chatId, content, {
        parse_mode: parseMode,
        ...options
      });
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      throw error;
    }
  }

  async sendPhoto(chatId: string, photo: string | Buffer, caption?: string, options?: any): Promise<void> {
    if (!this.connected) {
      throw new Error('Telegram channel not connected');
    }

    try {
      await this.bot.sendPhoto(chatId, photo, {
        caption,
        parse_mode: options?.parseMode || 'Markdown',
        ...options
      });
    } catch (error) {
      console.error('Failed to send Telegram photo:', error);
      throw error;
    }
  }

  async sendDocument(chatId: string, document: string | Buffer, caption?: string, options?: any): Promise<void> {
    if (!this.connected) {
      throw new Error('Telegram channel not connected');
    }

    try {
      await this.bot.sendDocument(chatId, document, {
        caption,
        parse_mode: options?.parseMode || 'Markdown',
        ...options
      });
    } catch (error) {
      console.error('Failed to send Telegram document:', error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    // Handle text messages
    this.bot.on('message', (msg: any) => {
      if (msg.text) {
        const message = this.convertToMessage(msg);
        this.emit('message', message);
      }
    });

    // Handle edited messages
    this.bot.on('edited_message', (msg: any) => {
      if (msg.text) {
        const message = this.convertToMessage(msg, true);
        this.emit('message:edited', message);
      }
    });

    // Handle errors
    this.bot.on('polling_error', (error: any) => {
      console.error('Telegram polling error:', error);
      this.emit('error', error);
    });
  }

  private convertToMessage(telegramMsg: any, isEdited: boolean = false): Message {
    const sender: Sender = {
      id: telegramMsg.from?.id?.toString() || 'unknown',
      name: telegramMsg.from?.first_name || telegramMsg.from?.username || 'Unknown',
      type: 'user'
    };

    const attachments: any[] = [];

    // Handle photo attachments
    if (telegramMsg.photo && telegramMsg.photo.length > 0) {
      const photo = telegramMsg.photo[telegramMsg.photo.length - 1]; // Get largest
      attachments.push({
        id: photo.file_id,
        type: 'image',
        url: photo.file_id
      });
    }

    // Handle document attachments
    if (telegramMsg.document) {
      attachments.push({
        id: telegramMsg.document.file_id,
        type: 'file',
        filename: telegramMsg.document.file_name,
        mimeType: telegramMsg.document.mime_type,
        url: telegramMsg.document.file_id
      });
    }

    // Handle voice/audio
    if (telegramMsg.voice || telegramMsg.audio) {
      const audio = telegramMsg.voice || telegramMsg.audio;
      attachments.push({
        id: audio.file_id,
        type: 'audio',
        mimeType: audio.mime_type,
        url: audio.file_id
      });
    }

    // Handle video
    if (telegramMsg.video) {
      attachments.push({
        id: telegramMsg.video.file_id,
        type: 'video',
        mimeType: telegramMsg.video.mime_type,
        url: telegramMsg.video.file_id
      });
    }

    const message: Message = {
      id: isEdited 
        ? `edited-${telegramMsg.message_id}-${telegramMsg.edit_date}`
        : telegramMsg.message_id.toString(),
      content: telegramMsg.text || telegramMsg.caption || '',
      sender,
      channel: this.info,
      timestamp: new Date(telegramMsg.date * 1000),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    return message;
  }

  private async importTelegramBot(): Promise<any> {
    try {
      const module = await import('node-telegram-bot-api');
      return module.default || module;
    } catch (error) {
      throw new Error(
        'node-telegram-bot-api is required for Telegram channel. ' +
        'Install it with: npm install node-telegram-bot-api'
      );
    }
  }

  /**
   * Get bot information
   */
  async getBotInfo(): Promise<{ id: number; username: string; first_name: string }> {
    if (!this.connected) {
      throw new Error('Telegram channel not connected');
    }
    return await this.bot.getMe();
  }

  /**
   * Set webhook for receiving updates
   */
  async setWebhook(url: string, options?: any): Promise<void> {
    if (!this.connected) {
      throw new Error('Telegram channel not connected');
    }
    await this.bot.setWebHook(url, options);
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(): Promise<void> {
    if (!this.connected) {
      throw new Error('Telegram channel not connected');
    }
    await this.bot.deleteWebHook();
  }
}
