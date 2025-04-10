import { useState, useEffect } from 'react';
import { ethers, JsonRpcProvider, parseEther, formatEther } from 'ethers';
import { Box } from '../theme';
import { Header } from '../components/Header';

function MainPage({ onReset }: { onReset: () => void }) {
  const walletInfo = JSON.parse(localStorage.getItem('walletInfo') || '{}');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionHistory, setTransactionHistory] = useState<{ hash: string; from: string; to: string; value: string; date: string }[]>([]);
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);

  const provider = new JsonRpcProvider('https://rpc.r5.network/'); // Replace with your network RPC URL
  const wallet = new ethers.Wallet(walletInfo.privateKey, provider);

  const fetchBalance = async () => {
    try {
      const balanceWei = await provider.getBalance(wallet.address);
      setBalance(formatEther(balanceWei));
    } catch (error) {
      console.error(error);
      alert('Failed to fetch balance.');
    }
  };

  const handleSendCoins = async () => {
    if (!recipient || !amount) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const tx = await wallet.sendTransaction({
        to: recipient,
        value: parseEther(amount),
      });
      await tx.wait(); // Wait for the transaction to be mined
      alert(`Transaction successful! Hash: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      alert('Transaction failed. Please try again.');
    }
  };

  const fetchTransactionHistory = async () => {
    setIsLoading(true);
    try {
      const currentBlock = await provider.getBlockNumber();
      const startBlock = Math.max(0, currentBlock - 1080); // Fetch transactions from the last 1080 blocks
      const transactions = [];

      for (let blockNumber = startBlock; blockNumber <= currentBlock; blockNumber++) {
        const block = await provider.getBlock(blockNumber);
        if (block && block.transactions) {
          for (const txHash of block.transactions) {
            const tx = await provider.getTransaction(txHash);
            if (
              tx && tx.from.toLowerCase() === wallet.address.toLowerCase() ||
              (tx && tx.to && tx.to.toLowerCase() === wallet.address.toLowerCase())
            ) {
              transactions.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to || 'N/A',
                value: formatEther(tx.value),
                date: new Date(block.timestamp * 1000).toLocaleString(),
              });
            }
          }
        }
      }

      setTransactionHistory(transactions);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch transaction history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <>
    <Header />
    <div>
      
      <h1>Main Page</h1>
      <p>Wallet Address: {walletInfo.address}</p>
      <p>Balance: {balance} coins</p>
      {showPrivateKey ? (
        <p>Private Key: {walletInfo.privateKey}</p>
      ) : (
        <button onClick={() => setShowPrivateKey(true)}>Show Private Key</button>
      )}
      <button onClick={onReset}>Reset Wallet</button>

      <h2>Send Coins</h2>
      <input
        type="text"
        placeholder="Recipient Address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handleSendCoins}>Send</button>

      <h2>Transaction History</h2>
      <button onClick={fetchTransactionHistory} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Fetch Transaction History'}
      </button>
      {isLoading ? (
        <p>Loading transaction history...</p>
      ) : (
        <ul>
          {transactionHistory.map((tx, index) => (
            <li key={index}>
              Hash: {tx.hash}, From: {tx.from}, To: {tx.to}, Amount: {tx.value}, Date: {tx.date}
            </li>
          ))}
        </ul>
      )}
    </div>
    </>
  );
}

export default MainPage;
