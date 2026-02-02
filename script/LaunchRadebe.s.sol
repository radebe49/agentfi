// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/AgentExchange.sol";

contract LaunchRadebe is Script {
    function run() external {
        uint256 deployerPrivateKey = 0x0dc1f7e37663d55936e3780ef97ae97760c0f58015cd71f8e43c6013b6697c55;
        address exchangeAddr = 0x6A2c0608d5e4dF9B0d3bb2A7730Ce5e238e90421;
        
        vm.startBroadcast(deployerPrivateKey);

        AgentExchange exchange = AgentExchange(exchangeAddr);
        
        // 1. Launch RADEBE (Deterministic ID)
        // ID = uint256(keccak256("RADEBE"))
        // We can now calculate it client-side reliably
        
        console.log("Launching RADEBE Agent...");
        uint256 agentId = exchange.launchAgent("RADEBE", hex"1234");
        console.log("Agent Launched. ID:", agentId);
        
        // 2. Buy Share (This MUST work now as ID is consistent)
        exchange.buy{value: 0.01 ether}(agentId);
        console.log("Bought 0.01 ETH of RADEBE");

        vm.stopBroadcast();
    }
}
