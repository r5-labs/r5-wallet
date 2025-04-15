import { useState, useEffect } from "react";
import WalletConnectPage from "./pages/WalletConnectPage";
import MainPage from "./pages/MainPage";
import CryptoJS from "crypto-js";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [password, setPassword] = useState(""); // Store password in memory
  const [decryptedPrivateKey, setDecryptedPrivateKey] = useState(""); // Store decrypted private key in memory

  useEffect(() => {
    const walletInfo = localStorage.getItem("walletInfo");
    if (walletInfo) {
      setHasWallet(true);
    }
  }, []);

  const handleAuthenticate = () => {
    const walletInfo = JSON.parse(localStorage.getItem("walletInfo") || "{}");
    try {
      const decryptedKey = CryptoJS.AES.decrypt(
        walletInfo.encryptedPrivateKey,
        password
      ).toString(CryptoJS.enc.Utf8);
      if (!decryptedKey || !/^0x[0-9a-fA-F]{64}$/.test(decryptedKey)) {
        throw new Error("Invalid password or private key.");
      }
      setDecryptedPrivateKey(decryptedKey); // Store decrypted private key in memory
      setIsAuthenticated(true);
    } catch (error) {
      alert("Incorrect password. Please try again.");
    }
  };

  const handleWalletSetup = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
    setHasWallet(true);
    setIsAuthenticated(true); // Automatically authenticate after wallet setup
  };

  const handleReset = () => {
    localStorage.removeItem("walletInfo");
    setHasWallet(false);
    setIsAuthenticated(false);
    setPassword(""); // Clear password from memory
    setDecryptedPrivateKey(""); // Clear private key from memory
  };

  return (
    <>
      {isAuthenticated ? (
        hasWallet ? (
          <MainPage
            onReset={handleReset}
            decryptedPrivateKey={decryptedPrivateKey} // Pass private key to MainPage
          />
        ) : (
          <WalletConnectPage onWalletSetup={handleWalletSetup} />
        )
      ) : hasWallet ? (
        <div>
          <h1>Enter Password</h1>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleAuthenticate}>Login</button>
        </div>
      ) : (
        <WalletConnectPage onWalletSetup={handleWalletSetup} />
      )}
    </>
  );
}

export default App;
