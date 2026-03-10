/**
 * BestClaw File Tools
 * 文件操作工具集
 */

import type { Tool } from '../types.js';
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

// 安全检查：限制文件访问范围
const ALLOWED_ROOTS = [
  process.cwd(),
  process.env.HOME || '',
  '/tmp'
];

function isPathAllowed(filePath: string): boolean {
  const resolved = resolve(filePath);
  return ALLOWED_ROOTS.some(root => {
    const resolvedRoot = resolve(root);
    return resolved.startsWith(resolvedRoot);
  });
}

export const fileTools: Tool[] = [
  {
    name: 'read',
    description: '读取文件内容',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '文件路径' },
        encoding: { type: 'string', description: '编码格式', default: 'utf-8' }
      },
      required: ['path']
    },
    handler: async (params: { path: string; encoding?: string }) => {
      const { path, encoding = 'utf-8' } = params;
      
      if (!isPathAllowed(path)) {
        throw new Error(`Access denied: ${path}`);
      }
      
      if (!existsSync(path)) {
        throw new Error(`File not found: ${path}`);
      }
      
      const content = readFileSync(path, encoding as BufferEncoding);
      return { content, path };
    }
  },
  
  {
    name: 'write',
    description: '写入文件内容',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '文件路径' },
        content: { type: 'string', description: '文件内容' },
        encoding: { type: 'string', description: '编码格式', default: 'utf-8' }
      },
      required: ['path', 'content']
    },
    handler: async (params: { path: string; content: string; encoding?: string }) => {
      const { path, content, encoding = 'utf-8' } = params;
      
      if (!isPathAllowed(path)) {
        throw new Error(`Access denied: ${path}`);
      }
      
      // 确保目录存在
      const dir = path.substring(0, path.lastIndexOf('/'));
      if (dir && !existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      
      writeFileSync(path, content, encoding as BufferEncoding);
      return { success: true, path, bytes: Buffer.byteLength(content, encoding as BufferEncoding) };
    }
  },
  
  {
    name: 'exists',
    description: '检查文件是否存在',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '文件路径' }
      },
      required: ['path']
    },
    handler: async (params: { path: string }) => {
      return { exists: existsSync(params.path) };
    }
  },
  
  {
    name: 'stat',
    description: '获取文件信息',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '文件路径' }
      },
      required: ['path']
    },
    handler: async (params: { path: string }) => {
      if (!existsSync(params.path)) {
        throw new Error(`File not found: ${params.path}`);
      }
      
      const stats = statSync(params.path);
      return {
        path: params.path,
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        accessedAt: stats.atime
      };
    }
  },
  
  {
    name: 'list',
    description: '列出目录内容',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: '目录路径' },
        recursive: { type: 'boolean', description: '是否递归', default: false }
      },
      required: ['path']
    },
    handler: async (params: { path: string; recursive?: boolean }) => {
      const { path, recursive = false } = params;
      
      if (!existsSync(path)) {
        throw new Error(`Directory not found: ${path}`);
      }
      
      const entries = readdirSync(path, { withFileTypes: true, recursive });
      
      return {
        path,
        entries: entries.map(e => ({
          name: e.name,
          isFile: e.isFile(),
          isDirectory: e.isDirectory(),
          path: join(path, e.name)
        }))
      };
    }
  }
];
