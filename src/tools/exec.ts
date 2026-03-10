/**
 * BestClaw Exec Tools
 * 命令执行工具集
 */

import type { Tool } from '../types.js';
import { spawn } from 'child_process';

export const execTools: Tool[] = [
  {
    name: 'run',
    description: '执行系统命令',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: '要执行的命令' },
        args: { type: 'array', items: { type: 'string' }, description: '命令参数' },
        cwd: { type: 'string', description: '工作目录' },
        timeout: { type: 'number', description: '超时时间（毫秒）', default: 30000 },
        env: { type: 'object', description: '环境变量' }
      },
      required: ['command']
    },
    handler: async (params: { 
      command: string; 
      args?: string[]; 
      cwd?: string; 
      timeout?: number;
      env?: Record<string, string>;
    }) => {
      const { command, args = [], cwd, timeout = 30000, env } = params;
      
      return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
          cwd,
          env: { ...process.env, ...env },
          shell: true
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        const timeoutId = setTimeout(() => {
          child.kill();
          reject(new Error(`Command timed out after ${timeout}ms`));
        }, timeout);
        
        child.on('close', (code) => {
          clearTimeout(timeoutId);
          resolve({
            code,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            success: code === 0
          });
        });
        
        child.on('error', (error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
      });
    }
  },
  
  {
    name: 'shell',
    description: '执行 shell 脚本',
    parameters: {
      type: 'object',
      properties: {
        script: { type: 'string', description: 'shell 脚本内容' },
        cwd: { type: 'string', description: '工作目录' },
        timeout: { type: 'number', description: '超时时间（毫秒）', default: 30000 }
      },
      required: ['script']
    },
    handler: async (params: { script: string; cwd?: string; timeout?: number }) => {
      const { script, cwd, timeout = 30000 } = params;
      
      return new Promise((resolve, reject) => {
        const child = spawn('bash', ['-c', script], {
          cwd,
          env: process.env
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        const timeoutId = setTimeout(() => {
          child.kill();
          reject(new Error(`Script timed out after ${timeout}ms`));
        }, timeout);
        
        child.on('close', (code) => {
          clearTimeout(timeoutId);
          resolve({
            code,
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            success: code === 0
          });
        });
        
        child.on('error', (error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
      });
    }
  }
];
