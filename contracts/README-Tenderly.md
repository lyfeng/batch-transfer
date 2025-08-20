# BatchTransfer 合约 Tenderly 部署指南

## 🚀 快速开始

### 一键部署

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的测试私钥

# 2. 执行一键部署
./deploy-tenderly.sh

# 3. 验证部署
./verify-tenderly.sh
```

### 手动部署

```bash
# 使用 Makefile
make deploy-tenderly

# 或使用 forge 命令
forge script script/Deploy.s.sol:DeployScript \
    --rpc-url $TENDERLY_RPC_URL \
    --broadcast \
    --private-key $PRIVATE_KEY
```

## 📋 文件说明

| 文件 | 描述 |
|------|------|
| `Tenderly部署教程.md` | 详细的部署教程和配置说明 |
| `deploy-tenderly.sh` | 一键部署脚本 |
| `verify-tenderly.sh` | 合约验证脚本 |
| `foundry.toml` | 已配置 Tenderly RPC 端点 |
| `.env.example` | 环境变量模板（包含 Tenderly 配置） |
| `Makefile` | 已添加 Tenderly 部署命令 |

## 🌐 网络信息

- **网络名称**: Tenderly Virtual Network
- **RPC URL**: `https://virtual.mainnet.us-west.rpc.tenderly.co/697808de-4372-4815-b964-84394e11796e`
- **Chain ID**: 1 (使用主网 Chain ID)
- **区块浏览器**: Tenderly Dashboard

## 🔧 环境配置

### 必需的环境变量

```bash
# Tenderly 虚拟网络 RPC URL
TENDERLY_RPC_URL=https://virtual.mainnet.us-west.rpc.tenderly.co/697808de-4372-4815-b964-84394e11796e

# 测试私钥（请使用测试私钥，不要使用真实资金的私钥）
PRIVATE_KEY=your_test_private_key_here

# 部署后的合约地址（自动填入）
BATCH_TRANSFER_ADDRESS_TENDERLY=
```

## 📦 前端集成

前端配置文件 `frontend/src/constants/contracts.ts` 已更新，包含：

- Tenderly 网络支持 (Chain ID: 1337)
- RPC URL 配置
- 合约地址映射
- 网络名称映射

## 🛠️ 可用命令

### Makefile 命令

```bash
make deploy-tenderly    # 部署到 Tenderly
make verify-tenderly    # 验证 Tenderly 部署
```

### 脚本命令

```bash
./deploy-tenderly.sh           # 一键部署
./verify-tenderly.sh           # 验证部署（使用环境变量中的地址）
./verify-tenderly.sh <地址>    # 验证指定地址的合约
```

### Cast 命令示例

```bash
# 检查合约基本信息
cast call $BATCH_TRANSFER_ADDRESS_TENDERLY "MAX_RECIPIENTS()" --rpc-url $TENDERLY_RPC_URL
cast call $BATCH_TRANSFER_ADDRESS_TENDERLY "totalTransactions()" --rpc-url $TENDERLY_RPC_URL
cast call $BATCH_TRANSFER_ADDRESS_TENDERLY "owner()" --rpc-url $TENDERLY_RPC_URL

# 检查账户余额
cast balance <地址> --rpc-url $TENDERLY_RPC_URL

# 检查执行令牌
cast call $BATCH_TRANSFER_ADDRESS_TENDERLY "isExecutionTokenUsed(string)" "your-token" --rpc-url $TENDERLY_RPC_URL

# 获取用户统计
cast call $BATCH_TRANSFER_ADDRESS_TENDERLY "getUserStats(address)" <用户地址> --rpc-url $TENDERLY_RPC_URL
```

## 🔍 验证清单

部署完成后，请验证以下项目：

- [ ] 合约代码已正确部署
- [ ] `MAX_RECIPIENTS()` 返回 200
- [ ] `totalTransactions()` 返回 0（新部署）
- [ ] `owner()` 返回正确的部署者地址
- [ ] 执行令牌检查功能正常
- [ ] 用户统计查询功能正常
- [ ] 网络连接正常

## 🚨 安全提醒

1. **使用测试私钥**: 不要使用包含真实资金的私钥
2. **环境隔离**: Tenderly 是安全的测试环境，但仍需谨慎
3. **私钥保护**: 不要将 `.env` 文件提交到版本控制
4. **充分测试**: 在主网部署前进行全面测试

## 📚 相关文档

- [详细部署教程](./Tenderly部署教程.md)
- [主要部署文档](./部署文档.md)
- [合约源码](./src/BatchTransfer.sol)
- [测试文件](./test/BatchTransfer.t.sol)

## 🆘 故障排除

### 常见问题

1. **部署失败 - 余额不足**
   - 在 Tenderly 控制台中为账户添加测试 ETH

2. **RPC 连接失败**
   - 检查网络连接
   - 验证 RPC URL 是否正确

3. **私钥格式错误**
   - 确保私钥为 64 字符的十六进制字符串
   - 可以有或没有 0x 前缀

4. **合约验证失败**
   - 使用 `cast code` 检查合约是否正确部署
   - 检查合约地址是否正确

### 获取帮助

如果遇到问题，请：

1. 查看详细的部署教程
2. 运行验证脚本获取详细信息
3. 检查 Tenderly 控制台的日志
4. 使用 `-vvvv` 参数获取详细的 forge 输出

---

**注意**: 这是测试环境部署指南。在主网部署前，请确保进行充分的测试和代码审计。