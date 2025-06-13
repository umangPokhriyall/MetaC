import { useEffect, useState } from "react";
import { getEthereumProvider } from "../utils/metamaskClient";
import { getLPBalance } from "../utils/contractUtils";
import logo from "../assets/MetaCowLogo.png";

export default function Navbar() {
  const [address, setAddress] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [lpBalance, setLpBalance] = useState("0.0");

  const connectWallet = async () => {
    const provider = await getEthereumProvider();
    if (!provider) {
      alert("MetaMask not found. Please install the extension.");
      return;
    }
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      setAddress(accounts[0]);
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setShowDropdown(false);
  };

  useEffect(() => {
    const fetchLP = async () => {
      if (!address) return;
      try {
        // Replace with your actual deployed pair address for LP token
        const examplePair = "0x74A58822369d18106dDe16577C7C01C7B5478a19"; // 🔁 Replace this with real pair address
        const balance = await getLPBalance(examplePair, address);
        setLpBalance(balance);
      } catch (err) {
        console.error("LP balance fetch failed", err);
      }
    };
    fetchLP();
  }, [address]);

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md border-b border-gray-100 relative">
      <div className="flex items-center gap-3">
        <img src={logo} alt="MetaCow" className="w-10 h-10" />
        <span className="text-2xl font-bold text-purple-700 tracking-tight">MetaCow</span>
      </div>

      <div className="flex gap-4 items-center">
        <a href="/" className="text-gray-600 hover:text-purple-600 font-medium">Home</a>
        <a href="/swap" className="text-gray-600 hover:text-purple-600 font-medium">Swap</a>
        <a href="/liquidity" className="text-gray-600 hover:text-purple-600 font-medium">Liquidity</a>
        <a href="/create-pair" className="text-gray-600 hover:text-purple-600 font-medium">Create Pair</a>

        {address ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition"
            >
              {address.slice(0, 6)}...{address.slice(-4)}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg p-4 z-10">
                <p className="text-sm text-gray-800 break-all mb-2">
                  <strong>Address:</strong><br />{address}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>LP Balance:</strong> {lpBalance}
                </p>
                <button
                  onClick={disconnect}
                  className="mt-4 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
