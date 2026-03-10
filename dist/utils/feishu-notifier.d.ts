/**
 * BestClaw Feishu Notifier
 * 飞书通知模块 - 推送开发迭代状态
 */
export interface FeishuConfig {
    webhook?: string;
    userId?: string;
    chatId?: string;
    enabled: boolean;
}
export interface NotifyOptions {
    title: string;
    content: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    taskId?: string;
    taskName?: string;
    duration?: number;
}
export declare class FeishuNotifier {
    private config;
    private projectRoot;
    constructor(projectRoot?: string);
    /**
     * 加载配置
     */
    private loadConfig;
    /**
     * 检查是否启用
     */
    isEnabled(): boolean;
    /**
     * 发送通知
     */
    notify(options: NotifyOptions): Promise<boolean>;
    /**
     * 构建飞书消息
     */
    private buildMessage;
    /**
     * 通知任务开始
     */
    notifyTaskStart(taskName: string, taskDescription: string): Promise<boolean>;
    /**
     * 通知任务完成
     */
    notifyTaskComplete(taskName: string, commitHash: string, duration?: number): Promise<boolean>;
    /**
     * 通知任务失败
     */
    notifyTaskFailed(taskName: string, error: string): Promise<boolean>;
    /**
     * 通知迭代规划
     */
    notifyIterationPlanned(taskName: string, phase: string): Promise<boolean>;
}
export declare function createNotifier(projectRoot?: string): FeishuNotifier;
//# sourceMappingURL=feishu-notifier.d.ts.map