import { useState, useEffect } from "react";
import WalletConnectPage from "./pages/WalletConnectPage";
import MainPage from "./pages/MainPage";
import CryptoJS from "crypto-js";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const walletInfo = localStorage.getItem("walletInfo");
    if (walletInfo) {
      setHasWallet(true);
    }
  }, []);

  const handleAuthenticate = () => {
    const walletInfo = JSON.parse(localStorage.getItem("walletInfo") || "{}");
    try {
      const decryptedPrivateKey = CryptoJS.AES.decrypt(
        walletInfo.encryptedPrivateKey,
        password
      ).toString(CryptoJS.enc.Utf8);
      if (!decryptedPrivateKey || !/^0x[0-9a-fA-F]{64}$/.test(decryptedPrivateKey)) {
        throw new Error("Invalid password or private key.");
      }
      localStorage.setItem(
        "walletInfo",
        JSON.stringify({ ...walletInfo, privateKey: decryptedPrivateKey })
      );
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
  };

  return (
    <>
      {isAuthenticated ? (
        hasWallet ? (
          <MainPage onReset={handleReset} />
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
