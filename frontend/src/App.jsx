// ✅ App.jsx - Add Dashboard route
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"
import { useEffect } from 'react';
;
import Home from "./pages/Home";
import Swap from "./pages/Swap";
import CreatePair from "./pages/CreatePair";
import Liquidity from "./pages/Liquidity";
import FollowedWalletFeed from "./components/FollowedWalletFeed"; // ✅ new import
import { sdk } from '@farcaster/frame-sdk';
export default function App() {
  useEffect(() => {
  sdk.actions.ready({ disableNativeGestures: true });
}, []);
  return (
    <Router>
      <div className="min-h-screen bg-[#fefcfb] text-gray-800 font-sans">
        <Navbar />
        <main className="p-6 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/liquidity" element={<Liquidity />} />
            <Route path="/create-pair" element={<CreatePair />} />
            <Route path="/dashboard" element={<FollowedWalletFeed />} /> {/* ✅ new route */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}
