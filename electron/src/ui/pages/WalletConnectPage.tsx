import { useState } from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";

function WalletConnectPage({ onWalletSetup }: { onWalletSetup: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");

  const rpcUrl = "https://rpc.r5.network/";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const saveEncryptedWallet = async (address: string, encryptedPrivateKey: string, password: string) => {
    localStorage.setItem(
      "walletInfo",
      JSON.stringify({ address, encryptedPrivateKey, password }) // Store password in walletInfo
    );
    await delay(1000); // Wait for 1 second after saving
  };

  const handleImportWallet = async () => {
    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
      }
      const trimmedKey = privateKey.trim();
      if (!/^0x[0-9a-fA-F]{64}$/.test(trimmedKey)) {
        throw new Error(
          "Invalid private key format. Ensure it is a 64-character hex string prefixed with '0x'."
        );
      }
      const wallet = new ethers.Wallet(trimmedKey, provider);
      const encryptedPrivateKey = CryptoJS.AES.encrypt(
        trimmedKey,
        password
      ).toString();
      setWalletAddress(wallet.address);
      setError("");
      await saveEncryptedWallet(wallet.address, encryptedPrivateKey, password); // Pass password
      onWalletSetup();
      alert(`Wallet imported successfully! Address: ${wallet.address}`);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Invalid private key. Please try again."
      );
    }
  };

  const handleCreateWallet = async () => {
    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
      }
      const wallet = ethers.Wallet.createRandom().connect(provider);
      const encryptedPrivateKey = CryptoJS.AES.encrypt(
        wallet.privateKey,
        password
      ).toString();
      setWalletAddress(wallet.address);
      setPrivateKey(wallet.privateKey);
      setError("");
      await saveEncryptedWallet(wallet.address, encryptedPrivateKey, password); // Pass password
      onWalletSetup();
      alert(
        `New wallet created! Address: ${wallet.address}\nPrivate Key: ${wallet.privateKey}\nPlease save your private key securely.`
      );
    } catch (err) {
      setError("Failed to create wallet. Please try again.");
    }
  };

  return (
    <div>
      <h1>Wallet Connect</h1>
      {walletAddress ? (
        <div>
          <p>Wallet Address: {walletAddress}</p>
          <p>Private Key: {privateKey}</p>
          <p style={{ color: "red" }}>
            Make sure to save your private key securely. You will need it to access
            your wallet.
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
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
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
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default WalletConnectPage;
