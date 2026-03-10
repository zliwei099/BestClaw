#!/bin/bash
# BestClaw Auto-Dev Cron Script
# 每小时执行一次开发迭代

PROJECT_DIR="$HOME/dev/openclaw/BestClaw"
LOG_FILE="/tmp/bestclaw-cron.log"

echo "========================================" >> "$LOG_FILE"
echo "BestClaw Auto-Dev Iteration - $(date)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

cd "$PROJECT_DIR" || exit 1

# 1. 规划下一个任务
echo "[$(date +%H:%M:%S)] Planning next task..." >> "$LOG_FILE"
node scripts/auto-dev.mjs >> "$LOG_FILE" 2>&1

# 2. 检查是否有任务在执行
if [ -f ".current-task.md" ]; then
    echo "[$(date +%H:%M:%S)] Task found, ready for development" >> "$LOG_FILE"
    echo "Task details:" >> "$LOG_FILE"
    head -20 .current-task.md >> "$LOG_FILE"
else
    echo "[$(date +%H:%M:%S)] No task generated" >> "$LOG_FILE"
fi

echo "" >> "$LOG_FILE"
