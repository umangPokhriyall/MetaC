import { useEffect, useState } from "react";
import TokenSelector from "../components/TokenSelector";
import ActionButton from "../components/ActionButton";
import TransactionList from "../components/TransactionList";

import { getPairAddress, getReserves, swap } from "../utils/contractUtils";
import { ethers } from "ethers";

export default function Swap() {
  const [tokenA, setTokenA] = useState(null);
  const [tokenB, setTokenB] = useState(null);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [pairAddress, setPairAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userAddress, setUserAddress] = useState(null);
const [transactions, setTransactions] = useState([]);

useEffect(() => {
  const fetchAddressAndTxs = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setUserAddress(address);

      if (pairAddress) {
        const txs = await getUserTransactions(pairAddress, address);
        setTransactions(txs);
      }
    } catch (err) {
      console.error("Failed to fetch address or txs:", err);
    }
  };
  fetchAddressAndTxs();
}, [pairAddress]);

  useEffect(() => {
    const fetchEstimates = async () => {
      if (tokenA && tokenB && amountIn) {
        try {
          const pair = await getPairAddress(tokenA.address, tokenB.address);
          if (!pair || pair === ethers.ZeroAddress) {
            setAmountOut("0.0");
            setPairAddress(null);
            return;
          }

          setPairAddress(pair);
          const { reserveA, reserveB } = await getReserves(pair);

          let inputReserve, outputReserve;
          if (tokenA.address.toLowerCase() < tokenB.address.toLowerCase()) {
            inputReserve = reserveA;
            outputReserve = reserveB;
          } else {
            inputReserve = reserveB;
            outputReserve = reserveA;
          }

          const input = parseFloat(amountIn);
          const inputWithFee = input * 997;
          const numerator = inputWithFee * outputReserve;
          const denominator = inputReserve * 1000 + inputWithFee;
          const output = numerator / denominator;

          setAmountOut(output.toFixed(6));
        } catch (err) {
          console.error("Estimation failed:", err);
          setAmountOut("0.0");
        }
      } else {
        setAmountOut("");
      }
    };

    fetchEstimates();
  }, [tokenA, tokenB, amountIn]);

  const handleSwap = async () => {
    if (!tokenA || !tokenB || !amountIn || !pairAddress) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      const parsedAmountIn = ethers.parseUnits(amountIn, 18);
      await swap(pairAddress, parsedAmountIn, tokenA.address);
      alert("✅ Swap successful!");
    } catch (err) {
      console.error("Swap failed:", err);
      alert("❌ Swap failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitch = () => {
    setTokenA(tokenB);
    setTokenB(tokenA);
    setAmountIn(amountOut);
    setAmountOut("");
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-xl border border-purple-100">
      <h2 className="text-3xl font-extrabold text-center text-purple-700 mb-8">
        💱 Swap Tokens
      </h2>

      <div className="space-y-6">
        {/* From */}
        <div className="space-y-2">
          <label className="block text-gray-600 font-medium">From</label>
          <TokenSelector selected={tokenA} onSelect={setTokenA} />
          <input
            type="number"
            placeholder="Enter amount"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-xl bg-gray-50 text-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Switch */}
        <div className="flex justify-center">
          <button
            onClick={handleSwitch}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-1 rounded-lg text-sm shadow-sm"
          >
            ⇅ Switch Tokens
          </button>
        </div>

        {/* To */}
        <div className="space-y-2">
          <label className="block text-gray-600 font-medium">To</label>
          <TokenSelector selected={tokenB} onSelect={setTokenB} />
          <input
            type="text"
            placeholder="Estimated output"
            value={amountOut}
            disabled
            className="w-full border border-gray-200 px-4 py-2 rounded-xl bg-gray-100 text-lg text-gray-500 cursor-not-allowed"
          />
        </div>

        {/* Swap Button */}
        <ActionButton
          text={loading ? "Swapping..." : "Swap"}
          onClick={handleSwap}
        />

        {/* Optional message */}
        {pairAddress && (
          <p className="text-xs text-gray-400 text-center mt-2">
            ⚖️ Using pair: <span className="font-mono">{pairAddress.slice(0, 6)}...{pairAddress.slice(-4)}</span>
          </p>
        )}
      </div>
    </div>
  );
}
