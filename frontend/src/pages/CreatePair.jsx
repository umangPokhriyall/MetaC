import { useEffect, useState } from "react";
import TokenSelector from "../components/TokenSelector";
import { createPair, getFactoryContract } from "../utils/contractUtils";
import { ethers } from "ethers";

export default function CreatePair() {
  const [tokenA, setTokenA] = useState(null);
  const [tokenB, setTokenB] = useState(null);
  const [pairAddress, setPairAddress] = useState("");
  const [status, setStatus] = useState("");
  const [existingPairs, setExistingPairs] = useState([]);

  const handleCreatePair = async () => {
    try {
      if (!tokenA || !tokenB || !ethers.isAddress(tokenA.address) || !ethers.isAddress(tokenB.address)) {
        return setStatus("❌ Invalid token selections");
      }

      setStatus("⏳ Creating pair...");
      const pair = await createPair(tokenA.address, tokenB.address);
      setPairAddress(pair);
      setStatus(`✅ Pair created at: ${pair}`);
      fetchExistingPairs();
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to create pair");
    }
  };

  const fetchExistingPairs = async () => {
    try {
      const factory = await getFactoryContract();
      const count = await factory.allPairsLength();
      const pairs = [];
      for (let i = 0; i < count; i++) {
        const pairAddress = await factory.allPairs(i);
        pairs.push(pairAddress);
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
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-purple-700 mb-4">Create New Pair</h2>

      <div className="space-y-4">
        <TokenSelector selected={tokenA} onSelect={setTokenA} />
        <TokenSelector selected={tokenB} onSelect={setTokenB} />

        <button
          onClick={handleCreatePair}
          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Create Pair
        </button>

        {pairAddress && (
          <p className="text-sm mt-4 text-gray-600">
            ✅ Pair created at: {pairAddress}
          </p>
        )}

        {status && !pairAddress && (
          <p className="text-sm mt-4 text-gray-600">{status}</p>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-purple-700">Existing Pairs</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {existingPairs.map((pair, i) => (
              <li key={i} className="truncate">{pair}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
