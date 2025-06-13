import { formatDistanceToNow } from "date-fns";

export default function TransactionList({ userAddress, transactions = [], typeFilter = "all" }) {
  const filtered = typeFilter === "all"
    ? transactions
    : transactions.filter((tx) => tx.type === typeFilter);

  if (!userAddress) {
    return <p className="text-gray-500 text-sm">Connect your wallet to see transactions.</p>;
  }

  if (filtered.length === 0) {
    return <p className="text-gray-500 text-sm">No recent transactions found.</p>;
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-purple-700 mb-3">Recent Activity</h3>
      <ul className="space-y-3">
        {filtered.map((tx, i) => (
          <li key={i} className="bg-gray-100 px-4 py-3 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-800">
                  <strong>{tx.type.toUpperCase()}</strong>: {tx.amountA} {tx.tokenA}
                  {tx.tokenB && ` → ${tx.amountB} ${tx.tokenB}`}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(tx.timestamp * 1000))} ago
                </p>
              </div>
              <a
                href={`https://monadscan.io/tx/${tx.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 text-xs underline"
              >
                View Tx
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
