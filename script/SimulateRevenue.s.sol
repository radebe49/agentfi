// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/AgentExchange.sol";

contract SimulateRevenue is Script {
    function run() external {
        uint256 deployerPrivateKey = 0x0dc1f7e37663d55936e3780ef97ae97760c0f58015cd71f8e43c6013b6697c55;
        address exchangeAddr = 0x163426F547068659d90954C875E8E00F60bE0379;
        
        vm.startBroadcast(deployerPrivateKey);

        AgentExchange exchange = AgentExchange(exchangeAddr);
        
        // 1. Buy some tokens for Agent 1 (ELIZA) to initialize supply
        console.log("Buying ELIZA tokens...");
        exchange.buy{value: 0.001 ether}(1);
        
        // 2. Simulate Revenue Deposit (Buyback & Burn)
        console.log("Depositing Revenue (Buyback)...");
        exchange.depositRevenue{value: 0.0005 ether}(1);

        vm.stopBroadcast();
    }
}
