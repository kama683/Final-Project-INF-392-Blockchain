import { useEffect, useState } from "react";
import { formatUnits } from "ethers";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  Download,
  ExternalLink,
  History,
  Loader2,
} from "lucide-react";

const ETHERSCAN_BASE = "https://sepolia.etherscan.io";

function timeAgo(timestamp) {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function shortAddr(addr) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function TransactionHistory({ account, gymCoin, provider, refreshTrigger }) {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account || !gymCoin || !provider) return;
    fetchHistory();
  }, [account, gymCoin, provider, refreshTrigger]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000);
      const ownerAddr = await gymCoin.owner();
      const ownerLower = ownerAddr.toLowerCase();

      const [buyEvents, sellEvents, transferOutEvents, transferInEvents] = await Promise.all([
        gymCoin.queryFilter(gymCoin.filters.TokensPurchased(account), fromBlock, currentBlock),
        gymCoin.queryFilter(gymCoin.filters.TokensSold(account), fromBlock, currentBlock),
        gymCoin.queryFilter(gymCoin.filters.Transfer(account, null), fromBlock, currentBlock),
        gymCoin.queryFilter(gymCoin.filters.Transfer(null, account), fromBlock, currentBlock),
      ]);

      const filteredOut = transferOutEvents.filter(
        (ev) =>
          ev.args.from.toLowerCase() !== ownerLower &&
          ev.args.to.toLowerCase() !== ownerLower
      );
      const filteredIn = transferInEvents.filter(
        (ev) =>
          ev.args.from.toLowerCase() !== ownerLower &&
          ev.args.to.toLowerCase() !== ownerLower
      );

      const rawTxs = [
        ...buyEvents.map((ev) => ({ ev, type: "buy" })),
        ...sellEvents.map((ev) => ({ ev, type: "sell" })),
        ...filteredOut.map((ev) => ({ ev, type: "sent" })),
        ...filteredIn.map((ev) => ({ ev, type: "received" })),
      ];

      const txsWithBlocks = await Promise.all(
        rawTxs.map(async ({ ev, type }) => {
          const block = await ev.getBlock();
          return { ev, type, timestamp: block.timestamp };
        })
      );

      const allTxs = txsWithBlocks.map(({ ev, type, timestamp }) => {
        const base = { type, hash: ev.transactionHash, timestamp };
        if (type === "buy") return { ...base, amount: ev.args.gcAmount };
        if (type === "sell") return { ...base, amount: ev.args.gcAmount };
        if (type === "sent") return { ...base, amount: ev.args.value, to: ev.args.to };
        return { ...base, amount: ev.args.value, from: ev.args.from };
      });

      const seen = new Set();
      const unique = allTxs.filter((tx) => {
        const key = `${tx.hash}-${tx.type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      unique.sort((a, b) => b.timestamp - a.timestamp);
      setTxs(unique.slice(0, 10));
    } catch (err) {
      console.error("Failed to fetch tx history:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTxIcon = (type) => {
    switch (type) {
      case "buy": return <ArrowDownToLine size={16} className="tx-icon-buy" />;
      case "sell": return <ArrowUpFromLine size={16} className="tx-icon-sell" />;
      case "sent": return <Send size={16} className="tx-icon-sent" />;
      default: return <Download size={16} className="tx-icon-received" />;
    }
  };

  const getTxLabel = (tx) => {
    switch (tx.type) {
      case "buy": return "Bought";
      case "sell": return "Sold";
      case "sent": return `Sent to ${shortAddr(tx.to)}`;
      default: return `Received from ${shortAddr(tx.from)}`;
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <History size={20} />
          <h2>Recent Transactions</h2>
        </div>
      </div>

      {loading ? (
        <div className="tx-loading">
          <Loader2 size={24} className="spin" />
          <span>Loading transactions...</span>
        </div>
      ) : txs.length === 0 ? (
        <div className="tx-empty">No transactions yet</div>
      ) : (
        <div className="tx-list">
          {txs.map((tx, i) => (
            <div key={i} className="tx-row">
              <div className="tx-icon-wrapper">{getTxIcon(tx.type)}</div>
              <div className="tx-info">
                <span className="tx-label">{getTxLabel(tx)}</span>
                <span className="tx-time">{timeAgo(tx.timestamp)}</span>
              </div>
              <div className="tx-right">
                <span className="tx-amount">
                  {tx.type === "buy" || tx.type === "sell"
                    ? Number(tx.amount).toFixed(2)
                    : Number(formatUnits(tx.amount, 18)).toFixed(2)}{" "}GC
                </span>
                <a
                  href={`${ETHERSCAN_BASE}/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-etherscan"
                  title="View on Etherscan"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
