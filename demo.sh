#!/bin/bash
# BestClaw 演示脚本

echo "🦞 BestClaw 服务演示"
echo "===================="
echo ""

cd ~/dev/openclaw/BestClaw

echo "1️⃣  启动服务..."
echo ""

# 使用 expect 自动交互
/usr/bin/expect << 'EOF'
set timeout 10

spawn npm start chat

expect "BestClaw is ready!"
send "你好\r"

expect "收到你的消息"
send "帮助\r"

expect {
    "我可以帮你" {
        send "exit\r"
    }
    timeout {
        send "exit\r"
    }
}

expect eof
EOF

echo ""
echo "✅ 演示完成"
