import metaCowLogo from "../assets/MetaCowLogo.png";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-purple-50 to-white min-h-[80vh] flex flex-col justify-center items-center text-center px-4">
      {/* Logo */}
      <img
        src={metaCowLogo}
        alt="MetaCow logo"
        className="w-28 h-28 md:w-36 md:h-36 mb-6 animate-bounce drop-shadow-md"
      />

      {/* Title */}
      <h1 className="text-5xl md:text-6xl font-extrabold text-purple-700 drop-shadow-sm">
        Welcome to MetaCow
      </h1>

      {/* Subheading */}
      <p className="text-lg md:text-xl text-gray-600 max-w-2xl mt-4">
        A next-gen minimal DEX built for speed, fun, and fairness. Powered by cows 🐮 and code 💻.
        Trade, provide liquidity, earn rewards — all in one place.
      </p>

      {/* CTA Button */}
      <a
        href="/swap"
        className="mt-8 inline-block px-8 py-3 bg-purple-600 text-white text-lg rounded-xl shadow-md hover:bg-purple-700 transition"
      >
        🚀 Launch DEX
      </a>

      {/* Footer-ish Text */}
      <p className="text-sm text-gray-400 mt-6">Built on Monad Testnet · Gasless ❤️‍🔥</p>
    </div>
  );
}
