/**
 * BestClaw Logger
 * 结构化日志系统 - 支持分级和文件输出
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LoggerOptions {
    level?: LogLevel;
    enableConsole?: boolean;
    enableFile?: boolean;
    filePath?: string;
    maxFileSize?: number;
    maxFiles?: number;
}
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: string;
    data?: any;
}
export declare class Logger {
    private level;
    private enableConsole;
    private enableFile;
    private filePath;
    private context;
    private static levelPriority;
    constructor(context?: string, options?: LoggerOptions);
    /**
     * 获取默认日志路径
     */
    private getDefaultLogPath;
    /**
     * 确保日志目录存在
     */
    private ensureLogDirectory;
    /**
     * 检查日志级别是否应该输出
     */
    private shouldLog;
    /**
     * 格式化日志条目
     */
    private formatLogEntry;
    /**
     * 创建日志条目
     */
    private createLogEntry;
    /**
     * 输出日志到控制台
     */
    private logToConsole;
    /**
     * 输出日志到文件
     */
    private logToFile;
    /**
     * 输出日志
     */
    private log;
    /**
     * Debug 级别日志
     */
    debug(message: string, data?: any): void;
    /**
     * Info 级别日志
     */
    info(message: string, data?: any): void;
    /**
     * Warn 级别日志
     */
    warn(message: string, data?: any): void;
    /**
     * Error 级别日志
     */
    error(message: string, data?: any): void;
    /**
     * 创建子 Logger
     */
    child(context: string): Logger;
    /**
     * 设置日志级别
     */
    setLevel(level: LogLevel): void;
    /**
     * 获取日志级别
     */
    getLevel(): LogLevel;
    /**
     * 启用/禁用控制台输出
     */
    setEnableConsole(enable: boolean): void;
    /**
     * 启用/禁用文件输出
     */
    setEnableFile(enable: boolean): void;
}
export declare function getLogger(context?: string): Logger;
export declare function createLogger(context: string, options?: LoggerOptions): Logger;
//# sourceMappingURL=logger.d.ts.map