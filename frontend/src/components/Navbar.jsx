import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import { getLPBalance } from "../utils/contractUtils";
import logo from "../assets/MetaCowLogo.png";

export default function Navbar() {
  const {
    address,
    isConnected,
    isConnecting,
    balance,
    connectWallet,
    disconnect,
  } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);
  const [lpBalance, setLpBalance] = useState("0.0");
  const location = useLocation();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return;
      try {
        const dummyPair = "0x74A58822369d18106dDe16577C7C01C7B5478a19";
        const balance = await getLPBalance(dummyPair, address);
        setLpBalance(balance);
      } catch (err) {
        console.error("Failed to fetch LP", err);
      }
    };
    fetchBalance();
  }, [address]);

  const handleConnect = async () => {
    const result = await connectWallet();
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowDropdown(false);
  };

  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/swap", label: "Swap", icon: "🔄" },
    { path: "/liquidity", label: "Liquidity", icon: "💧" },
    { path: "/create-pair", label: "Create Pair", icon: "➕" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={logo}
                alt="MetaCow"
                className="w-12 h-12 transition-transform group-hover:scale-110"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur"></div>
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                MetaCow
              </span>
              <div className="text-xs text-gray-500 font-medium">
                DeFi Exchange
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Wallet Section */}
          <div className="flex items-center gap-4">
            {/* Network Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Ethereum
            </div>

            {/* Wallet Button */}
            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm">👤</span>
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-medium">
                      {address.slice(0, 6)}...{address.slice(-4)}
                    </div>
                    <div className="text-xs opacity-80">{balance} ETH</div>
                  </div>
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 z-50">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">👤</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">
                            Connected Wallet
                          </div>
                          <div className="text-sm text-gray-500">
                            Ethereum Network
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {address.slice(0, 8)}...{address.slice(-6)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Balance:</span>
                          <span className="font-semibold">{balance} ETH</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">LP Balance:</span>
                          <span className="font-semibold">{lpBalance}</span>
                        </div>
                      </div>

                      <button
                        onClick={handleDisconnect}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <span>🔗</span>
                    Connect Wallet
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4 flex gap-2 overflow-x-auto pb-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
