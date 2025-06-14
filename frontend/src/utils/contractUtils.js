import { getEthereumProvider } from "./metamaskClient";
import { FACTORY_ADDRESS, FACTORY_ABI, PAIR_ABI } from "./constants";
import { ethers } from "ethers";

// ✅ Get signer and provider
export async function getProviderAndSigner() {
  const provider = new ethers.BrowserProvider(await getEthereumProvider());
  const signer = await provider.getSigner();
  return { provider, signer };
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
export async function swap(pairAddress, amountIn, tokenIn) {
  const pair = await getPairContract(pairAddress);
  const { signer } = await getProviderAndSigner();

  const tokenInContract = new ethers.Contract(
    tokenIn,
    ["function approve(address spender, uint256 amount) public returns (bool)"],
    signer
  );

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
  const { provider } = await getProviderAndSigner();
  const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
  const balance = await pair.getLPBalance(userAddress); // ✅ FIXED
  return ethers.formatUnits(balance, 18);
}

// ✅ Add liquidity to a pair
export async function addLiquidity(
  pairAddress,
  amountA,
  amountB,
  tokenA,
  tokenB
) {
  const { signer } = await getProviderAndSigner();
  const pair = new ethers.Contract(pairAddress, PAIR_ABI, signer);

  // Get token contracts for balance checking
  const tokenAContract = new ethers.Contract(
    tokenA,
    [
      "function balanceOf(address account) public view returns (uint256)",
      "function approve(address spender, uint256 amount) public returns (bool)",
    ],
    signer
  );

  const tokenBContract = new ethers.Contract(
    tokenB,
    [
      "function balanceOf(address account) public view returns (uint256)",
      "function approve(address spender, uint256 amount) public returns (bool)",
    ],
    signer
  );

  // Check balances first
  const userAddress = await signer.getAddress();
  const balanceA = await tokenAContract.balanceOf(userAddress);
  const balanceB = await tokenBContract.balanceOf(userAddress);

  if (balanceA < amountA) {
    throw new Error(
      `Insufficient token balance. Required: ${ethers.formatUnits(
        amountA,
        18
      )}, Available: ${ethers.formatUnits(balanceA, 18)}`
    );
  }

  if (balanceB < amountB) {
    throw new Error(
      `Insufficient token balance. Required: ${ethers.formatUnits(
        amountB,
        18
      )}, Available: ${ethers.formatUnits(balanceB, 18)}`
    );
  }

  // Approve tokens to pair contract
  await (await tokenAContract.approve(pairAddress, amountA)).wait();
  await (await tokenBContract.approve(pairAddress, amountB)).wait();

  // Call addLiquidity
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
