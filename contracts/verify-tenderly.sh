#!/bin/bash

# BatchTransfer 合约 Tenderly 验证脚本
# 使用方法: ./verify-tenderly.sh [合约地址]

set -e

echo "🔍 BatchTransfer 合约 Tenderly 验证脚本"
echo "==========================================="

# 检查必需的工具
if ! command -v cast &> /dev/null; then
    echo "❌ 错误: 未找到 cast 命令。请安装 Foundry。"
    exit 1
fi

# 加载环境变量
if [ ! -f ".env" ]; then
    echo "❌ 错误: 未找到 .env 文件"
    exit 1
fi

source .env

# 检查 RPC URL
if [ -z "$TENDERLY_RPC_URL" ]; then
    echo "❌ 错误: 请在 .env 文件中设置 TENDERLY_RPC_URL"
    exit 1
fi

# 获取合约地址
CONTRACT_ADDRESS="$1"
if [ -z "$CONTRACT_ADDRESS" ]; then
    if [ -n "$BATCH_TRANSFER_ADDRESS_TENDERLY" ]; then
        CONTRACT_ADDRESS="$BATCH_TRANSFER_ADDRESS_TENDERLY"
        echo "📋 使用环境变量中的合约地址: $CONTRACT_ADDRESS"
    else
        echo "❌ 错误: 请提供合约地址作为参数，或在 .env 文件中设置 BATCH_TRANSFER_ADDRESS_TENDERLY"
        echo "使用方法: ./verify-tenderly.sh <合约地址>"
        exit 1
    fi
fi

echo "🔗 验证合约: $CONTRACT_ADDRESS"
echo "🌐 网络: Tenderly Virtual Network"
echo "🔌 RPC: $TENDERLY_RPC_URL"
echo ""

# 检查合约是否存在
echo "1️⃣ 检查合约代码..."
CODE=$(cast code $CONTRACT_ADDRESS --rpc-url $TENDERLY_RPC_URL)
if [ "$CODE" = "0x" ]; then
    echo "❌ 错误: 合约地址 $CONTRACT_ADDRESS 上没有部署代码"
    exit 1
fi
echo "✅ 合约代码存在 (${#CODE} 字符)"

# 检查合约基本信息
echo ""
echo "2️⃣ 检查合约基本信息..."

# 检查最大接收者数量
echo -n "最大接收者数量: "
MAX_RECIPIENTS=$(cast call $CONTRACT_ADDRESS "MAX_RECIPIENTS()" --rpc-url $TENDERLY_RPC_URL 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "$((MAX_RECIPIENTS))"
    if [ "$((MAX_RECIPIENTS))" != "200" ]; then
        echo "⚠️  警告: 期望值为 200，实际值为 $((MAX_RECIPIENTS))"
    fi
else
    echo "❌ 无法获取"
fi

# 检查总交易数
echo -n "总交易数: "
TOTAL_TRANSACTIONS=$(cast call $CONTRACT_ADDRESS "totalTransactions()" --rpc-url $TENDERLY_RPC_URL 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "$((TOTAL_TRANSACTIONS))"
else
    echo "❌ 无法获取"
fi

# 检查合约所有者
echo -n "合约所有者: "
OWNER_RAW=$(cast call $CONTRACT_ADDRESS "owner()" --rpc-url $TENDERLY_RPC_URL 2>/dev/null)
if [ $? -eq 0 ]; then
    # 将32字节格式转换为标准地址格式（提取后20字节）
    OWNER="0x${OWNER_RAW: -40}"
    echo "$OWNER"
else
    echo "❌ 无法获取"
fi

# 检查部署者信息
if [ -n "$PRIVATE_KEY" ]; then
    echo ""
    echo "3️⃣ 检查部署者信息..."
    DEPLOYER_ADDRESS=$(cast wallet address --private-key $PRIVATE_KEY 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "部署者地址: $DEPLOYER_ADDRESS"
        
        # 检查余额
        BALANCE=$(cast balance $DEPLOYER_ADDRESS --rpc-url $TENDERLY_RPC_URL 2>/dev/null)
        if [ $? -eq 0 ]; then
            BALANCE_ETH=$(cast to-unit $BALANCE ether 2>/dev/null)
            echo "部署者余额: $BALANCE_ETH ETH"
        fi
        
        # 检查是否为合约所有者（转换为小写进行比较）
        OWNER_LOWER=$(echo "$OWNER" | tr '[:upper:]' '[:lower:]')
        DEPLOYER_LOWER=$(echo "$DEPLOYER_ADDRESS" | tr '[:upper:]' '[:lower:]')
        if [ "$OWNER_LOWER" = "$DEPLOYER_LOWER" ]; then
            echo "✅ 部署者是合约所有者"
        else
            echo "⚠️  部署者不是合约所有者"
            echo "    合约所有者: $OWNER"
            echo "    部署者地址: $DEPLOYER_ADDRESS"
        fi
    fi
fi

# 测试合约函数
echo ""
echo "4️⃣ 测试合约函数..."

# 测试执行令牌检查
echo -n "测试执行令牌检查: "
TEST_TOKEN="test-token-$(date +%s)"
IS_USED=$(cast call $CONTRACT_ADDRESS "isExecutionTokenUsed(string)" "$TEST_TOKEN" --rpc-url $TENDERLY_RPC_URL 2>/dev/null)
if [ $? -eq 0 ]; then
    if [ "$IS_USED" = "false" ]; then
        echo "✅ 正常 (新令牌未被使用)"
    else
        echo "⚠️  异常 (新令牌显示已被使用)"
    fi
else
    echo "❌ 函数调用失败"
fi

# 测试用户统计
echo -n "测试用户统计查询: "
USER_STATS=$(cast call $CONTRACT_ADDRESS "getUserStats(address)" "0x0000000000000000000000000000000000000000" --rpc-url $TENDERLY_RPC_URL 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ 正常 (零地址交易数: $((USER_STATS)))"
else
    echo "❌ 函数调用失败"
fi

# 网络连接测试
echo ""
echo "5️⃣ 网络连接测试..."
echo -n "获取最新区块号: "
BLOCK_NUMBER=$(cast block-number --rpc-url $TENDERLY_RPC_URL 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ $BLOCK_NUMBER"
else
    echo "❌ 无法连接到网络"
fi

echo -n "获取链 ID: "
CHAIN_ID=$(cast chain-id --rpc-url $TENDERLY_RPC_URL 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ $CHAIN_ID"
else
    echo "❌ 无法获取链 ID"
fi

# 生成验证报告
echo ""
echo "📊 验证报告"
echo "==========================================="
echo "合约地址: $CONTRACT_ADDRESS"
echo "网络: Tenderly Virtual Network (Chain ID: $CHAIN_ID)"
echo "RPC URL: $TENDERLY_RPC_URL"
echo "最新区块: $BLOCK_NUMBER"
echo "合约所有者: $OWNER"
echo "最大接收者: $((MAX_RECIPIENTS))"
echo "总交易数: $((TOTAL_TRANSACTIONS))"
echo "==========================================="

# 验证结果总结
echo ""
echo "✅ 验证完成！"
echo ""
echo "🔗 有用的命令:"
echo "# 检查特定用户的交易统计"
echo "cast call $CONTRACT_ADDRESS \"getUserStats(address)\" <用户地址> --rpc-url \$TENDERLY_RPC_URL"
echo ""
echo "# 检查执行令牌是否已使用"
echo "cast call $CONTRACT_ADDRESS \"isExecutionTokenUsed(string)\" \"your-token\" --rpc-url \$TENDERLY_RPC_URL"
echo ""
echo "# 在 Tenderly 控制台中查看合约"
echo "https://dashboard.tenderly.co/"
echo ""
echo "📋 如需进行批量转账测试，请确保:"
echo "1. 准备接收地址列表"
echo "2. 准备对应的金额列表"
echo "3. 生成唯一的执行令牌"
echo "4. 确保发送的 ETH 总量等于所有金额之和"