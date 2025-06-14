// ✅ contractUtils.js — updated for Wagmi + Viem

import { ethers } from 'ethers';
import { createWalletClient, custom, getAddress } from 'viem';
import { mainnet } from 'viem/chains';
import { FACTORY_ADDRESS, FACTORY_ABI, PAIR_ABI } from './constants';

async function getWalletClient() {
  if (!window.ethereum) throw new Error("No wallet found");
  const walletClient = createWalletClient({
    chain: mainnet,
    transport: custom(window.ethereum),
  });
  return walletClient;
}

// ✅ Get signer and provider
export async function getProviderAndSigner() {
  const walletClient = await getWalletClient();
  const [address] = await walletClient.getAddresses();
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner(address);
  return { provider, signer, address };
}

// ✅ Get Factory contract instance
export async function getFactoryContract() {
  const { signer } = await getProviderAndSigner();
  return new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
}

// ✅ Get Pair contract instance
export async function getPairContract(pairAddress) {
  const { signer } = await getProviderAndSigner();
  return new ethers.Contract(pairAddress, PAIR_ABI, signer);
}

// ✅ Create a new token pair
export async function createPair(tokenA, tokenB) {
  const factory = await getFactoryContract();
  const tx = await factory.createPair(tokenA, tokenB);
  await tx.wait();
  return await factory.getPair(tokenA, tokenB);
}

// ✅ Execute a token swap
export async function swap(pairAddress, amountIn, tokenIn, tokenOut) {
  const pair = await getPairContract(pairAddress);
  const { signer } = await getProviderAndSigner();

  const tokenInContract = new ethers.Contract(tokenIn, [
    "function approve(address spender, uint256 amount) public returns (bool)"
  ], signer);

  const approveTx = await tokenInContract.approve(pairAddress, amountIn);
  await approveTx.wait();

  const swapTx = await pair.swap(amountIn, tokenIn);
  return await swapTx.wait();
}

// ✅ Get reserves from a pair
export async function getReserves(pairAddress) {
  const pair = await getPairContract(pairAddress);
  const [reserveA, reserveB] = await pair.getReserves();
  return {
    reserveA: Number(ethers.formatUnits(reserveA, 18)),
    reserveB: Number(ethers.formatUnits(reserveB, 18)),
  };
}

// ✅ Get pair address for two tokens
export async function getPairAddress(tokenA, tokenB) {
  const factory = await getFactoryContract();
  return await factory.getPair(tokenA, tokenB);
}

// ✅ Get LP token balance for a user
export async function getLPBalance(pairAddress, userAddress) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
  const balance = await pair.getLPBalance(userAddress);
  return ethers.formatUnits(balance, 18);
}

// ✅ Add liquidity to a pair
export async function addLiquidity(pairAddress, amountA, amountB) {
  const { signer } = await getProviderAndSigner();
  const pair = new ethers.Contract(pairAddress, PAIR_ABI, signer);
  const tx = await pair.addLiquidity(amountA, amountB);
  return await tx.wait();
}

// ✅ Remove liquidity from a pair
export async function removeLiquidity(pairAddress, amountLP) {
  const { signer } = await getProviderAndSigner();
  const pair = new ethers.Contract(pairAddress, PAIR_ABI, signer);
  const tx = await pair.removeLiquidity(amountLP);
  return await tx.wait();
}

// ✅ Claim rewards for user
export async function claimRewards(pairAddress) {
  const { signer } = await getProviderAndSigner();
  const pair = new ethers.Contract(pairAddress, PAIR_ABI, signer);
  const tx = await pair.claimRewards();
  return await tx.wait();
}
