// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/BatchTransfer.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        string memory privateKeyStr = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey;
        
        // 检查是否有0x前缀，如果没有则添加
        if (bytes(privateKeyStr).length == 64) {
            // 没有0x前缀，添加它
            privateKeyStr = string(abi.encodePacked("0x", privateKeyStr));
        }
        
        deployerPrivateKey = vm.parseUint(privateKeyStr);
        vm.startBroadcast(deployerPrivateKey);

        BatchTransfer batchTransfer = new BatchTransfer();
        
        console.log("BatchTransfer deployed to:", address(batchTransfer));
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Max recipients:", batchTransfer.MAX_RECIPIENTS());

        vm.stopBroadcast();
    }
}