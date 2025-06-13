import { getPairContract } from "./contractUtils";
import { ethers } from "ethers";

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
  const swapLogs = await pair.queryFilter(pair.filters.Swap(userAddress), startBlock, latestBlock);
  const addLogs = await pair.queryFilter(pair.filters.LiquidityAdded(userAddress), startBlock, latestBlock);
  const removeLogs = await pair.queryFilter(pair.filters.LiquidityRemoved(userAddress), startBlock, latestBlock);
  const rewardLogs = await pair.queryFilter(pair.filters.RewardClaimed(userAddress), startBlock, latestBlock);

  const txs = [];

  for (const log of swapLogs) {
    const ts = await getBlockTimestamp(provider, log.blockNumber);
    txs.push({
      type: "swap",
      tokenA: log.args.tokenIn,
      tokenB: log.args.tokenOut,
      amountA: ethers.formatUnits(log.args.amountIn, 18),
      amountB: ethers.formatUnits(log.args.amountOut, 18),
      timestamp: ts,
      txHash: log.transactionHash,
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
