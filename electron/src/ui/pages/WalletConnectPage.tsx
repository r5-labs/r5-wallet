import { useState } from 'react';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js'; // Import encryption library

function WalletConnectPage({ onWalletSetup }: { onWalletSetup: () => void }) {
  const [privateKey, setPrivateKey] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // Removed unused decryptedWallet state

  const rpcUrl = 'https://rpc.r5.network/';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const encryptData = (data: string, key: string) => {
    return CryptoJS.AES.encrypt(data, key).toString();
  };

  const decryptData = (encryptedData: string, key: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return null; // Return null if decryption fails
    }
  };

  const saveWalletInfo = (address: string, privateKey: string, password: string) => {
    const encryptedWallet = encryptData(JSON.stringify({ address, privateKey }), password);
    localStorage.setItem('walletInfo', encryptedWallet);
    onWalletSetup();
  };

  const loadWalletInfo = () => {
    const encryptedWallet = localStorage.getItem('walletInfo');
    if (!encryptedWallet) {
      setError('No wallet found. Please create or import a wallet.');
      return;
    }

    const decrypted = decryptData(encryptedWallet, password);
    if (decrypted) {
      const wallet = JSON.parse(decrypted);
      // Removed setDecryptedWallet as the state is no longer used
      setWalletAddress(wallet.address);
      setPrivateKey(wallet.privateKey);
      setError('');
    } else {
      setError('Incorrect password. Unable to decrypt wallet.');
    }
  };

  const handleImportWallet = async () => {
    if (!password) {
      setError('Please enter a password to encrypt your wallet.');
      return;
    }

    try {
      if (!ethers.isHexString(privateKey.trim(), 32)) {
        throw new Error("Invalid private key format.");
      }
      const wallet = new ethers.Wallet(privateKey.trim(), provider);
      setWalletAddress(wallet.address);
      setError('');
      saveWalletInfo(wallet.address, wallet.privateKey, password);
      alert(`Wallet imported successfully! Address: ${wallet.address}`);
    } catch (err) {
      console.error(err);
      setError((err instanceof Error ? err.message : 'Invalid private key. Please try again.'));
    }
  };

  const handleCreateWallet = async () => {
    if (!password) {
      setError('Please enter a password to encrypt your wallet.');
      return;
    }

    try {
      const wallet = ethers.Wallet.createRandom().connect(provider);
      setWalletAddress(wallet.address);
      setPrivateKey(wallet.privateKey);
      setError('');
      saveWalletInfo(wallet.address, wallet.privateKey, password);
      alert(
        `New wallet created! Address: ${wallet.address}\nPrivate Key: ${wallet.privateKey}\nPlease save your private key securely.`
      );
    } catch (err) {
      setError('Failed to create wallet. Please try again.');
    }
  };

  return (
    <div>
      <h1>Wallet Connect</h1>
      {walletAddress ? (
        <div>
          <p>Wallet Address: {walletAddress}</p>
          <p>Private Key: {privateKey}</p>
          <p style={{ color: 'red' }}>
            Make sure to save your private key securely. You will need it to access your wallet.
          </p>
        </div>
      ) : (
        <>
          <div>
            <h2>Set Password</h2>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <h2>Load Wallet</h2>
            <button onClick={loadWalletInfo}>Load Wallet</button>
          </div>
          <div>
            <h2>Import Wallet</h2>
            <input
              type="text"
              placeholder="Enter private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
            />
            <button onClick={handleImportWallet}>Import Wallet</button>
          </div>
          <div>
            <h2>Create New Wallet</h2>
            <button onClick={handleCreateWallet}>Create Wallet</button>
          </div>
        </>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default WalletConnectPage;
