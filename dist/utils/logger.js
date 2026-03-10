/**
 * BestClaw Logger
 * 结构化日志系统 - 支持分级和文件输出
 */
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
export class Logger {
    level;
    enableConsole;
    enableFile;
    filePath;
    context;
    static levelPriority = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    };
    constructor(context = 'BestClaw', options = {}) {
        this.context = context;
        this.level = options.level || 'info';
        this.enableConsole = options.enableConsole !== false;
        this.enableFile = options.enableFile || false;
        this.filePath = options.filePath || this.getDefaultLogPath();
        if (this.enableFile) {
            this.ensureLogDirectory();
        }
    }
    /**
     * 获取默认日志路径
     */
    getDefaultLogPath() {
        const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
        return join(homeDir, '.bestclaw', 'logs', 'bestclaw.log');
    }
    /**
     * 确保日志目录存在
     */
    ensureLogDirectory() {
        const dir = dirname(this.filePath);
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
    }
    /**
     * 检查日志级别是否应该输出
     */
    shouldLog(level) {
        return Logger.levelPriority[level] >= Logger.levelPriority[this.level];
    }
    /**
     * 格式化日志条目
     */
    formatLogEntry(entry) {
        const { timestamp, level, message, context, data } = entry;
        let formatted = `[${timestamp}] [${level.toUpperCase()}]`;
        if (context) {
            formatted += ` [${context}]`;
        }
        formatted += ` ${message}`;
        if (data !== undefined) {
            formatted += ` ${JSON.stringify(data)}`;
        }
        return formatted;
    }
    /**
     * 创建日志条目
     */
    createLogEntry(level, message, data) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            context: this.context,
            data
        };
    }
    /**
     * 输出日志到控制台
     */
    logToConsole(entry) {
        const formatted = this.formatLogEntry(entry);
        switch (entry.level) {
            case 'debug':
                console.debug(`\x1b[90m${formatted}\x1b[0m`); // 灰色
                break;
            case 'info':
                console.info(`\x1b[36m${formatted}\x1b[0m`); // 青色
                break;
            case 'warn':
                console.warn(`\x1b[33m${formatted}\x1b[0m`); // 黄色
                break;
            case 'error':
                console.error(`\x1b[31m${formatted}\x1b[0m`); // 红色
                break;
        }
    }
    /**
     * 输出日志到文件
     */
    logToFile(entry) {
        const formatted = this.formatLogEntry(entry);
        try {
            appendFileSync(this.filePath, formatted + '\n', 'utf-8');
        }
        catch (error) {
            // 如果文件写入失败，输出到控制台
            console.error(`Failed to write to log file: ${error}`);
        }
    }
    /**
     * 输出日志
     */
    log(level, message, data) {
        if (!this.shouldLog(level)) {
            return;
        }
        const entry = this.createLogEntry(level, message, data);
        if (this.enableConsole) {
            this.logToConsole(entry);
        }
        if (this.enableFile) {
            this.logToFile(entry);
        }
    }
    /**
     * Debug 级别日志
     */
    debug(message, data) {
        this.log('debug', message, data);
    }
    /**
     * Info 级别日志
     */
    info(message, data) {
        this.log('info', message, data);
    }
    /**
     * Warn 级别日志
     */
    warn(message, data) {
        this.log('warn', message, data);
    }
    /**
     * Error 级别日志
     */
    error(message, data) {
        this.log('error', message, data);
    }
    /**
     * 创建子 Logger
     */
    child(context) {
        return new Logger(context, {
            level: this.level,
            enableConsole: this.enableConsole,
            enableFile: this.enableFile,
            filePath: this.filePath
        });
    }
    /**
     * 设置日志级别
     */
    setLevel(level) {
        this.level = level;
    }
    /**
     * 获取日志级别
     */
    getLevel() {
        return this.level;
    }
    /**
     * 启用/禁用控制台输出
     */
    setEnableConsole(enable) {
        this.enableConsole = enable;
    }
    /**
     * 启用/禁用文件输出
     */
    setEnableFile(enable) {
        this.enableFile = enable;
        if (enable) {
            this.ensureLogDirectory();
        }
    }
}
// 导出单例
let defaultLogger = null;
export function getLogger(context) {
    if (!defaultLogger) {
        defaultLogger = new Logger('BestClaw', {
            level: process.env.BESTCLAW_LOG_LEVEL || 'info',
            enableConsole: true,
            enableFile: true
        });
    }
    return context ? defaultLogger.child(context) : defaultLogger;
}
export function createLogger(context, options) {
    return new Logger(context, options);
}
//# sourceMappingURL=logger.js.map