import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Swap from "./pages/Swap";
import CreatePair from "./pages/CreatePair";
import Liquidity from "./pages/Liquidity"; // 👈 new import

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#fefcfb] text-gray-800 font-sans">
        <Navbar />
        <main className="p-6 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/swap" element={<Swap />} />
            <Route path="/liquidity" element={<Liquidity />} /> {/* 👈 new route */}
            <Route path="/create-pair" element={<CreatePair />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
