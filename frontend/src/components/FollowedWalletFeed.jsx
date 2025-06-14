// ✅ FollowedWalletFeed.jsx
import { useEffect, useState } from "react";
import TransactionList from "./TransactionList";
import { getUserTransactions } from "../utils/transactionLog";
import { getFactoryContract } from "../utils/contractUtils";

// Helper: Fetch Farcaster username for wallet
async function getFarcasterUsername(wallet) {
  const cached = localStorage.getItem("farcasterUser:" + wallet);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://api.neynar.com/v2/farcaster/user-by-address?address=${wallet}`,
      {
        headers: {
          "api-key": "YOUR_NEYNAR_API_KEY", // replace with your real key
        },
      }
    );
    const data = await res.json();
    const username = data?.user?.username || null;
    if (username) localStorage.setItem("farcasterUser:" + wallet, username);
    return username;
  } catch (err) {
    console.warn("Failed to fetch Farcaster username", err);
    return null;
  }
}

export default function FollowedWalletFeed() {
  const [followed, setFollowed] = useState(() => {
    const saved = localStorage.getItem("followedWallets");
    return saved ? JSON.parse(saved) : [];
  });
  const [newAddress, setNewAddress] = useState("");
  const [txs, setTxs] = useState({});
  const [usernames, setUsernames] = useState({});
  const [loading, setLoading] = useState(false);

  const addWallet = () => {
    if (newAddress && !followed.includes(newAddress)) {
      const updated = [...followed, newAddress];
      setFollowed(updated);
      localStorage.setItem("followedWallets", JSON.stringify(updated));
      setNewAddress("");
    }
  };

  const removeWallet = (addr) => {
    const updated = followed.filter((a) => a !== addr);
    setFollowed(updated);
    localStorage.setItem("followedWallets", JSON.stringify(updated));
  };

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const allTxs = {};
      const nameMap = {};
      let pairAddresses = [];

      try {
        const factory = await getFactoryContract();
        const count = await factory.allPairsLength();
        for (let i = 0; i < count; i++) {
          const pair = await factory.allPairs(i);
          pairAddresses.push(pair);
        }
      } catch (err) {
        console.error("Error fetching pair addresses", err);
      }

      for (const address of followed) {
        try {
          let combined = [];
          for (const pair of pairAddresses) {
            try {
              const tx = await getUserTransactions(pair, address);
              combined = combined.concat(tx);
            } catch (err) {
              console.warn(`❌ Skipped pair ${pair} for ${address}`, err.message);
            }
          }
          combined.sort((a, b) => b.timestamp - a.timestamp);
          allTxs[address] = combined;

          const username = await getFarcasterUsername(address);
          if (username) nameMap[address] = username;
        } catch (err) {
          console.error("Error fetching tx for:", address, err);
        }
      }

      setTxs(allTxs);
      setUsernames(nameMap);
      setLoading(false);
    };

    if (followed.length) fetchAll();
  }, [followed]);

  return (
    <div className="mt-10 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-purple-700 mb-6">📡 Social Signals Feed</h2>

      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="0xWalletAddress"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          className="flex-grow px-4 py-2 border rounded-lg"
        />
        <button
          onClick={addWallet}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          Follow
        </button>
      </div>

      {followed.length === 0 && (
        <p className="text-sm text-gray-600">You're not following any wallets yet.</p>
      )}

      {loading && (
        <p className="text-sm text-gray-500 mb-2">🔄 Fetching transactions...</p>
      )}

      {followed.map((addr) => (
        <div key={addr} className="mb-6">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-semibold text-gray-800 mb-1">
              {usernames[addr] ? `@${usernames[addr]}` : "Wallet"}: <span className="font-mono">{addr}</span>
            </h3>
            <button
              onClick={() => removeWallet(addr)}
              className="text-sm text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
          <TransactionList userAddress={addr} transactions={txs[addr] || []} username={usernames[addr]} />
        </div>
      ))}
    </div>
  );
}
