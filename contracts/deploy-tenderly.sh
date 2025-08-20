#!/bin/bash

# BatchTransfer 合约 Tenderly 快速部署脚本
# 使用方法: ./deploy-tenderly.sh

set -e

echo "🚀 BatchTransfer 合约 Tenderly 部署脚本"
echo "==========================================="

# 检查必需的工具
echo "📋 检查必需工具..."
if ! command -v forge &> /dev/null; then
    echo "❌ 错误: 未找到 forge 命令。请安装 Foundry。"
    echo "安装命令: curl -L https://foundry.paradigm.xyz | bash && foundryup"
    exit 1
fi

if ! command -v cast &> /dev/null; then
    echo "❌ 错误: 未找到 cast 命令。请安装 Foundry。"
    exit 1
fi

echo "✅ Foundry 工具检查通过"

# 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件，从模板创建..."
    cp .env.example .env
    echo "📝 请编辑 .env 文件，填入您的私钥和其他配置"
    echo "重要: 请使用测试私钥，不要使用包含真实资金的私钥！"
    exit 1
fi

# 加载环境变量
source .env

# 检查必需的环境变量
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ 错误: 请在 .env 文件中设置 PRIVATE_KEY"
    exit 1
fi

if [ -z "$TENDERLY_RPC_URL" ]; then
    echo "❌ 错误: 请在 .env 文件中设置 TENDERLY_RPC_URL"
    exit 1
fi

echo "✅ 环境变量检查通过"

# 编译合约
echo "🔨 编译合约..."
forge build
if [ $? -ne 0 ]; then
    echo "❌ 合约编译失败"
    exit 1
fi
echo "✅ 合约编译成功"

# 检查账户余额
echo "💰 检查账户余额..."
DEPLOYER_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY)
BALANCE=$(cast balance $DEPLOYER_ADDRESS --rpc-url $TENDERLY_RPC_URL)
echo "部署账户: $DEPLOYER_ADDRESS"
echo "账户余额: $BALANCE Wei"

if [ "$BALANCE" = "0" ]; then
    echo "⚠️  警告: 账户余额为 0，可能需要在 Tenderly 控制台中添加测试 ETH"
fi

# 部署合约
echo "🚀 部署合约到 Tenderly..."
echo "RPC URL: $TENDERLY_RPC_URL"
echo "部署者: $DEPLOYER_ADDRESS"
echo ""

# 执行部署
DEPLOY_OUTPUT=$(forge script script/Deploy.s.sol:DeployScript \
    --rpc-url $TENDERLY_RPC_URL \
    --broadcast \
    --private-key $PRIVATE_KEY 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ 部署失败:"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi

echo "$DEPLOY_OUTPUT"

# 从部署输出中提取合约地址
CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "BatchTransfer deployed to:" | awk '{print $4}')

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ 无法从部署输出中提取合约地址"
    exit 1
fi

echo ""
echo "✅ 部署成功！"
echo "合约地址: $CONTRACT_ADDRESS"

# 验证部署
echo "🔍 验证部署..."
MAX_RECIPIENTS=$(cast call $CONTRACT_ADDRESS "MAX_RECIPIENTS()" --rpc-url $TENDERLY_RPC_URL)
TOTAL_TRANSACTIONS=$(cast call $CONTRACT_ADDRESS "totalTransactions()" --rpc-url $TENDERLY_RPC_URL)

echo "最大接收者数量: $((MAX_RECIPIENTS))"
echo "总交易数: $((TOTAL_TRANSACTIONS))"

if [ "$MAX_RECIPIENTS" = "200" ] && [ "$TOTAL_TRANSACTIONS" = "0" ]; then
    echo "✅ 合约验证成功！"
else
    echo "⚠️  合约验证异常，请检查部署状态"
fi

# 更新环境变量文件
echo "📝 更新 .env 文件..."
if grep -q "BATCH_TRANSFER_ADDRESS_TENDERLY=" .env; then
    # 如果存在，则更新
    sed -i.bak "s/BATCH_TRANSFER_ADDRESS_TENDERLY=.*/BATCH_TRANSFER_ADDRESS_TENDERLY=$CONTRACT_ADDRESS/" .env
else
    # 如果不存在，则添加
    echo "BATCH_TRANSFER_ADDRESS_TENDERLY=$CONTRACT_ADDRESS" >> .env
fi

echo "✅ 环境变量已更新"

# 显示总结
echo ""
echo "🎉 部署完成！"
echo "==========================================="
echo "合约地址: $CONTRACT_ADDRESS"
echo "网络: Tenderly Virtual Network"
echo "RPC URL: $TENDERLY_RPC_URL"
echo "部署者: $DEPLOYER_ADDRESS"
echo "最大接收者: 200"
echo "==========================================="
echo ""
echo "📋 下一步:"
echo "1. 在 Tenderly 控制台中查看合约: https://dashboard.tenderly.co/"
echo "2. 更新前端配置文件中的合约地址"
echo "3. 进行功能测试"
echo "4. 准备主网部署"
echo ""
echo "🔗 有用的命令:"
echo "# 检查合约状态"
echo "cast call $CONTRACT_ADDRESS \"MAX_RECIPIENTS()\" --rpc-url \$TENDERLY_RPC_URL"
echo ""
echo "# 检查账户余额"
echo "cast balance $DEPLOYER_ADDRESS --rpc-url \$TENDERLY_RPC_URL"
echo ""
echo "✨ 部署脚本执行完成！"