import { useEffect, useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import TokenSelector from "../components/TokenSelector";
import ActionButton from "../components/ActionButton";
import TransactionList from "../components/TransactionList";
import {
  getPairAddress,
  getLPBalance,
  addLiquidity,
  claimRewards,
} from "../utils/contractUtils";
import { getUserTransactions } from "../utils/transactionLog";
import { ethers } from "ethers";

export default function Liquidity() {
  const { address, isConnected, signer } = useWallet();
  const [tokenA, setTokenA] = useState(null);
  const [tokenB, setTokenB] = useState(null);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [pairAddress, setPairAddress] = useState(null);
  const [lpBalance, setLpBalance] = useState("0.0");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("add"); // "add" or "remove"

  useEffect(() => {
    const fetchDetails = async () => {
      if (!tokenA || !tokenB || !address) return;
      try {
        const pair = await getPairAddress(tokenA.address, tokenB.address);
        if (!pair || pair === ethers.ZeroAddress) {
          console.warn("Invalid pair address");
          return;
        }
        setPairAddress(pair);

        const lp = await getLPBalance(pair, address);
        setLpBalance(lp);

        let txs = [];
        try {
          txs = await getUserTransactions(pair, address);
        } catch (err) {
          console.warn("Failed to fetch transactions:", err);
        }
        setTransactions(txs);
      } catch (err) {
        console.error("Error fetching pair details:", err);
      }
    };
    fetchDetails();
  }, [tokenA, tokenB, address]);

  const handleAdd = async () => {
    if (!pairAddress || !tokenA || !tokenB || !signer) {
      alert("Please select tokens and ensure wallet is connected.");
      return;
    }

    // Validate amounts are valid numbers greater than 0
    const numAmountA = parseFloat(amountA);
    const numAmountB = parseFloat(amountB);

    if (
      !amountA ||
      !amountB ||
      isNaN(numAmountA) ||
      isNaN(numAmountB) ||
      numAmountA <= 0 ||
      numAmountB <= 0
    ) {
      alert("Please enter valid amounts greater than 0 for both tokens.");
      return;
    }

    setLoading(true);
    try {
      console.log("Adding liquidity with amounts:", {
        amountA,
        amountB,
        numAmountA,
        numAmountB,
      });

      const parsedA = ethers.parseUnits(amountA.toString(), 18);
      const parsedB = ethers.parseUnits(amountB.toString(), 18);

      console.log("Parsed amounts:", {
        parsedA: parsedA.toString(),
        parsedB: parsedB.toString(),
      });

      const tokenAContract = new ethers.Contract(
        tokenA.address,
        [
          "function approve(address spender, uint256 amount) public returns (bool)",
        ],
        signer
      );
      const tokenBContract = new ethers.Contract(
        tokenB.address,
        [
          "function approve(address spender, uint256 amount) public returns (bool)",
        ],
        signer
      );

      await (await tokenAContract.approve(pairAddress, parsedA)).wait();
      await (await tokenBContract.approve(pairAddress, parsedB)).wait();

      await addLiquidity(pairAddress, parsedA, parsedB);
      alert("✅ Liquidity added!");
    } catch (err) {
      console.error("Add liquidity failed:", err);
      alert("❌ Add liquidity failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!pairAddress) return;
    setLoading(true);
    try {
      await claimRewards(pairAddress);
      alert("🎉 Rewards claimed!");
    } catch (err) {
      console.error("Claim rewards failed:", err);
      alert("❌ Claim failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">💧</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Connect Your Wallet
          </h3>
          <p className="text-gray-600 mb-6">
            Connect your wallet to provide liquidity and earn rewards on MetaCow
            DEX
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Earn Trading Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>LP Token Rewards</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Compound Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Liquidity Pools
        </h1>
        <p className="text-gray-600">
          Provide liquidity and earn rewards from trading fees
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Liquidity Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setActiveTab("add")}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === "add"
                    ? "bg-white text-blue-600 shadow-lg"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                💧 Add Liquidity
              </button>
              <button
                onClick={() => setActiveTab("remove")}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === "remove"
                    ? "bg-white text-blue-600 shadow-lg"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                🔄 Remove Liquidity
              </button>
            </div>

            {activeTab === "add" && (
              <div className="space-y-6">
                {/* Token Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-gray-700 font-semibold">
                      First Token
                    </label>
                    <div
                      className={`bg-gray-50 rounded-2xl p-4 border-2 transition-colors ${
                        amountA &&
                        (isNaN(parseFloat(amountA)) || parseFloat(amountA) <= 0)
                          ? "border-red-200 focus-within:border-red-300"
                          : "border-transparent focus-within:border-blue-200"
                      }`}
                    >
                      <TokenSelector selected={tokenA} onSelect={setTokenA} />
                      <input
                        type="number"
                        placeholder="0.0"
                        value={amountA}
                        onChange={(e) => setAmountA(e.target.value)}
                        className="w-full bg-transparent text-xl font-semibold text-gray-800 placeholder-gray-400 focus:outline-none mt-3"
                        min="0"
                        step="0.000001"
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        Balance: 0.00
                        {amountA &&
                          (isNaN(parseFloat(amountA)) ||
                            parseFloat(amountA) <= 0) && (
                            <span className="text-red-500 ml-2">
                              • Enter a valid amount
                            </span>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-gray-700 font-semibold">
                      Second Token
                    </label>
                    <div
                      className={`bg-gray-50 rounded-2xl p-4 border-2 transition-colors ${
                        amountB &&
                        (isNaN(parseFloat(amountB)) || parseFloat(amountB) <= 0)
                          ? "border-red-200 focus-within:border-red-300"
                          : "border-transparent focus-within:border-blue-200"
                      }`}
                    >
                      <TokenSelector selected={tokenB} onSelect={setTokenB} />
                      <input
                        type="number"
                        placeholder="0.0"
                        value={amountB}
                        onChange={(e) => setAmountB(e.target.value)}
                        className="w-full bg-transparent text-xl font-semibold text-gray-800 placeholder-gray-400 focus:outline-none mt-3"
                        min="0"
                        step="0.000001"
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        Balance: 0.00
                        {amountB &&
                          (isNaN(parseFloat(amountB)) ||
                            parseFloat(amountB) <= 0) && (
                            <span className="text-red-500 ml-2">
                              • Enter a valid amount
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pool Info */}
                {tokenA && tokenB && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Pool Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pool Share:</span>
                        <span className="font-medium">0.00%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">LP Tokens:</span>
                        <span className="font-medium">{lpBalance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {tokenA.symbol} Pooled:
                        </span>
                        <span className="font-medium">0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {tokenB.symbol} Pooled:
                        </span>
                        <span className="font-medium">0.00</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Liquidity Button */}
                <button
                  onClick={handleAdd}
                  disabled={
                    loading ||
                    !tokenA ||
                    !tokenB ||
                    !amountA ||
                    !amountB ||
                    parseFloat(amountA) <= 0 ||
                    parseFloat(amountB) <= 0 ||
                    isNaN(parseFloat(amountA)) ||
                    isNaN(parseFloat(amountB))
                  }
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding Liquidity...
                    </div>
                  ) : !tokenA || !tokenB ? (
                    "Select Tokens"
                  ) : !amountA ||
                    !amountB ||
                    parseFloat(amountA) <= 0 ||
                    parseFloat(amountB) <= 0 ||
                    isNaN(parseFloat(amountA)) ||
                    isNaN(parseFloat(amountB)) ? (
                    "Enter Valid Amounts"
                  ) : (
                    "Add Liquidity"
                  )}
                </button>
              </div>
            )}

            {activeTab === "remove" && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Remove Liquidity
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Remove your liquidity from pools and claim your tokens back
                  </p>
                  <p className="text-sm text-gray-500">
                    Current LP Balance:{" "}
                    <span className="font-semibold">{lpBalance}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Your Positions */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Your Positions
            </h3>
            <div className="text-center py-8 text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">💼</span>
              </div>
              <p className="text-sm">No liquidity positions yet</p>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Claimable Rewards
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Trading Fees:</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">LP Rewards:</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <button
                onClick={handleClaim}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
              >
                {loading ? "Claiming..." : "Claim All Rewards"}
              </button>
            </div>
          </div>

          {/* Pool Stats */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Pool Statistics
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Value Locked:</span>
                <span className="font-semibold">$1.2M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">24h Volume:</span>
                <span className="font-semibold">$45.6K</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">APR:</span>
                <span className="font-semibold text-green-600">12.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Transactions
        </h3>
        <TransactionList userAddress={address} transactions={transactions} />
      </div>
    </div>
  );
}
