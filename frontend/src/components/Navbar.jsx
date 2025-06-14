import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { SignInButton, useProfile } from "@farcaster/auth-kit";
import { getLPBalance } from "../utils/contractUtils";
import logo from "../assets/MetaCowLogo.png";

export default function Navbar() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const [lpBalance, setLpBalance] = useState("0.0");
  const [showDropdown, setShowDropdown] = useState(false);
  const { profile } = useProfile();

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return;
      try {
        const dummyPair = "0x74A58822369d18106dDe16577C7C01C7B5478a19"; // Replace with your pair
        const balance = await getLPBalance(dummyPair, address);
        setLpBalance(balance);
      } catch (err) {
        console.error("Failed to fetch LP balance", err);
      }
    };
    fetchBalance();
  }, [address]);

  return (
    <nav className="bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="MetaSignal" className="w-10 h-10" />
          <span className="text-2xl font-bold text-purple-700 tracking-tight">MetaSignal</span>
        </div>

        {/* Nav Links + Wallet/Auth Controls */}
        <div className="flex gap-6 items-center">
          <a href="/" className="text-gray-600 hover:text-purple-600 font-medium transition">Home</a>
          <a href="/swap" className="text-gray-600 hover:text-purple-600 font-medium transition">Swap</a>
          <a href="/liquidity" className="text-gray-600 hover:text-purple-600 font-medium transition">Liquidity</a>
          <a href="/create-pair" className="text-gray-600 hover:text-purple-600 font-medium transition">Create Pair</a>

          {/* Wallet Connect */}
          {isConnected ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition shadow"
              >
                {address.slice(0, 6)}...{address.slice(-4)}
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-xl p-4 z-10">
                  <p className="text-xs text-gray-800 mb-2">
                    <strong>Address:</strong><br />
                    <span className="font-mono">{address}</span>
                  </p>
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>LP Balance:</strong> {lpBalance}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition shadow"
            >
              Connect Wallet
            </button>
          )}

          {/* Farcaster Auth */}
          <div className="ml-2">
            <SignInButton
              onSuccess={({ username, fid }) =>
                console.log(`✅ Welcome ${username} (fid: ${fid})`)
              }
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
