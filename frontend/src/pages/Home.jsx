import metaCowLogo from "../assets/MetaCowLogo.png"; // Replace with actual logo path

export default function Home() {
  return (
    <div className="text-center mt-10">
      <img src={metaCowLogo} alt="MetaCow logo" className="w-32 mx-auto mb-6" />
      <h1 className="text-4xl font-bold text-purple-600">Welcome to MetaCow</h1>
      <p className="text-lg text-gray-600 mt-4">
        A minimal decentralized exchange powered by cows and code. 🐮💱
      </p>
      <a
        href="/swap"
        className="inline-block mt-8 px-6 py-3 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
      >
        Launch App
      </a>
    </div>
  );
}
