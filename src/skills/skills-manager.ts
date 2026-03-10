/**
 * BestClaw Skills System
 * 技能插件系统 - 管理技能的加载和执行
 */

import type { Skill, Tool, SkillContext, SkillConfig } from '../types.js';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

export class SkillsManager {
  private skills: Map<string, Skill> = new Map();
  private tools: Map<string, Tool> = new Map();
  private skillsDir: string;

  constructor(skillsDir: string = './skills') {
    this.skillsDir = skillsDir;
  }

  /**
   * 初始化技能系统
   */
  async initialize(): Promise<void> {
    console.log('🔧 Initializing Skills Manager...');
    
    // 加载内置技能
    await this.loadBuiltInSkills();
    
    // 加载自定义技能
    await this.loadCustomSkills();
    
    console.log(`✅ Loaded ${this.skills.size} skills with ${this.tools.size} tools`);
  }

  /**
   * 加载内置技能
   */
  private async loadBuiltInSkills(): Promise<void> {
    // 文件操作技能
    this.registerSkill(await this.createFileSkill());
    
    // 命令执行技能
    this.registerSkill(await this.createExecSkill());
    
    // 网络请求技能
    this.registerSkill(await this.createNetworkSkill());
  }

  /**
   * 加载自定义技能
   */
  private async loadCustomSkills(): Promise<void> {
    if (!existsSync(this.skillsDir)) {
      return;
    }

    try {
      const entries = readdirSync(this.skillsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          await this.loadSkillFromDirectory(join(this.skillsDir, entry.name));
        }
      }
    } catch (error) {
      console.error('Error loading custom skills:', error);
    }
  }

  /**
   * 从目录加载技能
   */
  private async loadSkillFromDirectory(dir: string): Promise<void> {
    try {
      const skillModule = await import(join(dir, 'index.js'));
      if (skillModule.default && typeof skillModule.default === 'object') {
        this.registerSkill(skillModule.default as Skill);
      }
    } catch (error) {
      console.error(`Error loading skill from ${dir}:`, error);
    }
  }

  /**
   * 注册技能
   */
  registerSkill(skill: Skill): void {
    this.skills.set(skill.name, skill);
    
    // 注册技能的工具
    skill.tools.forEach(tool => {
      this.tools.set(`${skill.name}:${tool.name}`, tool);
    });
    
    console.log(`  📦 Registered skill: ${skill.name} (${skill.tools.length} tools)`);
  }

  /**
   * 执行技能
   */
  async executeSkill(name: string, context: SkillContext): Promise<any> {
    const skill = this.skills.get(name);
    if (!skill) {
      throw new Error(`Skill "${name}" not found`);
    }

    console.log(`🎯 Executing skill: ${name}`);
    return skill.execute(context);
  }

  /**
   * 获取工具
   */
  getTool(fullName: string): Tool | undefined {
    return this.tools.get(fullName);
  }

  /**
   * 获取所有工具
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 获取技能列表
   */
  getSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  /**
   * 创建文件操作技能
   */
  private async createFileSkill(): Promise<Skill> {
    const { fileTools } = await import('../tools/file.js');
    
    return {
      name: 'file',
      description: '文件操作技能 - 读取、写入、搜索文件',
      version: '1.0.0',
      tools: fileTools,
      execute: async (context) => {
        // 技能级别的执行逻辑
        console.log('File skill executed');
      }
    };
  }

  /**
   * 创建命令执行技能
   */
  private async createExecSkill(): Promise<Skill> {
    const { execTools } = await import('../tools/exec.js');
    
    return {
      name: 'exec',
      description: '命令执行技能 - 运行系统命令和脚本',
      version: '1.0.0',
      tools: execTools,
      execute: async (context) => {
        console.log('Exec skill executed');
      }
    };
  }

  /**
   * 创建网络请求技能
   */
  private async createNetworkSkill(): Promise<Skill> {
    const { networkTools } = await import('../tools/network.js');
    
    return {
      name: 'network',
      description: '网络请求技能 - HTTP 请求和网页抓取',
      version: '1.0.0',
      tools: networkTools,
      execute: async (context) => {
        console.log('Network skill executed');
      }
    };
  }
}
