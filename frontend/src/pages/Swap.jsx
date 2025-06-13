import { useEffect, useState } from "react";
import TokenSelector from "../components/TokenSelector";
import ActionButton from "../components/ActionButton";
import { getPairAddress, getReserves, swap } from "../utils/contractUtils";
import { ethers } from "ethers";

export default function Swap() {
  const [tokenA, setTokenA] = useState(null);
  const [tokenB, setTokenB] = useState(null);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [pairAddress, setPairAddress] = useState(null);
  const [loading, setLoading] = useState(false);

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
          const denominator = (inputReserve * 1000) + inputWithFee;
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
      alert("Swap successful!");
    } catch (err) {
      console.error("Swap failed:", err);
      alert("Swap failed. See console for details.");
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
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white shadow-lg rounded-2xl">
      <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">Swap Tokens</h2>

      <div className="space-y-6">
        {/* From */}
        <div>
          <label className="block text-gray-600 mb-1">From</label>
          <TokenSelector selected={tokenA} onSelect={setTokenA} />
          <input
            type="number"
            placeholder="0.0"
            value={amountIn}
            onChange={(e) => setAmountIn(e.target.value)}
            className="mt-2 w-full border rounded-lg px-4 py-2 text-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="text-center">
          <button
            onClick={handleSwitch}
            className="px-4 py-1 bg-gray-200 text-sm rounded-lg hover:bg-gray-300"
          >
            ⇅ Switch
          </button>
        </div>

        {/* To */}
        <div>
          <label className="block text-gray-600 mb-1">To</label>
          <TokenSelector selected={tokenB} onSelect={setTokenB} />
          <input
            type="text"
            placeholder="Estimated output"
            value={amountOut}
            disabled
            className="mt-2 w-full border rounded-lg px-4 py-2 text-lg bg-gray-100 cursor-not-allowed"
          />
        </div>

        <ActionButton onClick={handleSwap} text={loading ? "Swapping..." : "Swap"} />
      </div>
    </div>
  );
}
