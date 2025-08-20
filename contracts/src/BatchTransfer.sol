// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title BatchTransfer
 * @dev 批量转账智能合约，支持一次性向多个地址转账ETH
 * @author WebThree Team
 */
contract BatchTransfer is ReentrancyGuard, Ownable {
    using Strings for uint256;
    using Strings for address;

    // 事件定义
    event BatchTransferInitiated(
        address indexed caller,
        uint256 totalAmount,
        uint256 numRecipients,
        uint256 timestamp
    );

    event SingleTransferResult(
        address indexed recipient,
        uint256 amount,
        bool success,
        string message
    );

    event BatchTransferCompleted(
        address indexed caller,
        uint256 totalAmount,
        uint256 successCount,
        uint256 failureCount
    );

    // 状态变量
    uint256 public constant MAX_RECIPIENTS = 200; // 最大接收者数量
    uint256 public totalTransactions;
    mapping(address => uint256) public userTransactionCount;
    
    // 执行令牌映射，防止重复执行
    mapping(string => bool) public executionTokens;
    
    // 执行令牌相关事件
    event ExecutionTokenUsed(string indexed executionToken, address indexed caller);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev 批量转账ETH给多个地址
     * @param _recipients 接收地址数组
     * @param _amounts 对应每个接收地址的ETH金额数组 (单位: Wei)
     * @param _executionToken 执行令牌，防止重复执行
     */
    function batchTransfer(
        address[] calldata _recipients,
        uint256[] calldata _amounts,
        string calldata _executionToken
    ) external payable nonReentrant {
        // 基础验证
        require(_recipients.length > 0, "Recipients array cannot be empty");
        require(_recipients.length <= MAX_RECIPIENTS, "Too many recipients");
        require(
            _recipients.length == _amounts.length,
            "Recipients and amounts arrays must have same length"
        );
        
        // 执行令牌验证
        require(bytes(_executionToken).length > 0, "Execution token cannot be empty");
        require(!executionTokens[_executionToken], "Execution token already used");
        
        // 标记执行令牌为已使用
        executionTokens[_executionToken] = true;
        emit ExecutionTokenUsed(_executionToken, msg.sender);

        // 计算总金额并验证
        uint256 totalAmount = _getTotalAmount(_amounts);
        require(msg.value == totalAmount, "Sent value does not match total amount");
        require(totalAmount > 0, "Total amount must be greater than zero");

        // 触发批量转账开始事件
        emit BatchTransferInitiated(
            msg.sender,
            totalAmount,
            _recipients.length,
            block.timestamp
        );

        uint256 successCount = 0;
        uint256 failureCount = 0;
        uint256 failedAmount = 0; // 记录失败转账的总金额

        // 执行批量转账
        for (uint256 i = 0; i < _recipients.length; i++) {
            address payable recipient = payable(_recipients[i]);
            uint256 amount = _amounts[i];

            // 验证接收地址和金额
            if (recipient == address(0)) {
                emit SingleTransferResult(
                    recipient,
                    amount,
                    false,
                    "Invalid recipient address"
                );
                failureCount++;
                failedAmount += amount; // 累加失败金额
                continue;
            }

            if (amount == 0) {
                emit SingleTransferResult(
                    recipient,
                    amount,
                    false,
                    "Amount cannot be zero"
                );
                failureCount++;
                failedAmount += amount; // 累加失败金额
                continue;
            }

            // 执行转账
            (bool success, ) = recipient.call{value: amount}("");
            
            if (success) {
                emit SingleTransferResult(recipient, amount, true, "Success");
                successCount++;
            } else {
                emit SingleTransferResult(
                    recipient,
                    amount,
                    false,
                    "Transfer failed"
                );
                failureCount++;
                failedAmount += amount; // 累加失败金额
            }
        }

        // 更新统计信息
        totalTransactions++;
        userTransactionCount[msg.sender]++;

        // 触发批量转账完成事件
        emit BatchTransferCompleted(
            msg.sender,
            totalAmount,
            successCount,
            failureCount
        );

        // 如果有失败的转账，退还失败的资金
        if (failedAmount > 0) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: failedAmount}("");
            require(refundSuccess, "Refund failed");
        }
    }

    /**
     * @dev 计算金额数组的总和
     * @param _amounts 金额数组
     * @return 总金额
     */
    function _getTotalAmount(uint256[] calldata _amounts) internal pure returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            total += _amounts[i];
        }
        return total;
    }

    /**
     * @dev 预估批量转账所需的Gas费用
     * @param _recipients 接收地址数组
     * @param _amounts 金额数组
     * @return 预估的Gas费用
     */
    function estimateGas(
        address[] calldata _recipients,
        uint256[] calldata _amounts
    ) external pure returns (uint256) {
        require(_recipients.length > 0, "Recipients array cannot be empty");
        require(_recipients.length <= MAX_RECIPIENTS, "Too many recipients");
        require(
            _recipients.length == _amounts.length,
            "Recipients and amounts arrays must have same length"
        );

        // 基础Gas费用 + 每个转账的额外费用
        uint256 baseGas = 21000; // 基础交易费用
        uint256 perTransferGas = 2300; // 每次转账的额外费用
        
        return baseGas + (_recipients.length * perTransferGas);
    }

    /**
     * @dev 获取用户的交易统计信息
     * @param _user 用户地址
     * @return 用户的交易次数
     */
    function getUserStats(address _user) external view returns (uint256) {
        return userTransactionCount[_user];
    }
    
    /**
     * @dev 检查执行令牌是否已被使用
     * @param _executionToken 执行令牌
     * @return 是否已被使用
     */
    function isExecutionTokenUsed(string calldata _executionToken) external view returns (bool) {
        return executionTokens[_executionToken];
    }

    /**
     * @dev 紧急提取合约中的ETH（仅限所有者）
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev 接收ETH
     */
    receive() external payable {}

    /**
     * @dev 回退函数
     */
    fallback() external payable {}
}