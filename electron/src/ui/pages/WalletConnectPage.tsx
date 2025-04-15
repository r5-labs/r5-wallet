import { useState } from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";

function WalletConnectPage({ onWalletSetup }: { onWalletSetup: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState("");

  const rpcUrl = "https://rpc.r5.network/";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const saveEncryptedWallet = async (address: string, encryptedPrivateKey: string) => {
    localStorage.setItem(
      "walletInfo",
      JSON.stringify({ address, encryptedPrivateKey }) // Remove password from storage
    );
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
      await saveEncryptedWallet(wallet.address, encryptedPrivateKey);
      onWalletSetup(); // Navigate directly to the main page
      window.location.reload(); // Reload the app
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
      await saveEncryptedWallet(wallet.address, encryptedPrivateKey);
      onWalletSetup(); // Navigate directly to the main page
      window.location.reload(); // Reload the app
    } catch (err) {
      setError("Failed to create wallet. Please try again.");
    }
  };

  return (
    <div>
      <h1>Wallet Connect</h1>
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
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default WalletConnectPage;
