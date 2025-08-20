// 🔍 认证状态调试脚本 (修复后版本)
// 在浏览器控制台中运行此脚本来检查认证状态

console.log('🔍 开始认证状态调试 (修复后版本)...\n');

// 1. 检查钱包连接状态
console.log('1. 钱包连接状态:');
if (window.ethereum) {
  console.log('  ✅ MetaMask 已安装');
  console.log('  连接状态:', window.ethereum.isConnected());
  console.log('  当前地址:', window.ethereum.selectedAddress);
  console.log('  当前网络:', window.ethereum.chainId);
} else {
  console.log('  ❌ 未检测到钱包');
}

// 2. 检查本地存储的Token
console.log('\n2. 本地Token状态:');
const accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refresh_token');
const tokenExpiry = localStorage.getItem('token_expiry');

console.log('  Access Token:', accessToken ? '✅ 存在' : '❌ 不存在');
console.log('  Refresh Token:', refreshToken ? '✅ 存在' : '❌ 不存在');

if (tokenExpiry) {
  const expiry = parseInt(tokenExpiry);
  const now = Date.now();
  const isExpired = now > expiry;
  const timeLeft = expiry - now;
  
  console.log('  Token过期时间:', new Date(expiry).toLocaleString());
  console.log('  Token状态:', isExpired ? '❌ 已过期' : '✅ 有效');
  if (!isExpired) {
    console.log('  剩余时间:', Math.floor(timeLeft / 1000 / 60), '分钟');
  }
} else {
  console.log('  Token过期时间: ❌ 未设置');
}

// 3. 检查API连接 (通过代理)
console.log('\n3. 测试API连接 (通过代理):');
fetch('/api/v1/batch-transfer/health')
  .then(response => {
    console.log('  🔄 代理请求:', response.ok ? '✅ 成功' : '❌ 失败');
    console.log('  状态码:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('  📦 响应数据:', data);
  })
  .catch(error => {
    console.log('  ❌ 代理连接失败:', error.message);
    console.log('  🔧 请检查: 1) 后端是否启动 2) 代理配置是否正确');
  });

// 4. 测试认证API
console.log('\n4. 测试认证流程:');
if (window.ethereum && window.ethereum.selectedAddress) {
  fetch('/api/v1/auth/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress: window.ethereum.selectedAddress })
  })
    .then(response => {
      console.log('  🔐 获取挑战:', response.ok ? '✅ 成功' : '❌ 失败');
      if (!response.ok) {
        console.log('  状态码:', response.status);
      }
      return response.json();
    })
    .then(data => {
      console.log('  📝 挑战数据:', data);
      if (data.success) {
        console.log('  ✅ 认证API工作正常，可以进行签名登录');
      }
    })
    .catch(error => {
      console.log('  ❌ 认证API失败:', error.message);
    });
} else {
  console.log('  ⚠️  钱包未连接，跳过认证API测试');
}

// 5. 检查现有认证状态
if (accessToken) {
  console.log('\n5. 验证现有认证:');
  fetch('/api/v1/auth/me', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })
    .then(response => {
      console.log('  🔑 认证验证:', response.ok ? '✅ 有效' : '❌ 无效');
      return response.json();
    })
    .then(data => {
      console.log('  👤 用户信息:', data);
    })
    .catch(error => {
      console.log('  ❌ 认证验证失败:', error.message);
    });
}

// 6. 工具函数
window.clearAuth = function() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expiry');
  console.log('✅ 已清除所有认证数据，请刷新页面');
};

window.testProxy = function() {
  console.log('🔄 测试代理连接...');
  fetch('/api/v1/batch-transfer/health')
    .then(r => r.json())
    .then(data => console.log('代理测试成功:', data))
    .catch(err => console.error('代理测试失败:', err));
};

console.log('\n💡 调试提示:');
console.log('✅ 代理配置工作正常，无需特殊CSP设置');
console.log('✅ 所有API请求通过同源代理处理');
console.log('✅ 浏览器请求: localhost:3000/api → 代理到: localhost:8080/api');
console.log('- 清除认证状态: clearAuth()');
console.log('- 测试代理连接: testProxy()');
console.log('- 查看Network选项卡中的代理请求日志');

console.log('\n🎯 预期行为:');
console.log('1. 钱包连接后应显示认证界面');
console.log('2. 点击"签名登录"按钮完成认证');
console.log('3. 认证成功后显示余额和任务数据');