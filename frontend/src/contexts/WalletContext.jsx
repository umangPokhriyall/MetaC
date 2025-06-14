import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { getEthereumProvider } from "../utils/metamaskClient";

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState("0");

  // Check if wallet is already connected on app load
  useEffect(() => {
    checkConnection();
    setupEventListeners();
  }, []);

  // Update balance when address changes
  useEffect(() => {
    if (address && provider) {
      updateBalance();
    }
  }, [address, provider]);

  const checkConnection = async () => {
    try {
      const ethereumProvider = await getEthereumProvider();
      if (!ethereumProvider) return;

      const accounts = await ethereumProvider.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const ethersProvider = new ethers.BrowserProvider(ethereumProvider);
        const ethersSigner = await ethersProvider.getSigner();
        const network = await ethersProvider.getNetwork();

        setProvider(ethersProvider);
        setSigner(ethersSigner);
        setAddress(accounts[0]);
        setChainId(network.chainId.toString());
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const setupEventListeners = async () => {
    const ethereumProvider = await getEthereumProvider();
    if (!ethereumProvider) return;

    ethereumProvider.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
      }
    });

    ethereumProvider.on("chainChanged", (chainId) => {
      setChainId(chainId);
      window.location.reload(); // Reload to reset state
    });

    ethereumProvider.on("disconnect", () => {
      disconnect();
    });
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      const ethereumProvider = await getEthereumProvider();

      if (!ethereumProvider) {
        throw new Error("MetaMask not found. Please install MetaMask.");
      }

      const accounts = await ethereumProvider.request({
        method: "eth_requestAccounts",
      });

      const ethersProvider = new ethers.BrowserProvider(ethereumProvider);
      const ethersSigner = await ethersProvider.getSigner();
      const network = await ethersProvider.getNetwork();

      setProvider(ethersProvider);
      setSigner(ethersSigner);
      setAddress(accounts[0]);
      setChainId(network.chainId.toString());

      return { success: true };
    } catch (error) {
      console.error("Wallet connection failed:", error);
      return {
        success: false,
        error: error.message || "Failed to connect wallet",
      };
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance("0");
  };

  const updateBalance = async () => {
    try {
      if (provider && address) {
        const balanceWei = await provider.getBalance(address);
        const balanceEth = ethers.formatEther(balanceWei);
        setBalance(parseFloat(balanceEth).toFixed(4));
      }
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  const switchNetwork = async (targetChainId) => {
    try {
      const ethereumProvider = await getEthereumProvider();
      await ethereumProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error) {
      console.error("Error switching network:", error);
      throw error;
    }
  };

  const value = {
    address,
    provider,
    signer,
    isConnected: !!address,
    isConnecting,
    chainId,
    balance,
    connectWallet,
    disconnect,
    updateBalance,
    switchNetwork,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
};
