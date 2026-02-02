// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/AgentExchange.sol";

contract DeployAgentExchange is Script {
    function run() external {
        uint256 deployerPrivateKey = 0x0dc1f7e37663d55936e3780ef97ae97760c0f58015cd71f8e43c6013b6697c55;
        vm.startBroadcast(deployerPrivateKey);

        AgentExchange exchange = new AgentExchange();
        console.log("AgentExchange deployed to:", address(exchange));

        vm.stopBroadcast();
    }
}
