import { useEffect, useState } from "react";
import TokenSelector from "../components/TokenSelector";
import { createPair, getFactoryContract } from "../utils/contractUtils";
import { ethers } from "ethers";

export default function CreatePair() {
  const [tokenA, setTokenA] = useState(null);
  const [tokenB, zsetTokenB] = useState(null);
  const [pairAddress, setPairAddress] = useState("");
  const [status, setStatus] = useState("");
  const [existingPairs, setExistingPairs] = useState([]);

  const handleCreatePair = async () => {
    try {
      if (
        !tokenA || !tokenB ||
        !ethers.isAddress(tokenA.address) ||
        !ethers.isAddress(tokenB.address)
      ) {
        return setStatus("❌ Please select valid token addresses.");
      }

      setStatus("⏳ Creating pair...");
      const pair = await createPair(tokenA.address, tokenB.address);
      setPairAddress(pair);
      setStatus(`✅ Pair created at: ${pair}`);
      fetchExistingPairs();
    } catch (err) {
      console.error("Create pair failed", err);
      setStatus("❌ Failed to create pair. Check console.");
    }
  };

  const fetchExistingPairs = async () => {
    try {
      const factory = await getFactoryContract();
      const count = await factory.allPairsLength();
      const pairs = [];
      for (let i = 0; i < count; i++) {
        const pairAddr = await factory.allPairs(i);
        pairs.push(pairAddr);
      }
      setExistingPairs(pairs);
    } catch (err) {
      console.error("Failed to fetch pairs", err);
    }
  };

  useEffect(() => {
    fetchExistingPairs();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white border border-purple-100 shadow-xl rounded-2xl">
      <h2 className="text-3xl font-extrabold text-center text-purple-700 mb-8">
        🔧 Create Token Pair
      </h2>

      <div className="space-y-6">
        {/* Token Selectors */}
        <div>
          <label className="text-gray-600 text-sm font-medium">Token A</label>
          <TokenSelector selected={tokenA} onSelect={setTokenA} />
        </div>
        <div>
          <label className="text-gray-600 text-sm font-medium">Token B</label>
          <TokenSelector selected={tokenB} onSelect={setTokenB} />
        </div>

        {/* Action Button */}
        <button
          onClick={handleCreatePair}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-purple-700 transition shadow"
        >
          🚀 Create Pair
        </button>

        {/* Status Message */}
        {status && (
          <div
            className={`text-sm px-3 py-2 rounded-md mt-2 ${
              status.startsWith("✅")
                ? "bg-green-50 text-green-700 border border-green-300"
                : "bg-red-50 text-red-700 border border-red-300"
            }`}
          >
            {status}
          </div>
        )}

        {/* Pair Created */}
        {pairAddress && (
          <div className="text-sm mt-3 text-center text-gray-600">
            🔗 <strong>New Pair:</strong><br />
            <span className="font-mono">{pairAddress}</span>
          </div>
        )}

        {/* Existing Pairs */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-purple-700 mb-3">📦 Existing Pairs</h3>
          {existingPairs.length === 0 ? (
            <p className="text-sm text-gray-500">No pairs created yet.</p>
          ) : (
            <ul className="max-h-40 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-sm font-mono text-gray-700">
              {existingPairs.map((pair, i) => (
                <li key={i} className="truncate">{pair}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
