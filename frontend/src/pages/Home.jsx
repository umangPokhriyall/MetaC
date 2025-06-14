import { Link } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext";
import metaCowLogo from "../assets/MetaCowLogo.png";

export default function Home() {
  const { isConnected } = useWallet();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img
                  src={metaCowLogo}
                  alt="MetaCow"
                  className="w-32 h-32 md:w-40 md:h-40 drop-shadow-2xl animate-pulse"
                />
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-20 blur-xl"></div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              MetaCow DEX
            </h1>

            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              The next-generation decentralized exchange built for speed,
              security, and simplicity. Trade with confidence on the most
              advanced DeFi platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/swap"
                className="group bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  🚀 Start Trading
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </span>
              </Link>

              <Link
                to="/liquidity"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                💧 Add Liquidity
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-200">$2.1M+</div>
                <div className="text-purple-300">Total Volume</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-200">15K+</div>
                <div className="text-purple-300">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-200">99.9%</div>
                <div className="text-purple-300">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose MetaCow?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of decentralized trading with our
              cutting-edge features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-3xl border border-purple-100 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Execute trades in milliseconds with our optimized smart
                contracts and advanced routing algorithms.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-3xl border border-green-100 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Ultra Secure
              </h3>
              <p className="text-gray-600">
                Audited smart contracts and battle-tested security measures
                protect your assets 24/7.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-3xl border border-orange-100 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Low Fees</h3>
              <p className="text-gray-600">
                Enjoy minimal trading fees and maximize your profits with our
                efficient fee structure.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🌊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Deep Liquidity
              </h3>
              <p className="text-gray-600">
                Access deep liquidity pools for seamless trading with minimal
                slippage.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-3xl border border-pink-100 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Mobile First
              </h3>
              <p className="text-gray-600">
                Trade anywhere, anytime with our responsive design optimized for
                all devices.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-3xl border border-teal-100 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Smart Routing
              </h3>
              <p className="text-gray-600">
                Get the best prices with our intelligent routing system that
                finds optimal trading paths.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Trading?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of traders who trust MetaCow for their DeFi needs.
            {isConnected
              ? " You're all set to begin!"
              : " Connect your wallet to get started."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/swap"
              className="bg-white text-purple-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              🔄 Start Swapping
            </Link>
            <Link
              to="/create-pair"
              className="bg-purple-500/20 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-purple-500/30 transition-all duration-300"
            >
              ➕ Create New Pair
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src={metaCowLogo} alt="MetaCow" className="w-8 h-8" />
            <span className="text-xl font-bold">MetaCow DEX</span>
          </div>
          <p className="text-gray-400 mb-4">
            Built with ❤️ for the DeFi community
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <span>🌐 Ethereum Network</span>
            <span>⚡ Powered by Monad</span>
            <span>🔒 Audited & Secure</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
