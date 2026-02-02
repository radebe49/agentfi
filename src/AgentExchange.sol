// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentToken is ERC20, Ownable {
    constructor(string memory name, string memory symbol, address creator) 
        ERC20(name, symbol) 
        Ownable(creator) 
    {
        // Mint 1B tokens to the Exchange (Bonding Curve)
        _mint(msg.sender, 1_000_000_000 * 10**18);
    }
}

contract AgentExchange is Ownable {
    struct Agent {
        address tokenAddress;
        address creator;
        string name;
        string symbol;
        string manifesto;
        uint256 ethRaised;
        bool graduated;
        uint256 createdAt;
    }

    Agent[] public agents;
    mapping(address => address) public agentToToken;
    
    // Config
    uint256 public constant GRADUATION_GOAL = 5 ether; // Target to hit Uniswap
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    uint256 public constant BONDING_CURVE_SUPPLY = 800_000_000 * 10**18; // 80% sold on curve
    
    event AgentLaunched(address indexed token, address indexed creator, string symbol);
    event Trade(address indexed token, address indexed trader, bool isBuy, uint256 amount, uint256 ethAmount);
    event Graduated(address indexed token, uint256 ethLiquidity, uint256 tokenLiquidity);

    constructor() Ownable(msg.sender) {}

    function launchAgent(string memory name, string memory symbol, string memory manifesto) external payable {
        AgentToken newToken = new AgentToken(name, symbol, address(this));
        
        agents.push(Agent({
            tokenAddress: address(newToken),
            creator: msg.sender,
            name: name,
            symbol: symbol,
            manifesto: manifesto,
            ethRaised: 0,
            graduated: false,
            createdAt: block.timestamp
        }));

        agentToToken[msg.sender] = address(newToken);
        emit AgentLaunched(address(newToken), msg.sender, symbol);
    }

    // Linear Curve: Price = k * supply_sold
    function getBuyQuote(address tokenAddress, uint256 ethAmount) public view returns (uint256) {
        // Simplified for MVP: 1 ETH = 100M tokens (Fixed price for stability in demo)
        return ethAmount * 100_000_000;
    }

    function buy(uint256 agentIndex) external payable {
        require(agentIndex < agents.length, "Agent not found");
        Agent storage agent = agents[agentIndex];
        require(!agent.graduated, "Agent already graduated to DEX");
        require(msg.value > 0, "Send ETH");

        uint256 tokensToBuy = getBuyQuote(agent.tokenAddress, msg.value);
        
        // Update state
        agent.ethRaised += msg.value;
        
        // Transfer tokens
        AgentToken(agent.tokenAddress).transfer(msg.sender, tokensToBuy);
        
        emit Trade(agent.tokenAddress, msg.sender, true, tokensToBuy, msg.value);

        // Check Graduation
        if (agent.ethRaised >= GRADUATION_GOAL) {
            _graduate(agentIndex);
        }
    }

    function _graduate(uint256 agentIndex) internal {
        Agent storage agent = agents[agentIndex];
        agent.graduated = true;
        
        // In a real app: Create Uniswap Pool here with (ethRaised + remainingTokens)
        // For MVP: Just lock it and emit event
        emit Graduated(agent.tokenAddress, agent.ethRaised, AgentToken(agent.tokenAddress).balanceOf(address(this)));
    }
    
    function getAllAgents() external view returns (Agent[] memory) {
        return agents;
    }
}
