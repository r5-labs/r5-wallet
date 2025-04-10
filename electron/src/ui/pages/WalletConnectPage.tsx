import { useState } from 'react';
import { ethers } from 'ethers';

function WalletConnectPage({ onWalletSetup }: { onWalletSetup: () => void }) {
  const [privateKey, setPrivateKey] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [error, setError] = useState('');

  const rpcUrl = 'https://rpc.r5.network/';
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const saveWalletInfo = (address: string, privateKey: string) => {
    localStorage.setItem(
      'walletInfo',
      JSON.stringify({ address, privateKey })
    );
    onWalletSetup();
  };

  const handleImportWallet = async () => {
    try {
      const wallet = new ethers.Wallet(privateKey.trim(), provider);
      setWalletAddress(wallet.address);
      setError('');
      saveWalletInfo(wallet.address, wallet.privateKey);
      alert(`Wallet imported successfully! Address: ${wallet.address}`);
    } catch (err) {
      setError('Invalid private key. Please try again.');
    }
  };

  const handleCreateWallet = async () => {
    try {
      const wallet = ethers.Wallet.createRandom().connect(provider);
      setWalletAddress(wallet.address);
      setPrivateKey(wallet.privateKey);
      setError('');
      saveWalletInfo(wallet.address, wallet.privateKey);
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
