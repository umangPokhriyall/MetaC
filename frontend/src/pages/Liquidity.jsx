import { useEffect, useState } from "react";
import TokenSelector from "../components/TokenSelector";
import ActionButton from "../components/ActionButton";
import TransactionList from "../components/TransactionList";
import {
  getPairAddress,
  getLPBalance,
  addLiquidity,
  claimRewards
} from "../utils/contractUtils";
import { getUserTransactions } from "../utils/transactionLog";
import { ethers } from "ethers";

export default function Liquidity() {
  const [tokenA, setTokenA] = useState(null);
  const [tokenB, setTokenB] = useState(null);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [pairAddress, setPairAddress] = useState(null);
  const [lpBalance, setLpBalance] = useState("0.0");
  const [userAddress, setUserAddress] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setUserAddress(address);
      } catch (err) {
        console.error("Failed to fetch wallet address:", err);
      }
    };
    fetchAddress();
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!tokenA || !tokenB || !userAddress) return;
      try {
        const pair = await getPairAddress(tokenA.address, tokenB.address);
        if (!pair || pair === ethers.ZeroAddress) {
          console.warn("Invalid pair address");
          return;
        }
        setPairAddress(pair);

        const lp = await getLPBalance(pair, userAddress);
        setLpBalance(lp);

        let txs = [];
        try {
          txs = await getUserTransactions(pair, userAddress);
        } catch (err) {
          console.warn("Failed to fetch transactions:", err);
        }
        setTransactions(txs);
      } catch (err) {
        console.error("Error fetching pair details:", err);
      }
    };
    fetchDetails();
  }, [tokenA, tokenB, userAddress]);

  const handleAdd = async () => {
    if (!pairAddress || !amountA || !amountB || !tokenA || !tokenB) {
      alert("Fill all fields properly.");
      return;
    }

    setLoading(true);
    try {
      const parsedA = ethers.parseUnits(amountA, 18);
      const parsedB = ethers.parseUnits(amountB, 18);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tokenAContract = new ethers.Contract(tokenA.address, [
        "function approve(address spender, uint256 amount) public returns (bool)"
      ], signer);
      const tokenBContract = new ethers.Contract(tokenB.address, [
        "function approve(address spender, uint256 amount) public returns (bool)"
      ], signer);

      console.log("Approving tokens...");
      await (await tokenAContract.approve(pairAddress, parsedA)).wait();
      await (await tokenBContract.approve(pairAddress, parsedB)).wait();

      console.log("Calling addLiquidity with:", parsedA.toString(), parsedB.toString());
      await addLiquidity(pairAddress, parsedA, parsedB);
      alert("Liquidity added!");
    } catch (err) {
      console.error("Add liquidity failed:", err);
      alert("Add liquidity failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!pairAddress) return;
    setLoading(true);
    try {
      await claimRewards(pairAddress);
      alert("Rewards claimed!");
    } catch (err) {
      console.error("Claim rewards failed:", err);
      alert("Claim failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">Manage Liquidity</h2>

      <div className="space-y-6">
        <TokenSelector selected={tokenA} onSelect={setTokenA} />
        <TokenSelector selected={tokenB} onSelect={setTokenB} />

        <input
          type="number"
          placeholder="Amount Token A"
          value={amountA}
          onChange={(e) => setAmountA(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg"
        />
        <input
          type="number"
          placeholder="Amount Token B"
          value={amountB}
          onChange={(e) => setAmountB(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg"
        />

        <ActionButton text={loading ? "Processing..." : "Add Liquidity"} onClick={handleAdd} />
        <ActionButton text={loading ? "Processing..." : "Claim Rewards"} onClick={handleClaim} />

        <p className="text-sm text-gray-600">Your LP Balance: {lpBalance}</p>

        <TransactionList userAddress={userAddress} transactions={transactions} />
      </div>
    </div>
  );
}
