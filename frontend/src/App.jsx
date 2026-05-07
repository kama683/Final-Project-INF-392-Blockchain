import { useState, useEffect } from "react";
import { Contract, parseUnits, formatUnits } from "ethers";
import {
  Dumbbell,
  Wallet,
  User,
  Crown,
  LogOut,
  TrendingUp,
  TrendingDown,
  Send,
  Settings,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  Coins,
  ArrowDownToLine,
  ArrowUpFromLine,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { useWallet } from "./hooks/useWallet";
import { GYM_COIN_ADDRESS, USER_PROFILE_ADDRESS } from "./contracts/addresses";
import GymCoinABI from "./contracts/GymCoin.json";
import UserProfileABI from "./contracts/UserProfile.json";
import CopyButton from "./components/CopyButton";
import QRModal from "./components/QRModal";
import TransactionHistory from "./components/TransactionHistory";
import "./App.css";

const ETHERSCAN_BASE = "https://sepolia.etherscan.io";

function App() {
  const { account, provider, connect, disconnect } = useWallet();
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState("0");
  const [ethBalance, setEthBalance] = useState("0");
  const [sellRate, setSellRate] = useState("0");
  const [buyRate, setBuyRate] = useState("0");
  const [isOwner, setIsOwner] = useState(false);
  const [gymCoinContract, setGymCoinContract] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [txRefresh, setTxRefresh] = useState(0);

  const [loading, setLoading] = useState({
    register: false,
    buy: false,
    sell: false,
    transfer: false,
    rates: false,
  });

  const [toast, setToast] = useState(null);

  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [newSellRate, setNewSellRate] = useState("");
  const [newBuyRate, setNewBuyRate] = useState("");

  const showToast = (message, type = "success", txHash = null) => {
    setToast({ message, type, txHash });
    setTimeout(() => setToast(null), 5000);
  };

  const parseError = (err) => {
    if (err.code === "ACTION_REJECTED") return "Transaction rejected by user";
    if (err.message?.includes("insufficient funds")) return "Not enough ETH on your wallet";
    if (err.message?.includes("Not enough GC")) return "Not enough GC tokens";
    if (err.message?.includes("Owner has not enough")) return "Owner doesn't have enough GC";
    if (err.message?.includes("Contract has not enough")) return "Contract has no ETH for payout";
    if (err.message?.includes("Incorrect ETH")) return "Wrong ETH amount sent";
    if (err.reason) return err.reason;
    return err.message?.slice(0, 100) || "Unknown error";
  };

  const getContracts = async () => {
    const signer = await provider.getSigner();
    const gymCoin = new Contract(GYM_COIN_ADDRESS, GymCoinABI.abi, signer);
    const userProfile = new Contract(USER_PROFILE_ADDRESS, UserProfileABI.abi, signer);
    return { gymCoin, userProfile };
  };

  const loadUserData = async () => {
    if (!account || !provider) return;
    try {
      const { gymCoin, userProfile } = await getContracts();
      setGymCoinContract(gymCoin);

      const isReg = await userProfile.isRegistered(account);
      if (isReg) {
        const [username, email, addr] = await userProfile.getUser(account);
        setUser({ username, email, address: addr });
      } else {
        setUser(null);
      }

      const bal = await gymCoin.balanceOf(account);
      setBalance(Number(formatUnits(bal, 18)).toFixed(2));

      const ethBal = await provider.getBalance(account);
      setEthBalance(Number(formatUnits(ethBal, 18)).toFixed(4));

      const sr = await gymCoin.sellRate();
      const br = await gymCoin.buyRate();
      setSellRate(sr.toString());
      setBuyRate(br.toString());

      const ownerAddr = await gymCoin.owner();
      setIsOwner(ownerAddr.toLowerCase() === account.toLowerCase());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (account && provider) loadUserData();
  }, [account, provider]);

  const register = async () => {
    if (!regUsername || !regEmail) return showToast("Fill all fields", "error");
    setLoading({ ...loading, register: true });
    try {
      const { userProfile } = await getContracts();
      const tx = await userProfile.registerUser(regUsername, regEmail);
      await tx.wait();
      showToast("Successfully registered", "success", tx.hash);
      setRegUsername("");
      setRegEmail("");
      loadUserData();
      setTxRefresh((k) => k + 1);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setLoading({ ...loading, register: false });
    }
  };

  const buy = async () => {
    if (!buyAmount || Number(buyAmount) <= 0) return showToast("Enter amount", "error");
    setLoading({ ...loading, buy: true });
    try {
      const { gymCoin } = await getContracts();
      const sr = await gymCoin.sellRate();
      const ethValue = (BigInt(buyAmount) * 10n ** 18n) / sr;
      const tx = await gymCoin.buy(buyAmount, { value: ethValue });
      await tx.wait();
      showToast(`Bought ${buyAmount} GC`, "success", tx.hash);
      setBuyAmount("");
      loadUserData();
      setTxRefresh((k) => k + 1);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setLoading({ ...loading, buy: false });
    }
  };

  const sell = async () => {
    if (!sellAmount || Number(sellAmount) <= 0) return showToast("Enter amount", "error");
    setLoading({ ...loading, sell: true });
    try {
      const { gymCoin } = await getContracts();
      const tx = await gymCoin.sell(sellAmount);
      await tx.wait();
      showToast(`Sold ${sellAmount} GC`, "success", tx.hash);
      setSellAmount("");
      loadUserData();
      setTxRefresh((k) => k + 1);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setLoading({ ...loading, sell: false });
    }
  };

  const transfer = async () => {
    if (!transferTo || !transferAmount) return showToast("Fill all fields", "error");
    setLoading({ ...loading, transfer: true });
    try {
      const { gymCoin } = await getContracts();
      const amount = parseUnits(transferAmount, 18);
      const tx = await gymCoin.transfer(transferTo, amount);
      await tx.wait();
      showToast(`Sent ${transferAmount} GC`, "success", tx.hash);
      setTransferTo("");
      setTransferAmount("");
      loadUserData();
      setTxRefresh((k) => k + 1);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setLoading({ ...loading, transfer: false });
    }
  };

  const updateRates = async () => {
    if (!newSellRate || !newBuyRate) return showToast("Fill all fields", "error");
    setLoading({ ...loading, rates: true });
    try {
      const { gymCoin } = await getContracts();
      const tx = await gymCoin.setRates(newSellRate, newBuyRate);
      await tx.wait();
      showToast("Rates updated", "success", tx.hash);
      setNewSellRate("");
      setNewBuyRate("");
      loadUserData();
      setTxRefresh((k) => k + 1);
    } catch (err) {
      showToast(parseError(err), "error");
    } finally {
      setLoading({ ...loading, rates: false });
    }
  };

  // landign 
  if (!account) {
    return (
      <div className="app">
        <div className="landing">
          <div className="landing-content">
            <div className="logo-wrapper">
              <Dumbbell size={64} strokeWidth={2} />
            </div>
            <h1 className="title">Gym Coin</h1>
            <p className="subtitle">
              Decentralized credit system for the entire gym network.
              <br />Train anywhere, pay seamlessly.
            </p>
            <button className="btn btn-primary btn-large" onClick={connect}>
              <Wallet size={20} />
              <span>Connect MetaMask</span>
            </button>
            <div className="network-badge">
              <Zap size={14} />
              Sepolia Testnet
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <div className="toast-content">
            <span>{toast.message}</span>
            {toast.txHash && (
              <a
                href={`${ETHERSCAN_BASE}/tx/${toast.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="toast-link"
              >
                View on Etherscan <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}

      {showQR && account && (
        <QRModal account={account} onClose={() => setShowQR(false)} />
      )}

      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo-icon">
            <Dumbbell size={22} strokeWidth={2.5} />
          </div>
          <h1 className="header-title">Gym Coin</h1>
        </div>
        <div className="header-right">
          <div className="wallet-info">
            <span className="wallet-dot"></span>
            <span className="wallet-address">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <a
              href={`${ETHERSCAN_BASE}/address/${account}`}
              target="_blank"
              rel="noopener noreferrer"
              className="header-etherscan"
              title="View on Etherscan"
            >
              <ExternalLink size={14} />
            </a>
            <CopyButton text={account} />
            {isOwner && (
              <span className="badge badge-owner">
                <Crown size={12} /> Owner
              </span>
            )}
          </div>
          <button className="btn btn-secondary" onClick={disconnect}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main className="main">
        {!user ? (
          <div className="card card-centered">
            <div className="card-icon-wrapper">
              <User size={32} />
            </div>
            <h2>Welcome!</h2>
            <p className="card-subtitle">Create your profile to get started</p>
            <input
              className="input"
              placeholder="Username"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
            />
            <input
              className="input"
              placeholder="Email"
              type="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
            />
            <button
              className="btn btn-primary btn-full"
              onClick={register}
              disabled={loading.register}
            >
              {loading.register ? (
                <Loader2 size={18} className="spin" />
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Register</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card stat-primary">
                <div className="stat-header">
                  <Coins size={20} />
                  <span className="stat-label">GC Balance</span>
                </div>
                <div className="stat-value">{balance}</div>
                <div className="stat-suffix">Gym Coin</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <Wallet size={20} />
                  <span className="stat-label">ETH Balance</span>
                </div>
                <div className="stat-value">{ethBalance}</div>
                <div className="stat-suffix">Sepolia ETH</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <TrendingUp size={20} />
                  <span className="stat-label">Buy Rate</span>
                </div>
                <div className="stat-value">{sellRate}</div>
                <div className="stat-suffix">GC per 1 ETH</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">
                  <TrendingDown size={20} />
                  <span className="stat-label">Sell Rate</span>
                </div>
                <div className="stat-value">{buyRate}</div>
                <div className="stat-suffix">GC for 1 ETH</div>
              </div>
            </div>

            {/* Profile */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <User size={20} />
                  <h2>Profile</h2>
                </div>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => setShowQR(true)}
                  title="Show QR code to receive GC"
                >
                  <QrCode size={16} />
                  <span>Receive</span>
                </button>
              </div>
              <div className="profile-info">
                <div className="profile-row">
                  <span className="profile-key">Username</span>
                  <span className="profile-value">{user.username}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-key">Email</span>
                  <span className="profile-value">{user.email}</span>
                </div>
                <div className="profile-row">
                  <span className="profile-key">Wallet</span>
                  <div className="profile-value-group">
                    <span className="profile-value mono">{user.address}</span>
                    <CopyButton text={user.address} />
                    <a
                      href={`${ETHERSCAN_BASE}/address/${user.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-link"
                      title="View on Etherscan"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Trade */}
            <div className="trade-grid">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <ArrowDownToLine size={20} />
                    <h2>Buy GC</h2>
                  </div>
                  <span className="badge badge-info">1 ETH = {sellRate} GC</span>
                </div>
                <input
                  className="input"
                  type="number"
                  placeholder="Amount of GC"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                />
                {buyAmount && Number(buyAmount) > 0 && (
                  <p className="hint">
                    ≈ {(Number(buyAmount) / Number(sellRate)).toFixed(6)} ETH
                  </p>
                )}
                <button
                  className="btn btn-success btn-full"
                  onClick={buy}
                  disabled={loading.buy}
                >
                  {loading.buy ? (
                    <Loader2 size={18} className="spin" />
                  ) : (
                    <>
                      <ArrowDownToLine size={18} />
                      <span>Buy GC</span>
                    </>
                  )}
                </button>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    <ArrowUpFromLine size={20} />
                    <h2>Sell GC</h2>
                  </div>
                  <span className="badge badge-info">{buyRate} GC = 1 ETH</span>
                </div>
                <input
                  className="input"
                  type="number"
                  placeholder="Amount of GC"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                />
                {sellAmount && Number(sellAmount) > 0 && (
                  <p className="hint">
                    ≈ {(Number(sellAmount) / Number(buyRate)).toFixed(6)} ETH
                  </p>
                )}
                <button
                  className="btn btn-warning btn-full"
                  onClick={sell}
                  disabled={loading.sell}
                >
                  {loading.sell ? (
                    <Loader2 size={18} className="spin" />
                  ) : (
                    <>
                      <ArrowUpFromLine size={18} />
                      <span>Sell GC</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Transfer */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <Send size={20} />
                  <h2>Transfer GC</h2>
                </div>
              </div>
              <input
                className="input"
                placeholder="Recipient address (0x...)"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
              />
              <input
                className="input"
                type="number"
                placeholder="Amount of GC"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
              <button
                className="btn btn-primary btn-full"
                onClick={transfer}
                disabled={loading.transfer}
              >
                {loading.transfer ? (
                  <Loader2 size={18} className="spin" />
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>

            {/* Transaction History */}
            <TransactionHistory
              account={account}
              gymCoin={gymCoinContract}
              provider={provider}
              refreshTrigger={txRefresh}
            />

            {/* Owner */}
            {isOwner && (
              <div className="card card-owner">
                <div className="card-header">
                  <div className="card-title">
                    <Settings size={20} />
                    <h2>Owner Panel</h2>
                  </div>
                  <span className="badge badge-owner">
                    <Crown size={12} /> Admin
                  </span>
                </div>
                <p className="card-subtitle">Update buy/sell exchange rates</p>
                <div className="grid-2">
                  <input
                    className="input"
                    type="number"
                    placeholder="New buy rate (GC per ETH)"
                    value={newSellRate}
                    onChange={(e) => setNewSellRate(e.target.value)}
                  />
                  <input
                    className="input"
                    type="number"
                    placeholder="New sell rate (GC per ETH)"
                    value={newBuyRate}
                    onChange={(e) => setNewBuyRate(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-primary btn-full"
                  onClick={updateRates}
                  disabled={loading.rates}
                >
                  {loading.rates ? (
                    <Loader2 size={18} className="spin" />
                  ) : (
                    <>
                      <Settings size={18} />
                      <span>Update Rates</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        <Zap size={14} />
        <span>Sepolia Testnet</span>
        <span className="dot">•</span>
        <span>Gym Coin (GC) ERC-20</span>
      </footer>
    </div>
  );
}

export default App;
