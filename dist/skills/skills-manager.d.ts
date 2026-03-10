/**
 * BestClaw Skills System
 * 技能插件系统 - 管理技能的加载和执行
 */
import type { Skill, Tool, SkillContext } from '../types.js';
export declare class SkillsManager {
    private skills;
    private tools;
    private skillsDir;
    private logger;
    constructor(skillsDir?: string);
    /**
     * 初始化技能系统
     */
    initialize(): Promise<void>;
    /**
     * 加载内置技能
     */
    private loadBuiltInSkills;
    /**
     * 加载自定义技能
     */
    private loadCustomSkills;
    /**
     * 从目录加载技能
     */
    private loadSkillFromDirectory;
    /**
     * 注册技能
     */
    registerSkill(skill: Skill): void;
    /**
     * 执行技能
     */
    executeSkill(name: string, context: SkillContext): Promise<any>;
    /**
     * 获取工具
     */
    getTool(fullName: string): Tool | undefined;
    /**
     * 获取所有工具
     */
    getAllTools(): Tool[];
    /**
     * 获取技能列表
     */
    getSkills(): Skill[];
    /**
     * 创建文件操作技能
     */
    private createFileSkill;
    /**
     * 创建命令执行技能
     */
    private createExecSkill;
    /**
     * 创建网络请求技能
     */
    private createNetworkSkill;
}
//# sourceMappingURL=skills-manager.d.ts.map