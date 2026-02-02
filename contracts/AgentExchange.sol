// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";
import "openzeppelin-contracts/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title AgentExchange
 * @notice Exchange for buying and selling Agent tokens using a linear bonding curve.
 * @dev Curve: Price = Supply * 0.0001 ETH
 *      Supply and Amount are in 1e18 (WAD) precision.
 */
contract AgentExchange {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // -------------------------------------------------------------------------
    // Constants & State
    // -------------------------------------------------------------------------
    
    // Graduation threshold: 5 ETH accumulated volume
    uint256 public constant GRADUATION_THRESHOLD = 5 ether;
    uint256 public constant PROTOCOL_FEE_BPS = 100; // 1% (100 basis points)

    address public protocolFeeRecipient;

    struct Agent {
        uint256 supply;             // Current total supply in WAD
        uint256 accumulatedVolume;  // Total ETH spent buying
        bool graduated;             // True if graduated (liquidity locked)
    }

    // Mapping from agentId to Agent struct
    mapping(uint256 => Agent) public agents;
    
    // Mapping from agentId to user address to balance
    mapping(uint256 => mapping(address => uint256)) public balances;
    
    // Launchpad State
    mapping(uint256 => string) public agentTickers;
    address public oracleSigner; // The trusted server that verifies Tweets

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event TokensBought(uint256 indexed agentId, address indexed buyer, uint256 amount, uint256 cost, uint256 fee);
    event TokensSold(uint256 indexed agentId, address indexed seller, uint256 amount, uint256 refund, uint256 fee);
    event Graduated(uint256 indexed agentId, uint256 totalVolume);
    event RevenueDeposited(uint256 indexed agentId, uint256 amount, uint256 tokensBurned);
    event AgentLaunched(uint256 indexed agentId, string ticker, address indexed creator);

    constructor() {
        oracleSigner = msg.sender; // Deployer is the initial trusted oracle
        protocolFeeRecipient = msg.sender; // Deployer collects fees
    }

    // -------------------------------------------------------------------------
    // Launchpad Actions
    // -------------------------------------------------------------------------

    /**
     * @notice Launch a new Agent Token.
     * @param ticker The stock ticker (e.g. "ELIZA").
     * @param signature Cryptographic proof from our server that the user owns the Twitter handle.
     */
    function launchAgent(string memory ticker, bytes memory signature) external returns (uint256) {
        // 1. Verify Signature (REAL ECDSA CHECK)
        bytes32 messageHash = keccak256(abi.encodePacked(ticker));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(signature);
        
        require(signer == oracleSigner, "Invalid signature");
        
        // 2. Create Agent (Deterministic ID based on Ticker only)
        uint256 agentId = uint256(keccak256(abi.encodePacked(ticker)));
        
        require(bytes(agentTickers[agentId]).length == 0, "Agent already exists");

        agents[agentId] = Agent({
            supply: 0,
            accumulatedVolume: 0,
            graduated: false
        });
        
        agentTickers[agentId] = ticker;
        
        emit AgentLaunched(agentId, ticker, msg.sender);
        
        return agentId;
    }

    // -------------------------------------------------------------------------
    // Bonding Curve Math
    // -------------------------------------------------------------------------

    // Price(S) = 0.0001 * S (where S is normalized to 1e18)
    // Cost = Integral(Price) = 0.0001 * S^2 / 2
    // Reserve (Wei) = 5 * Supply^2 / 1e23
    // Supply (Wei) = Sqrt(Reserve * 2e22)

    function getReserve(uint256 supply) public pure returns (uint256) {
        return (5 * supply * supply) / 1e23;
    }

    function getSupply(uint256 reserve) public pure returns (uint256) {
        return sqrt(reserve * 2e22);
    }

    // -------------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------------

    /**
     * @notice Buy tokens for a specific agent. Amount is calculated from msg.value.
     * @param agentId The ID of the agent to buy tokens for.
     */
    function buy(uint256 agentId) external payable {
        _buy(agentId, msg.value, msg.sender);
    }

    /**
     * @notice Internal buy logic to support both user buys and buybacks.
     */
    function _buy(uint256 agentId, uint256 ethAmount, address receiver) internal {
        // Ensure agent exists (ticker must be set)
        require(bytes(agentTickers[agentId]).length > 0, "Agent not found");
        
        Agent storage agent = agents[agentId];
        require(!agent.graduated, "Agent graduated");
        require(ethAmount > 0, "No ETH sent");

        // Calculate Fee
        uint256 fee = (ethAmount * PROTOCOL_FEE_BPS) / 10000;
        uint256 netAmount = ethAmount - fee;

        uint256 currentSupply = agent.supply;
        uint256 currentReserve = getReserve(currentSupply);
        
        uint256 newReserve = currentReserve + netAmount;
        uint256 newSupply = getSupply(newReserve);
        
        uint256 amount = newSupply - currentSupply;
        
        // Update state
        agent.supply = newSupply;
        agent.accumulatedVolume += netAmount;
        
        // Send Fee (Simulated for MVP: Contract keeps it or we send if we want separate accounting)
        // For simplicity: We keep fee in the contract balance but it's NOT part of the bonding curve reserve.
        // We need a withdrawFees function later.
        
        if (receiver != address(0)) {
            balances[agentId][receiver] += amount;
        } 

        emit TokensBought(agentId, receiver, amount, ethAmount, fee);

        // Check graduation
        if (agent.accumulatedVolume > GRADUATION_THRESHOLD) {
            agent.graduated = true;
            emit Graduated(agentId, agent.accumulatedVolume);
        }
    }

    /**
     * @notice Deposit revenue to buy back and burn tokens.
     * @param agentId The ID of the agent depositing revenue.
     */
    function depositRevenue(uint256 agentId) external payable {
        require(msg.value > 0, "No revenue sent");
        
        // Execute buy, minting to address(0) to lock tokens forever
        _buy(agentId, msg.value, address(0));
        
        emit RevenueDeposited(agentId, msg.value, 0); 
    }

    /**
     * @notice Sell tokens for ETH.
     * @param agentId The ID of the agent.
     * @param amount The amount of tokens to sell (in WAD, 1e18).
     */
    function sell(uint256 agentId, uint256 amount) external {
        Agent storage agent = agents[agentId];
        require(!agent.graduated, "Agent graduated");
        require(amount > 0, "Amount must be > 0");
        require(balances[agentId][msg.sender] >= amount, "Insufficient balance");

        uint256 currentSupply = agent.supply;
        uint256 currentReserve = getReserve(currentSupply);

        uint256 newSupply = currentSupply - amount;
        uint256 newReserve = getReserve(newSupply);

        uint256 grossRefund = currentReserve - newReserve;
        
        // Calculate Fee
        uint256 fee = (grossRefund * PROTOCOL_FEE_BPS) / 10000;
        uint256 refund = grossRefund - fee;

        // Update state
        agent.supply = newSupply;
        balances[agentId][msg.sender] -= amount;

        // Transfer ETH
        (bool sent, ) = msg.sender.call{value: refund}("");
        require(sent, "ETH transfer failed");

        emit TokensSold(agentId, msg.sender, amount, refund, fee);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
