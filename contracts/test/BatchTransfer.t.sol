// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/BatchTransfer.sol";

contract BatchTransferTest is Test {
    BatchTransfer public batchTransfer;
    address public owner;
    address public user1;
    address public user2;
    address public recipient1;
    address public recipient2;
    address public recipient3;

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

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        recipient1 = makeAddr("recipient1");
        recipient2 = makeAddr("recipient2");
        recipient3 = makeAddr("recipient3");

        batchTransfer = new BatchTransfer();
        
        // 给测试账户一些ETH
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
    }

    function testSuccessfulBatchTransfer() public {
        address[] memory recipients = new address[](2);
        uint256[] memory amounts = new uint256[](2);
        
        recipients[0] = recipient1;
        recipients[1] = recipient2;
        amounts[0] = 1 ether;
        amounts[1] = 2 ether;
        
        uint256 totalAmount = 3 ether;
        
        vm.startPrank(user1);
        
        // 检查事件是否正确触发
        vm.expectEmit(true, false, false, true);
        emit BatchTransferInitiated(user1, totalAmount, 2, block.timestamp);
        
        vm.expectEmit(true, false, false, true);
        emit SingleTransferResult(recipient1, 1 ether, true, "Success");
        
        vm.expectEmit(true, false, false, true);
        emit SingleTransferResult(recipient2, 2 ether, true, "Success");
        
        vm.expectEmit(true, false, false, true);
        emit BatchTransferCompleted(user1, totalAmount, 2, 0);
        
        batchTransfer.batchTransfer{value: totalAmount}(recipients, amounts);
        
        vm.stopPrank();
        
        // 验证余额
        assertEq(recipient1.balance, 1 ether);
        assertEq(recipient2.balance, 2 ether);
        assertEq(batchTransfer.getUserStats(user1), 1);
        assertEq(batchTransfer.totalTransactions(), 1);
    }

    function testInsufficientValue() public {
        address[] memory recipients = new address[](2);
        uint256[] memory amounts = new uint256[](2);
        
        recipients[0] = recipient1;
        recipients[1] = recipient2;
        amounts[0] = 1 ether;
        amounts[1] = 2 ether;
        
        vm.startPrank(user1);
        
        vm.expectRevert("Sent value does not match total amount");
        batchTransfer.batchTransfer{value: 2 ether}(recipients, amounts);
        
        vm.stopPrank();
    }

    function testEmptyRecipientsArray() public {
        address[] memory recipients = new address[](0);
        uint256[] memory amounts = new uint256[](0);
        
        vm.startPrank(user1);
        
        vm.expectRevert("Recipients array cannot be empty");
        batchTransfer.batchTransfer{value: 0}(recipients, amounts);
        
        vm.stopPrank();
    }

    function testMismatchedArrayLengths() public {
        address[] memory recipients = new address[](2);
        uint256[] memory amounts = new uint256[](1);
        
        recipients[0] = recipient1;
        recipients[1] = recipient2;
        amounts[0] = 1 ether;
        
        vm.startPrank(user1);
        
        vm.expectRevert("Recipients and amounts arrays must have same length");
        batchTransfer.batchTransfer{value: 1 ether}(recipients, amounts);
        
        vm.stopPrank();
    }

    function testTooManyRecipients() public {
        address[] memory recipients = new address[](201);
        uint256[] memory amounts = new uint256[](201);
        
        for (uint256 i = 0; i < 201; i++) {
            recipients[i] = address(uint160(i + 1));
            amounts[i] = 0.01 ether;
        }
        
        vm.startPrank(user1);
        
        vm.expectRevert("Too many recipients");
        batchTransfer.batchTransfer{value: 2.01 ether}(recipients, amounts);
        
        vm.stopPrank();
    }

    function testZeroAmountTransfer() public {
        address[] memory recipients = new address[](2);
        uint256[] memory amounts = new uint256[](2);
        
        recipients[0] = recipient1;
        recipients[1] = recipient2;
        amounts[0] = 1 ether;
        amounts[1] = 0; // 零金额
        
        vm.startPrank(user1);
        
        vm.expectEmit(true, false, false, true);
        emit SingleTransferResult(recipient1, 1 ether, true, "Success");
        
        vm.expectEmit(true, false, false, true);
        emit SingleTransferResult(recipient2, 0, false, "Amount cannot be zero");
        
        vm.expectEmit(true, false, false, true);
        emit BatchTransferCompleted(user1, 1 ether, 1, 1);
        
        batchTransfer.batchTransfer{value: 1 ether}(recipients, amounts);
        
        vm.stopPrank();
        
        assertEq(recipient1.balance, 1 ether);
        assertEq(recipient2.balance, 0);
    }

    function testInvalidRecipientAddress() public {
        address[] memory recipients = new address[](2);
        uint256[] memory amounts = new uint256[](2);
        
        recipients[0] = address(0); // 无效地址
        recipients[1] = recipient2;
        amounts[0] = 1 ether;
        amounts[1] = 2 ether;
        
        vm.startPrank(user1);
        
        vm.expectEmit(true, false, false, true);
        emit SingleTransferResult(address(0), 1 ether, false, "Invalid recipient address");
        
        vm.expectEmit(true, false, false, true);
        emit SingleTransferResult(recipient2, 2 ether, true, "Success");
        
        batchTransfer.batchTransfer{value: 3 ether}(recipients, amounts);
        
        vm.stopPrank();
        
        assertEq(recipient2.balance, 2 ether);
    }

    function testEstimateGas() public {
        address[] memory recipients = new address[](3);
        uint256[] memory amounts = new uint256[](3);
        
        recipients[0] = recipient1;
        recipients[1] = recipient2;
        recipients[2] = recipient3;
        amounts[0] = 1 ether;
        amounts[1] = 2 ether;
        amounts[2] = 3 ether;
        
        uint256 estimatedGas = batchTransfer.estimateGas(recipients, amounts);
        uint256 expectedGas = 21000 + (3 * 2300); // baseGas + (recipients * perTransferGas)
        
        assertEq(estimatedGas, expectedGas);
    }

    function testEmergencyWithdraw() public {
        // 向合约发送一些ETH
        vm.deal(address(batchTransfer), 5 ether);
        
        // 为owner地址设置余额，确保可以接收ETH
        vm.deal(address(this), 100 ether);
        
        uint256 ownerBalanceBefore = address(this).balance;
        uint256 contractBalance = address(batchTransfer).balance;
        
        batchTransfer.emergencyWithdraw();
        
        assertEq(address(batchTransfer).balance, 0);
        assertEq(address(this).balance, ownerBalanceBefore + contractBalance);
    }
    
    // 添加接收ETH的函数
    receive() external payable {}

    function testEmergencyWithdrawOnlyOwner() public {
        vm.deal(address(batchTransfer), 5 ether);
        
        vm.startPrank(user1);
        // 使用新版OpenZeppelin的错误格式
        vm.expectRevert(abi.encodeWithSelector(0x118cdaa7, user1)); // OwnableUnauthorizedAccount(address)
        batchTransfer.emergencyWithdraw();
        vm.stopPrank();
    }

    function testReceiveEther() public {
        uint256 amount = 1 ether;
        
        vm.startPrank(user1);
        (bool success, ) = address(batchTransfer).call{value: amount}("");
        vm.stopPrank();
        
        assertTrue(success);
        assertEq(address(batchTransfer).balance, amount);
    }

    function testGetUserStats() public {
        address[] memory recipients = new address[](1);
        uint256[] memory amounts = new uint256[](1);
        
        recipients[0] = recipient1;
        amounts[0] = 1 ether;
        
        assertEq(batchTransfer.getUserStats(user1), 0);
        
        vm.startPrank(user1);
        batchTransfer.batchTransfer{value: 1 ether}(recipients, amounts);
        vm.stopPrank();
        
        assertEq(batchTransfer.getUserStats(user1), 1);
    }
}