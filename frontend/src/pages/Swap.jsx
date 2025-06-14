import { useEffect, useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import TokenSelector from "../components/TokenSelector";
import ActionButton from "../components/ActionButton";
import TransactionList from "../components/TransactionList";
import { showSuccess, showError, showWarning } from "../utils/toast";

import { getPairAddress, getReserves, swap } from "../utils/contractUtils";
import { getAllUserSwaps } from "../utils/transactionLog";
import { ethers } from "ethers";

export default function Swap() {
  const { address, isConnected } = useWallet();
  const [tokenA, setTokenA] = useState(null);
  const [tokenB, setTokenB] = useState(null);
  const [amountIn, setAmountIn] = useState("");
  const [amountOut, setAmountOut] = useState("");
  const [pairAddress, setPairAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [priceHistory, setPriceHistory] = useState([]);
  const [liveSwapData, setLiveSwapData] = useState(() => {
    // Load persisted swap data from localStorage
    try {
      const saved = localStorage.getItem("liveSwapData");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn("Failed to load saved swap data:", error);
      return [];
    }
  }); // Persistent swap data

  // Save live swap data to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("liveSwapData", JSON.stringify(liveSwapData));
    } catch (error) {
      console.warn("Failed to save swap data:", error);
    }
  }, [liveSwapData]);

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

  // Process transactions into price history data
  const processPriceHistory = (transactions) => {
    if (!tokenA || !tokenB || transactions.length === 0) return [];

    const priceData = transactions
      .filter((tx) => {
        // Filter transactions for the current token pair
        const isRelevantPair =
          (tx.inputTokenSymbol === tokenA.symbol &&
            tx.outputTokenSymbol === tokenB.symbol) ||
          (tx.inputTokenSymbol === tokenB.symbol &&
            tx.outputTokenSymbol === tokenA.symbol);
        return isRelevantPair;
      })
      .map((tx) => {
        // Calculate price (how much tokenB per tokenA)
        let price;
        if (tx.inputTokenSymbol === tokenA.symbol) {
          price = parseFloat(tx.outputAmount) / parseFloat(tx.inputAmount);
        } else {
          price = parseFloat(tx.inputAmount) / parseFloat(tx.outputAmount);
        }

        return {
          timestamp: tx.timestamp,
          price: price,
          volume: parseFloat(tx.inputAmount),
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    return priceData;
  };

  // Fetch recent transactions when user connects
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!address) return;

      setLoadingTransactions(true);
      try {
        const transactions = await getAllUserSwaps(address, 20); // Get more for chart
        setRecentTransactions(transactions.slice(0, 5)); // Keep only 5 for display

        // Process price history
        const priceData = processPriceHistory(transactions);
        setPriceHistory(priceData);
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [address, tokenA, tokenB]);

  const handleSwap = async () => {
    if (!tokenA || !tokenB || !amountIn || !pairAddress) {
      showWarning("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      const parsedAmountIn = ethers.parseUnits(amountIn, 18);
      await swap(pairAddress, parsedAmountIn, tokenA.address);

      // Add swap data to memory for real-time chart updates
      const newSwapData = {
        timestamp: Date.now() / 1000,
        price: parseFloat(amountOut) / parseFloat(amountIn),
        volume: parseFloat(amountIn),
        inputToken: tokenA.symbol,
        outputToken: tokenB.symbol,
        inputAmount: parseFloat(amountIn),
        outputAmount: parseFloat(amountOut),
        pairAddress: pairAddress,
      };

      setLiveSwapData((prev) => {
        const updated = [...prev, newSwapData];
        // Keep only last 50 swaps and remove data older than 24 hours
        const oneDayAgo = Date.now() / 1000 - 24 * 60 * 60;
        return updated.filter((swap) => swap.timestamp > oneDayAgo).slice(-50);
      });

      showSuccess("Swap successful!");

      // Refresh transactions after successful swap
      try {
        const transactions = await getAllUserSwaps(address, 20);
        setRecentTransactions(transactions.slice(0, 5));

        // Update price history
        const priceData = processPriceHistory(transactions);
        setPriceHistory(priceData);
      } catch (err) {
        console.warn("Failed to refresh transactions:", err);
      }
    } catch (err) {
      console.error("Swap failed:", err);
      showError("Swap failed. Please try again.");
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

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔗</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Connect Your Wallet
          </h3>
          <p className="text-gray-600 mb-6">
            Connect your wallet to start swapping tokens on MetaCow DEX
          </p>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Secure & Decentralized</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Low Gas Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Instant Swaps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Swap Tokens
        </h1>
        <p className="text-gray-600">
          Trade tokens instantly with the best rates
        </p>
      </div>

      {/* Side-by-side Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Swap Interface */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* From Token */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-gray-700 font-semibold">From</label>
                {address && (
                  <span className="text-sm text-gray-500">Balance: 0.00</span>
                )}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border-2 border-transparent focus-within:border-purple-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="0.0"
                      value={amountIn}
                      onChange={(e) => setAmountIn(e.target.value)}
                      className="w-full bg-transparent text-2xl font-semibold text-gray-800 placeholder-gray-400 focus:outline-none"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {amountIn && tokenA
                        ? `~$${(parseFloat(amountIn) * 2000).toFixed(2)}`
                        : ""}
                    </div>
                  </div>
                  <TokenSelector selected={tokenA} onSelect={setTokenA} />
                </div>
              </div>
            </div>

            {/* Switch Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSwitch}
                className="bg-white border-2 border-gray-200 hover:border-purple-300 text-gray-600 hover:text-purple-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <svg
                  className="w-6 h-6 transform group-hover:rotate-180 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </button>
            </div>

            {/* To Token */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-gray-700 font-semibold">To</label>
                {address && (
                  <span className="text-sm text-gray-500">Balance: 0.00</span>
                )}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border-2 border-transparent">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="0.0"
                      value={amountOut}
                      disabled
                      className="w-full bg-transparent text-2xl font-semibold text-gray-600 placeholder-gray-400 focus:outline-none"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      {amountOut && tokenB
                        ? `~$${(parseFloat(amountOut) * 2000).toFixed(2)}`
                        : ""}
                    </div>
                  </div>
                  <TokenSelector selected={tokenB} onSelect={setTokenB} />
                </div>
              </div>
            </div>

            {/* Swap Details */}
            {tokenA && tokenB && amountIn && amountOut && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rate</span>
                  <span className="font-medium">
                    1 {tokenA.symbol} ={" "}
                    {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)}{" "}
                    {tokenB.symbol}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price Impact</span>
                  <span className="font-medium text-green-600">&lt; 0.01%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Network Fee</span>
                  <span className="font-medium">~$2.50</span>
                </div>
              </div>
            )}

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={loading || !tokenA || !tokenB || !amountIn}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Swapping...
                </div>
              ) : !tokenA || !tokenB ? (
                "Select Tokens"
              ) : !amountIn ? (
                "Enter Amount"
              ) : (
                `Swap ${tokenA.symbol} for ${tokenB.symbol}`
              )}
            </button>

            {/* Pair Info */}
            {pairAddress && (
              <div className="text-center">
                <p className="text-xs text-gray-400">
                  Trading Pair:{" "}
                  <span className="font-mono">
                    {pairAddress.slice(0, 8)}...{pairAddress.slice(-6)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Price Chart */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {tokenA && tokenB ? `${tokenA.symbol}/${tokenB.symbol}` : "Token"}{" "}
              Price Chart
            </h3>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-500">
                {liveSwapData.length > 0
                  ? `${liveSwapData.length} live trades`
                  : priceHistory.length > 0
                  ? `${priceHistory.length} trades`
                  : "Demo data"}
              </div>
              <button
                onClick={async () => {
                  if (!address) return;
                  setLoadingTransactions(true);
                  try {
                    const transactions = await getAllUserSwaps(address, 20);
                    setRecentTransactions(transactions.slice(0, 5));
                    const priceData = processPriceHistory(transactions);
                    setPriceHistory(priceData);
                  } catch (err) {
                    console.error("Failed to refresh chart:", err);
                  } finally {
                    setLoadingTransactions(false);
                  }
                }}
                disabled={loadingTransactions || !address}
                className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh chart data"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              {liveSwapData.length > 0 && (
                <button
                  onClick={() => {
                    setLiveSwapData([]);
                    localStorage.removeItem("liveSwapData");
                  }}
                  className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Clear live data"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {(() => {
            // Use live swap data first, then historical data, then demo data
            const chartData =
              liveSwapData.length > 0
                ? liveSwapData
                : priceHistory.length > 0
                ? priceHistory
                : [
                    {
                      timestamp: Date.now() / 1000 - 3600,
                      price: 1.2,
                      volume: 100,
                    },
                    {
                      timestamp: Date.now() / 1000 - 2700,
                      price: 1.25,
                      volume: 150,
                    },
                    {
                      timestamp: Date.now() / 1000 - 1800,
                      price: 1.18,
                      volume: 200,
                    },
                    {
                      timestamp: Date.now() / 1000 - 900,
                      price: 1.32,
                      volume: 120,
                    },
                    { timestamp: Date.now() / 1000, price: 1.28, volume: 180 },
                  ];

            return (
              <div className="relative">
                {/* Chart Container */}
                <div className="h-64 w-full bg-gradient-to-b from-purple-50 to-blue-50 rounded-2xl p-4 overflow-hidden">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 800 200"
                    className="overflow-visible"
                  >
                    {/* Grid Lines */}
                    <defs>
                      <pattern
                        id="grid"
                        width="80"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 80 0 L 0 0 0 40"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="1"
                          opacity="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Price Line */}
                    {chartData.length > 1 &&
                      (() => {
                        const maxPrice = Math.max(
                          ...chartData.map((p) => p.price)
                        );
                        const minPrice = Math.min(
                          ...chartData.map((p) => p.price)
                        );
                        const priceRange = maxPrice - minPrice || 1;

                        const points = chartData
                          .map((point, index) => {
                            const x =
                              (index / (chartData.length - 1)) * 760 + 20;
                            const y =
                              180 -
                              ((point.price - minPrice) / priceRange) * 160;
                            return `${x},${y}`;
                          })
                          .join(" ");

                        const gradientPoints = chartData.map((point, index) => {
                          const x = (index / (chartData.length - 1)) * 760 + 20;
                          const y =
                            180 - ((point.price - minPrice) / priceRange) * 160;
                          return { x, y };
                        });

                        return (
                          <>
                            {/* Gradient Fill */}
                            <defs>
                              <linearGradient
                                id="priceGradient"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#8b5cf6"
                                  stopOpacity="0.3"
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#3b82f6"
                                  stopOpacity="0.1"
                                />
                              </linearGradient>
                            </defs>
                            <path
                              d={`M ${gradientPoints[0].x},180 L ${points} L ${
                                gradientPoints[gradientPoints.length - 1].x
                              },180 Z`}
                              fill="url(#priceGradient)"
                            />

                            {/* Price Line */}
                            <polyline
                              points={points}
                              fill="none"
                              stroke="url(#gradient)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* Gradient for line */}
                            <defs>
                              <linearGradient
                                id="gradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#3b82f6" />
                              </linearGradient>
                            </defs>

                            {/* Data Points */}
                            {gradientPoints.map((point, index) => (
                              <circle
                                key={index}
                                cx={point.x}
                                cy={point.y}
                                r="4"
                                fill="white"
                                stroke="#8b5cf6"
                                strokeWidth="2"
                                className="hover:r-6 transition-all cursor-pointer"
                              >
                                <title>
                                  Price: {chartData[index].price.toFixed(6)}{" "}
                                  {tokenB ? tokenB.symbol : "TokenB"}/
                                  {tokenA ? tokenA.symbol : "TokenA"}
                                  {"\n"}Time:{" "}
                                  {new Date(
                                    chartData[index].timestamp * 1000
                                  ).toLocaleString()}
                                  {"\n"}Volume:{" "}
                                  {chartData[index].volume.toFixed(4)}{" "}
                                  {tokenA ? tokenA.symbol : "TokenA"}
                                </title>
                              </circle>
                            ))}
                          </>
                        );
                      })()}
                  </svg>
                </div>

                {/* Chart Info */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-600">Current Price</div>
                    <div className="font-semibold text-purple-600">
                      {chartData.length > 0
                        ? chartData[chartData.length - 1].price.toFixed(6)
                        : "0.000000"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">24h High</div>
                    <div className="font-semibold text-green-600">
                      {chartData.length > 0
                        ? Math.max(...chartData.map((p) => p.price)).toFixed(6)
                        : "0.000000"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">24h Low</div>
                    <div className="font-semibold text-red-600">
                      {chartData.length > 0
                        ? Math.min(...chartData.map((p) => p.price)).toFixed(6)
                        : "0.000000"}
                    </div>
                  </div>
                </div>

                {/* Data Source Notice */}
                {liveSwapData.length === 0 && priceHistory.length === 0 && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      <span>📊</span>
                      <span>Demo chart - Make swaps to see real data!</span>
                    </div>
                  </div>
                )}
                {liveSwapData.length > 0 && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      <span>🔴</span>
                      <span>Live trading data from your swaps!</span>
                    </div>
                  </div>
                )}

                {/* Live Swap History */}
                {liveSwapData.length > 0 && (
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Recent Live Swaps
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {liveSwapData
                        .slice(-5)
                        .reverse()
                        .map((swap, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-xs bg-gray-50 rounded-lg p-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-green-500">●</span>
                              <span>
                                {swap.inputAmount.toFixed(4)} {swap.inputToken}{" "}
                                → {swap.outputAmount.toFixed(4)}{" "}
                                {swap.outputToken}
                              </span>
                            </div>
                            <div className="text-gray-500">
                              {new Date(
                                swap.timestamp * 1000
                              ).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Recent Transactions - Full Width Below */}
      <div className="mt-8 bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Recent Transactions
          </h3>
          <div className="flex items-center gap-2">
            {loadingTransactions && (
              <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            )}
            <button
              onClick={async () => {
                if (!address || loadingTransactions) return;
                setLoadingTransactions(true);
                try {
                  const transactions = await getAllUserSwaps(address, 5);
                  setRecentTransactions(transactions);
                } catch (err) {
                  console.error("Failed to refresh transactions:", err);
                } finally {
                  setLoadingTransactions(false);
                }
              }}
              disabled={loadingTransactions || !address}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh transactions"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p>
              {loadingTransactions
                ? "Loading your recent swaps..."
                : "Your recent swaps will appear here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx, index) => (
              <div
                key={`${tx.txHash}-${index}`}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🔄</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {parseFloat(tx.inputAmount).toFixed(4)}{" "}
                      {tx.inputTokenSymbol} →{" "}
                      {parseFloat(tx.outputAmount).toFixed(4)}{" "}
                      {tx.outputTokenSymbol}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(tx.timestamp * 1000).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <a
                    href={`https://explorer.monad.xyz/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    View →
                  </a>
                  <div className="text-xs text-gray-400">
                    Block #{tx.blockNumber}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
