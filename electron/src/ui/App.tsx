// App.tsx
import { useState, useEffect, useRef } from "react";
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
  /* ------------------------------------------------------------------ */
  /* State                                                               */
  /* ------------------------------------------------------------------ */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [password, setPassword] = useState("");
  const [decryptedKey, setDecryptedPrivateKey] = useState("");

  /* ------------------------------------------------------------------ */
  /* Ref to focus the password input                                     */
  /* ------------------------------------------------------------------ */
  const passwordInputRef = useRef<HTMLInputElement | null>(null);

  /* Focus the password input whenever the unlock screen is rendered */
  useEffect(() => {
    if (hasWallet && !isAuthenticated) {
      passwordInputRef.current?.focus();
    }
  }, [hasWallet, isAuthenticated]);

  /* ------------------------------------------------------------------ */
  /* Check if a wallet already exists                                    */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (localStorage.getItem("walletInfo")) {
      setHasWallet(true);
    }
  }, []);

  /* ------------------------------------------------------------------ */
  /* Handlers                                                            */
  /* ------------------------------------------------------------------ */
  const handleAuthenticate = () => {
    const walletInfo = JSON.parse(localStorage.getItem("walletInfo") || "{}");
    try {
      const decrypted = CryptoJS.AES.decrypt(
        walletInfo.encryptedPrivateKey,
        password
      ).toString(CryptoJS.enc.Utf8);

      if (!/^0x[0-9a-fA-F]{64}$/.test(decrypted)) {
        throw new Error("Invalid password or private key.");
      }

      setDecryptedPrivateKey(decrypted);
      setIsAuthenticated(true);
    } catch {
      alert("Incorrect password. Please try again.");
    }
  };

  const handleWalletSetup = async () => {
    await new Promise((r) => setTimeout(r, 1000));
    setHasWallet(true);
    setIsAuthenticated(true);
  };

  const handleReset = () => {
    localStorage.removeItem("walletInfo");
    setHasWallet(false);
    setIsAuthenticated(false);
    setPassword("");
    setDecryptedPrivateKey("");
  };

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <FullPageBox>
      {isAuthenticated ? (
        <MainPage onReset={handleReset} decryptedPrivateKey={decryptedKey} />
      ) : hasWallet ? (
        /* -------- Unlock existing wallet -------- */
        <FullPageBox style={{ minHeight: "100%" }}>
          <FullContainerBox>
            <img
              src={R5Logo}
              alt="R5 Logo"
              style={{ width: 96, height: 96, margin: "-25px 0" }}
            />
            <TextHeader style={{ marginBottom: -15 }}>Welcome Back!</TextHeader>
            <Text>Enter your password to unlock and access your wallet.</Text>

            <Input
              ref={passwordInputRef}
              type="password"
              placeholder="Enter your password…"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAuthenticate()}
              style={{ minWidth: "40ch", margin: "20px" }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <ButtonSecondary
                onClick={() =>
                  confirm("Reset wallet? This action cannot be undone.") &&
                  handleReset()
                }
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
        /* -------- No wallet yet -------- */
        <WalletConnectPage onWalletSetup={handleWalletSetup} />
      )}
    </FullPageBox>
  );
}

export default App;
