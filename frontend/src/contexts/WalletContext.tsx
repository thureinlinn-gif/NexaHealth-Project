import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider } from 'ethers';
import { useToast } from '@/hooks/use-toast';

interface WalletContextType {
  walletAddress: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { toast } = useToast();

  // Load wallet address from localStorage on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setWalletAddress(savedAddress);
    }
  }, []);

  const connectWallet = async () => {
    try {
      // Check if ethereum provider is available (MetaMask, Core, etc.)
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        toast({
          title: 'Wallet Not Found',
          description: 'Please install MetaMask or Core wallet extension to connect.',
          variant: 'destructive',
        });
        return;
      }

      const ethereum = (window as any).ethereum;
      
      // Request account access
      const provider = new BrowserProvider(ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        localStorage.setItem('walletAddress', address);
        
        toast({
          title: 'Wallet Connected',
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem('walletAddress');
    toast({
      title: 'Wallet Disconnected',
    });
  };

  const signMessage = async (message: string): Promise<string | null> => {
    if (!walletAddress) return null;

    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        return null;
      }

      const ethereum = (window as any).ethereum;
      const provider = new BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      
      // Sign message
      const signature = await signer.signMessage(message);
      return signature;
    } catch (error) {
      console.error('Message signing error:', error);
      return null;
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected: !!walletAddress,
        connectWallet,
        disconnectWallet,
        signMessage,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

