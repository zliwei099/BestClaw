/**
 * Telegram Channel Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TelegramChannel, TelegramConfig } from '../../src/channels/telegram.js';

describe('TelegramChannel', () => {
  let channel: TelegramChannel;
  const mockConfig: TelegramConfig = {
    enabled: true,
    botToken: 'test-token-12345',
    polling: true
  };

  beforeEach(() => {
    channel = new TelegramChannel(mockConfig);
  });

  afterEach(async () => {
    if (channel.isConnected()) {
      await channel.disconnect();
    }
  });

  describe('constructor', () => {
    it('should create channel with correct info', () => {
      const info = channel.getInfo();
      expect(info.id).toBe('telegram');
      expect(info.name).toBe('Telegram');
      expect(info.type).toBe('telegram');
    });

    it('should not be connected initially', () => {
      expect(channel.isConnected()).toBe(false);
    });
  });

  describe('connect', () => {
    it('should require bot token', async () => {
      const badConfig = { enabled: true, botToken: '' };
      const badChannel = new TelegramChannel(badConfig as TelegramConfig);
      
      // Empty token should fail during connect
      try {
        await badChannel.connect();
        // If it connects, we should get an error from the bot
        expect(badChannel.isConnected()).toBe(false);
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('sendMessage', () => {
    it('should throw when not connected', async () => {
      await expect(
        channel.sendMessage('123456', 'Hello')
      ).rejects.toThrow('Telegram channel not connected');
    });
  });

  describe('message conversion', () => {
    it('should emit message event', async () => {
      const messages: any[] = [];
      channel.once('message', (msg) => {
        messages.push(msg);
      });

      // Simulate message event
      channel.emit('message', {
        id: '1',
        content: 'Hello Bot',
        sender: {
          id: '12345',
          name: 'Test User',
          type: 'user'
        },
        channel: channel.getInfo(),
        timestamp: new Date()
      });

      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('Hello Bot');
      expect(messages[0].sender.id).toBe('12345');
      expect(messages[0].sender.type).toBe('user');
    });
  });

  describe('isConnected', () => {
    it('should return false initially', () => {
      expect(channel.isConnected()).toBe(false);
    });
  });

  describe('sendPhoto', () => {
    it('should throw when not connected', async () => {
      await expect(
        channel.sendPhoto('123456', 'photo-url')
      ).rejects.toThrow('Telegram channel not connected');
    });
  });

  describe('sendDocument', () => {
    it('should throw when not connected', async () => {
      await expect(
        channel.sendDocument('123456', 'doc-url')
      ).rejects.toThrow('Telegram channel not connected');
    });
  });

  describe('getBotInfo', () => {
    it('should throw when not connected', async () => {
      await expect(
        channel.getBotInfo()
      ).rejects.toThrow('Telegram channel not connected');
    });
  });
});

describe('TelegramConfig interface', () => {
  it('should accept valid config', () => {
    const config: TelegramConfig = {
      enabled: true,
      botToken: 'valid-token',
      polling: true,
      webhookUrl: 'https://example.com/webhook',
      allowedUpdates: ['message', 'callback_query']
    };

    expect(config.enabled).toBe(true);
    expect(config.botToken).toBe('valid-token');
    expect(config.polling).toBe(true);
    expect(config.webhookUrl).toBe('https://example.com/webhook');
    expect(config.allowedUpdates).toEqual(['message', 'callback_query']);
  });

  it('should work with minimal config', () => {
    const config: TelegramConfig = {
      enabled: true,
      botToken: 'minimal-token'
    };

    expect(config.enabled).toBe(true);
    expect(config.botToken).toBe('minimal-token');
    expect(config.polling).toBeUndefined();
  });
});
