import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Swap from "./pages/Swap";
import CreatePair from "./pages/CreatePair";
import Liquidity from "./pages/Liquidity";

export default function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 text-gray-800 font-sans">
          <Navbar />
          <main className="p-6 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/swap" element={<Swap />} />
              <Route path="/liquidity" element={<Liquidity />} />
              <Route path="/create-pair" element={<CreatePair />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WalletProvider>
  );
}
