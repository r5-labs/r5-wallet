// hooks/useTxHistory.ts
import { useState, useEffect } from "react";
import { useWeb3Context } from "../contexts/Web3Context";
import { TxApiEndpoint } from "../constants";

export interface Transaction {
  id: number;
  from_address: string;
  to_address: string;
  value: string;
  sent_at: string;
}

const CACHE_DURATION = 120 * 1000; // 120 seconds
const cache: Record<string, { timestamp: number; data: Transaction[] }> = {};

export default function useTxHistory(address?: string) {
  const { isMainnet } = useWeb3Context();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address || !isMainnet) return;

    const now = Date.now();
    const cached = cache[address];

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      setTransactions(cached.data);
      return;
    }

    const fetchTxs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${TxApiEndpoint}` + `${address}`);
        const json = await res.json();
        const data = json?.transactions || [];

        if (Array.isArray(data)) {
          cache[address] = {
            timestamp: Date.now(),
            data,
          };
          setTransactions(data);
        }
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTxs();
    const interval = setInterval(fetchTxs, CACHE_DURATION);
    return () => clearInterval(interval);
  }, [address, isMainnet]);

  return { transactions, loading };
}
