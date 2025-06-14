// src/listeners/swapListener.js
import { ethers } from "ethers";
import dotenv from "dotenv";
import Feed from "../models/Feed.js";
import User from "../models/User.js";

// Import ABI JSON files
import pairAbi from "./Pair.json" assert { type: "json" };
import factoryAbi from "./Factory.json" assert { type: "json" };

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Track latest checked block per pair
const lastBlockSeen = {};

export async function startSwapListener() {
  const factory = new ethers.Contract(FACTORY_ADDRESS, factoryAbi.abi, provider);
  const pairCount = await factory.allPairsLength();

  console.log(`🔍 Found ${pairCount} pairs. Starting polling...`);

  const pairContracts = [];

  for (let i = 0; i < pairCount; i++) {
    const pairAddress = await factory.allPairs(i);
    const contract = new ethers.Contract(pairAddress, pairAbi.abi, provider);
    pairContracts.push({ contract, address: pairAddress });
    lastBlockSeen[pairAddress] = (await provider.getBlockNumber()) - 5; // Start 5 blocks behind
  }

  // Poll every 10 seconds
  setInterval(async () => {
    for (const { contract, address } of pairContracts) {
      const fromBlock = lastBlockSeen[address];
      const toBlock = await provider.getBlockNumber();

      if (toBlock <= fromBlock) continue;

      try {
        const logs = await contract.queryFilter("Swapped", fromBlock, toBlock);

        for (const log of logs) {
          const { user, inputToken, outputToken, inputAmount, outputAmount } = log.args;

          const followers = await User.find({ follows: user.toLowerCase() });

          for (const follower of followers) {
            await Feed.updateOne(
              { owner: follower.address },
              {
                $push: {
                  events: {
                    type: "swap",
                    actor: user.toLowerCase(),
                    tokenIn: inputToken,
                    tokenOut: outputToken,
                    amountIn: inputAmount.toString(),
                    amountOut: outputAmount.toString(),
                    timestamp: Date.now() / 1000,
                    txHash: log.transactionHash,
                  },
                },
              },
              { upsert: true }
            );
          }

          console.log(`📡 Detected swap by ${user}, updated ${followers.length} feeds`);
        }

        lastBlockSeen[address] = toBlock;
      } catch (err) {
        console.error(`❌ Error polling ${address}`, err.message);
      }
    }
  }, 10_000); // 10s interval
}
