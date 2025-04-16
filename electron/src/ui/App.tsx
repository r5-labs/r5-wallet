import { useState, useEffect } from "react";
import WalletConnectPage from "./pages/WalletConnectPage";
import MainPage from "./pages/MainPage";
import CryptoJS from "crypto-js";
import {
  FullPageBox,
  Input,
  TextHeader,
  Text,
  ButtonPrimary,
  ButtonSecondary,
  FullContainerBox
} from "./theme";
import R5Logo from "./assets/logo_white-transparent.png";

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
      <FullPageBox>
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
          <FullPageBox style={{ minHeight: "100%" }}>
            <FullContainerBox>
            <img
              src={R5Logo}
              alt="R5 Logo"
              style={{ width: "96px", height: "96px", margin: "-25px 0" }}
            />
            <TextHeader style={{ marginBottom: "-15px" }}>
              Welcome Back!
            </TextHeader>
            <Text style={{ marginBottom: 0 }}>
              Enter your password to unlock and access your wallet.
            </Text>
            <Input
              type="password"
              placeholder="Enter your password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ minWidth: "40ch", margin: "20px" }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <ButtonSecondary
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to reset the wallet? This action cannot be undone."
                    )
                  ) {
                    handleReset();
                  }
                }}
              >
                Reset Wallet
              </ButtonSecondary>
              <ButtonPrimary onClick={handleAuthenticate}>
                Unlock Wallet
              </ButtonPrimary>
            </div>
            </FullContainerBox>
          </FullPageBox>
        ) : (
          <WalletConnectPage onWalletSetup={handleWalletSetup} />
        )}
        
      </FullPageBox>
    </>
  );
}

export default App;
