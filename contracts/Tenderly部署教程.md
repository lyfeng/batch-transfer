# BatchTransfer 合约 Tenderly 部署教程

## 概述

本教程将指导您如何将 BatchTransfer 智能合约部署到 Tenderly 虚拟网络。Tenderly 提供了一个强大的以太坊虚拟环境，可以用于测试和开发。

## 前置要求

### 必需工具
- **Foundry**: Solidity 开发框架
- **Git**: 版本控制
- **Tenderly 账户**: 用于访问虚拟网络

### 验证 Foundry 安装

```bash
# 检查 Foundry 是否已安装
forge --version
cast --version

# 如果未安装，请运行以下命令
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## 步骤 1: 项目准备

### 1.1 进入合约目录

```bash
cd /Users/leiyufeng/work/batch-transfer/contracts
```

### 1.2 安装依赖

```bash
# 使用 Makefile 安装依赖
make install

# 或者手动安装
forge install foundry-rs/forge-std
forge install OpenZeppelin/openzeppelin-contracts
```

### 1.3 编译合约

```bash
# 编译合约
make build

# 或者使用 forge 命令
forge build
```

## 步骤 2: 配置 Tenderly 网络

### 2.1 更新 foundry.toml

在 `foundry.toml` 文件中添加 Tenderly 网络配置：

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.20"
optimizer = true
optimizer_runs = 200
via_ir = false
remappings = [
    "@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/"
]

[rpc_endpoints]
mainnet = "https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}"
sepolia = "https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}"
# 添加 Tenderly 虚拟网络
tenderly = "https://virtual.mainnet.us-west.rpc.tenderly.co/697808de-4372-4815-b964-84394e11796e"

[etherscan]
mainnet = { key = "${ETHERSCAN_API_KEY}" }
sepolia = { key = "${ETHERSCAN_API_KEY}" }
```

### 2.2 更新环境变量

复制并编辑环境变量文件：

```bash
cp .env.example .env
```

在 `.env` 文件中添加 Tenderly 配置：

```bash
# Ethereum RPC URLs
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Tenderly 虚拟网络 RPC URL
TENDERLY_RPC_URL=https://virtual.mainnet.us-west.rpc.tenderly.co/697808de-4372-4815-b964-84394e11796e

# API Keys
ALCHEMY_API_KEY=your_alchemy_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Private Key (请使用测试私钥，不要使用真实资金的私钥)
PRIVATE_KEY=your_test_private_key_here

# Contract Addresses (部署后会自动填入)
BATCH_TRANSFER_ADDRESS_MAINNET=
BATCH_TRANSFER_ADDRESS_SEPOLIA=
BATCH_TRANSFER_ADDRESS_TENDERLY=
```

**⚠️ 安全提醒**:
- 使用测试私钥，不要使用包含真实资金的私钥
- 不要将 `.env` 文件提交到版本控制系统
- Tenderly 虚拟网络是安全的测试环境

## 步骤 3: 部署到 Tenderly

### 3.1 检查账户余额

```bash
# 检查部署账户在 Tenderly 网络上的余额
cast balance <your-address> --rpc-url $TENDERLY_RPC_URL
```

**注意**: Tenderly 虚拟网络通常会为测试账户提供足够的 ETH，如果余额不足，可以在 Tenderly 控制台中添加资金。

### 3.2 执行部署

使用以下命令部署合约到 Tenderly：

```bash
# 部署到 Tenderly 虚拟网络
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url $TENDERLY_RPC_URL \
    --broadcast \
    --private-key $PRIVATE_KEY
```

### 3.3 部署输出示例

成功部署后，您将看到类似以下的输出：

```
== Logs ==
  BatchTransfer deployed to: 0x1234567890123456789012345678901234567890
  Deployer: 0xYourDeployerAddress
  Max recipients: 200

## Setting up 1 EVM.

==========================

Chain 1

Estimated gas price: 1.000000001 gwei

Estimated total gas used for script: 1234567

Estimated amount required: 0.001234567001234567 ETH

==========================

##### tenderly
✅  [Success]Hash: 0xTransactionHash
Contract Address: 0xContractAddress
Block: 12345678
Paid: 0.001234567 ETH (1234567 gas * 1.000000001 gwei)
```

### 3.4 保存部署信息

将部署的合约地址添加到 `.env` 文件中：

```bash
# 在 .env 文件中添加
BATCH_TRANSFER_ADDRESS_TENDERLY=0x部署后的合约地址
```

## 步骤 4: 验证部署

### 4.1 检查合约状态

```bash
# 检查合约是否正确部署
cast code $BATCH_TRANSFER_ADDRESS_TENDERLY --rpc-url $TENDERLY_RPC_URL

# 调用合约的公共函数验证
cast call $BATCH_TRANSFER_ADDRESS_TENDERLY "MAX_RECIPIENTS()" --rpc-url $TENDERLY_RPC_URL
```

### 4.2 测试合约功能

创建一个简单的测试脚本来验证合约功能：

```bash
# 检查合约的最大接收者数量（应该返回 200）
cast call $BATCH_TRANSFER_ADDRESS_TENDERLY "MAX_RECIPIENTS()" --rpc-url $TENDERLY_RPC_URL

# 检查合约的总交易数（新部署应该是 0）
cast call $BATCH_TRANSFER_ADDRESS_TENDERLY "totalTransactions()" --rpc-url $TENDERLY_RPC_URL
```

## 步骤 5: 更新 Makefile（可选）

为了方便后续部署，可以在 `Makefile` 中添加 Tenderly 部署命令：

```makefile
# 在 Makefile 中添加以下内容

# Deploy to Tenderly virtual network
.PHONY: deploy-tenderly
deploy-tenderly:
	forge script script/Deploy.s.sol:DeployScript --rpc-url $(TENDERLY_RPC_URL) --broadcast --private-key $(PRIVATE_KEY)

# Verify deployment on Tenderly
.PHONY: verify-tenderly
verify-tenderly:
	cast call $(BATCH_TRANSFER_ADDRESS_TENDERLY) "MAX_RECIPIENTS()" --rpc-url $(TENDERLY_RPC_URL)
	cast call $(BATCH_TRANSFER_ADDRESS_TENDERLY) "totalTransactions()" --rpc-url $(TENDERLY_RPC_URL)
```

然后可以使用简化命令：

```bash
# 部署到 Tenderly
make deploy-tenderly

# 验证部署
make verify-tenderly
```

## 步骤 6: 前端集成

### 6.1 更新前端配置

如果您的项目包含前端，需要更新网络配置以支持 Tenderly：

在 `frontend/src/constants/contracts.ts` 中添加 Tenderly 网络：

```typescript
export const CHAIN_IDS = {
  MAINNET: 1,
  SEPOLIA: 11155111,
  TENDERLY: 1, // Tenderly 虚拟网络使用主网 Chain ID
};

export const RPC_URLS = {
  [CHAIN_IDS.MAINNET]: 'https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
  [CHAIN_IDS.SEPOLIA]: 'https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY',
  [CHAIN_IDS.TENDERLY]: 'https://virtual.mainnet.us-west.rpc.tenderly.co/697808de-4372-4815-b964-84394e11796e',
};

export const CONTRACT_ADDRESSES = {
  [CHAIN_IDS.MAINNET]: '',
  [CHAIN_IDS.SEPOLIA]: '0x9BcA3e9A5b363070f5907185Bb8c19399D82f9BE',
  [CHAIN_IDS.TENDERLY]: '0x部署后的合约地址',
};
```

## 故障排除

### 常见问题

1. **部署失败 - 余额不足**
   ```bash
   # 检查账户余额
   cast balance <your-address> --rpc-url $TENDERLY_RPC_URL
   ```
   解决方案：在 Tenderly 控制台中为您的账户添加测试 ETH。

2. **RPC 连接失败**
   ```bash
   # 测试 RPC 连接
   cast block-number --rpc-url $TENDERLY_RPC_URL
   ```
   解决方案：检查 RPC URL 是否正确，确保网络连接正常。

3. **私钥格式错误**
   确保私钥格式正确（64 个字符的十六进制字符串，可以有或没有 0x 前缀）。

4. **合约验证失败**
   ```bash
   # 检查合约字节码
   cast code $BATCH_TRANSFER_ADDRESS_TENDERLY --rpc-url $TENDERLY_RPC_URL
   ```
   如果返回 "0x"，说明合约未正确部署。

### 调试技巧

1. **使用详细输出**
   ```bash
   forge script script/Deploy.s.sol:DeployScript \
       --rpc-url $TENDERLY_RPC_URL \
       --broadcast \
       --private-key $PRIVATE_KEY \
       -vvvv
   ```

2. **模拟部署（不广播）**
   ```bash
   forge script script/Deploy.s.sol:DeployScript \
       --rpc-url $TENDERLY_RPC_URL \
       --private-key $PRIVATE_KEY
   ```

## 总结

通过本教程，您已经成功：

1. ✅ 配置了 Tenderly 虚拟网络环境
2. ✅ 部署了 BatchTransfer 合约到 Tenderly
3. ✅ 验证了合约部署和功能
4. ✅ 了解了如何集成到前端应用

**下一步**:
- 在 Tenderly 控制台中监控合约活动
- 使用 Tenderly 的调试工具分析交易
- 进行全面的功能测试
- 准备主网部署

**有用的链接**:
- [Tenderly 文档](https://docs.tenderly.co/)
- [Foundry 文档](https://book.getfoundry.sh/)
- [BatchTransfer 合约源码](./src/BatchTransfer.sol)

---

**注意**: 这是一个测试环境，请不要在此网络上使用真实资金。在主网部署前，请确保进行充分的测试和代码审计。