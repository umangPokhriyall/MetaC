import { getPairContract, getFactoryContract } from "./contractUtils";
import { ethers } from "ethers";

// Token list for symbol lookup
const tokenList = [
  { symbol: "TKA", address: "0x9e53abdDBFa9DC6A9bCD9D0e5DD7144F2701718D" },
  { symbol: "TKB", address: "0xa8b734cD96949d80eb5bFa7FFedF27c00fFfc981" },
  { symbol: "USDT", address: "0x5c4f44985Ea063cb74C323429Da7D72d51F6049f" },
  { symbol: "MOO", address: "0x2AaF51745dbf59938fD364F08f06E6d8B34f4b49" },
];

// Helper: Get token symbol from address
function getTokenSymbol(address) {
  const token = tokenList.find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
  return token ? token.symbol : `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper: Get timestamp for a given block number
async function getBlockTimestamp(provider, blockNumber) {
  const block = await provider.getBlock(blockNumber);
  return block.timestamp;
}

// Main function: Fetch user transaction history from events
export async function getUserTransactions(pairAddress, userAddress) {
  const pair = await getPairContract(pairAddress);
  const provider = pair.provider;
  const latestBlock = await provider.getBlockNumber();

  const startBlock = latestBlock - 5000; // Adjust this range as needed

  // Query logs
  const swapLogs = await pair.queryFilter(
    pair.filters.Swapped(userAddress),
    startBlock,
    latestBlock
  );
  const addLogs = await pair.queryFilter(
    pair.filters.LiquidityAdded(userAddress),
    startBlock,
    latestBlock
  );
  const removeLogs = await pair.queryFilter(
    pair.filters.LiquidityRemoved(userAddress),
    startBlock,
    latestBlock
  );
  const rewardLogs = await pair.queryFilter(
    pair.filters.RewardClaimed(userAddress),
    startBlock,
    latestBlock
  );

  const txs = [];

  for (const log of swapLogs) {
    const ts = await getBlockTimestamp(provider, log.blockNumber);
    txs.push({
      type: "swap",
      inputToken: log.args.inputToken,
      outputToken: log.args.outputToken,
      inputAmount: ethers.formatUnits(log.args.inputAmount, 18),
      outputAmount: ethers.formatUnits(log.args.outputAmount, 18),
      timestamp: ts,
      txHash: log.transactionHash,
      blockNumber: log.blockNumber,
    });
  }

  for (const log of addLogs) {
    const ts = await getBlockTimestamp(provider, log.blockNumber);
    txs.push({
      type: "liquidity",
      direction: "add",
      amountA: ethers.formatUnits(log.args.amountA, 18),
      amountB: ethers.formatUnits(log.args.amountB, 18),
      timestamp: ts,
      txHash: log.transactionHash,
    });
  }

  for (const log of removeLogs) {
    const ts = await getBlockTimestamp(provider, log.blockNumber);
    txs.push({
      type: "liquidity",
      direction: "remove",
      amountLP: ethers.formatUnits(log.args.liquidity, 18),
      timestamp: ts,
      txHash: log.transactionHash,
    });
  }

  for (const log of rewardLogs) {
    const ts = await getBlockTimestamp(provider, log.blockNumber);
    txs.push({
      type: "reward",
      amount: ethers.formatUnits(log.args.amount, 18),
      timestamp: ts,
      txHash: log.transactionHash,
    });
  }

  // Sort by latest timestamp
  return txs.sort((a, b) => b.timestamp - a.timestamp);
}

// Get all swap transactions for a user across all pairs
export async function getAllUserSwaps(userAddress, limit = 10) {
  try {
    const factory = await getFactoryContract();
    const pairsLength = await factory.allPairsLength();

    const allSwaps = [];
    const latestBlock = await factory.provider.getBlockNumber();
    const startBlock = latestBlock - 10000; // Look back 10k blocks

    // Get swaps from all pairs (limit to first 20 pairs to avoid too many calls)
    const maxPairs = Math.min(Number(pairsLength), 20);

    for (let i = 0; i < maxPairs; i++) {
      try {
        const pairAddress = await factory.getPairAtIndex(i);
        const pair = await getPairContract(pairAddress);

        const swapLogs = await pair.queryFilter(
          pair.filters.Swapped(userAddress),
          startBlock,
          latestBlock
        );

        for (const log of swapLogs) {
          const ts = await getBlockTimestamp(pair.provider, log.blockNumber);
          allSwaps.push({
            type: "swap",
            inputToken: log.args.inputToken,
            outputToken: log.args.outputToken,
            inputTokenSymbol: getTokenSymbol(log.args.inputToken),
            outputTokenSymbol: getTokenSymbol(log.args.outputToken),
            inputAmount: ethers.formatUnits(log.args.inputAmount, 18),
            outputAmount: ethers.formatUnits(log.args.outputAmount, 18),
            timestamp: ts,
            txHash: log.transactionHash,
            blockNumber: log.blockNumber,
            pairAddress: pairAddress,
          });
        }
      } catch (err) {
        console.warn(`Failed to fetch swaps from pair ${i}:`, err);
      }
    }

    // Sort by latest timestamp and limit results
    return allSwaps.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  } catch (err) {
    console.error("Failed to fetch user swaps:", err);
    return [];
  }
}
