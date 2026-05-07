import { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";

export function useWallet() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);

  const connect = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask!");
      return;
    }
    const prov = new BrowserProvider(window.ethereum);
    const accounts = await prov.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
    setProvider(prov);
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accs) => {
        setAccount(accs[0] || null);
      });
    }
  }, []);

  return { account, provider, connect, disconnect };
}