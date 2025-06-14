import { useState } from "react";

// Update with real deployed addresses
const tokenList = [
  { symbol: "TKA", address: "0x9e53abdDBFa9DC6A9bCD9D0e5DD7144F2701718D" },
  { symbol: "TKB", address: "0xa8b734cD96949d80eb5bFa7FFedF27c00fFfc981" },
  { symbol: "USDT", address: "0x5c4f44985Ea063cb74C323429Da7D72d51F6049f" },
  { symbol: "MOO", address: "0x2AaF51745dbf59938fD364F08f06E6d8B34f4b49" },
];

export default function TokenSelector({ selected, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border px-4 py-2 rounded-lg bg-white flex justify-between items-center hover:border-purple-400"
      >
        <span className="text-gray-800">
          {selected ? selected.symbol : "Select Token"}
        </span>
        <span className="text-gray-500">&#9662;</span>
      </button>

      {isOpen && (
        <ul className="absolute z-10 bg-white border w-full mt-2 rounded-lg shadow">
          {tokenList.map((token) => (
            <li
              key={token.symbol}
              onClick={() => {
                onSelect(token);
                setIsOpen(false);
              }}
              className="px-4 py-2 hover:bg-purple-100 cursor-pointer"
            >
              {token.symbol}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
