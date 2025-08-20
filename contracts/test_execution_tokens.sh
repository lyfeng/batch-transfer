#!/bin/bash

# ExecutionToken功能测试脚本
# 用于验证智能合约的防重复执行机制

echo "🧪 开始测试 ExecutionToken 功能..."
echo "======================================"

# 运行所有executionToken相关的测试
echo "📋 运行 ExecutionToken 相关测试..."
forge test --match-test testExecution -v

if [ $? -eq 0 ]; then
    echo "✅ ExecutionToken 测试全部通过！"
else
    echo "❌ ExecutionToken 测试失败！"
    exit 1
fi

echo ""
echo "🔍 运行完整测试套件..."
forge test -v

if [ $? -eq 0 ]; then
    echo "✅ 所有测试通过！ExecutionToken 功能正常工作。"
    echo ""
    echo "📊 测试覆盖的功能："
    echo "   • 防重复执行机制"
    echo "   • 执行令牌状态查询"
    echo "   • 不同用户使用相同令牌的防护"
    echo "   • 空执行令牌的验证"
    echo "   • 事件触发验证"
    echo "   • 多个不同令牌的正常使用"
else
    echo "❌ 测试套件中有失败的测试！"
    exit 1
fi

echo ""
echo "🎉 ExecutionToken 功能验证完成！"