import { useState, useEffect, useRef } from "react";
import WalletConnectPage from "./pages/WalletConnectPage";
import MainPage from "./pages/MainPage";
import CryptoJS from "crypto-js";
import {
  FullPageBox,
  FullContainerBox,
  Input,
  TextHeader,
  Text,
  ButtonPrimary,
  ButtonSecondary,
  TextTitle,
  colorSemiBlack
} from "./theme";
import R5Logo from "./assets/logo_white-transparent.png";
import { Modal } from "./components/Modal";

import { getCurrentVersion } from "./utils/getCurrentVersion";
import { useLatestRelease } from "./hooks/useLatestRelease";
import { UpdateDownloadUrl } from "./constants";

function App() {
  /* ------------------------------------------------------------------ */
  /* State                                                               */
  /* ------------------------------------------------------------------ */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);
  const [password, setPassword] = useState("");
  const [decryptedKey, setDecryptedPrivateKey] = useState("");

  /* ------------------------------------------------------------------ */
  /* Version check                                                       */
  /* ------------------------------------------------------------------ */
  const currentVersion = getCurrentVersion(); // e.g. "v0.0.9-beta"
  const { latest, error } = useLatestRelease(); // latest?.tag is now full "v1.0.0-beta"
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // read any previous dismissal
  // const dismissedVersion = localStorage.getItem("dismissedVersion")
  const dismissedVersion = "0";

  // if fetch fails, just log it
  useEffect(() => {
    if (error) console.error("Latest‐release fetch failed:", error);
  }, [error]);

  // once latest is loaded, compare raw strings, and only if not yet dismissed:
  useEffect(() => {
    if (
      latest &&
      latest.tag !== currentVersion &&
      dismissedVersion !== latest.tag
    ) {
      setShowUpdateModal(true);
    }
  }, [latest, currentVersion, dismissedVersion]);

  // when user says “Later” or after Download, never show again for this tag
  const dismissRelease = () => {
    if (latest) {
      localStorage.setItem("dismissedVersion", latest.tag);
    }
    setShowUpdateModal(false);
  };

  /* ------------------------------------------------------------------ */
  /* Ref to focus the password input                                     */
  /* ------------------------------------------------------------------ */
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (hasWallet && !isAuthenticated) {
      passwordInputRef.current?.focus();
    }
  }, [hasWallet, isAuthenticated]);

  /* ------------------------------------------------------------------ */
  /* Check for existing wallet                                           */
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
      {/* ——— Update‐available modal ——— */}
      <Modal open={showUpdateModal} onClose={dismissRelease}>
        <TextTitle style={{ color: colorSemiBlack }}>
          Update Available
        </TextTitle>
        <Text style={{ color: colorSemiBlack }}>
          You’re running <strong>{currentVersion}</strong>, and version{" "}
          <strong>{latest?.tag}</strong> is the currently recommended version. Please update your wallet
          to install the latest security patches and features. For more information and change logs, please
          visit the app <b><a href={UpdateDownloadUrl} target="_blank" rel="noopener">release page</a></b>.
        </Text>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <ButtonPrimary onClick={dismissRelease}>Remind Me Later</ButtonPrimary>
          <a href={UpdateDownloadUrl} target="_blank" rel="noopener">
          <ButtonPrimary>
            Download {latest?.tag}
          </ButtonPrimary>
          </a>
        </div>
      </Modal>

      {/* ——— Main UI ——— */}
      {isAuthenticated ? (
        <MainPage onReset={handleReset} decryptedPrivateKey={decryptedKey} />
      ) : hasWallet ? (
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
              style={{ minWidth: "40ch", margin: "20px 0" }}
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
        <WalletConnectPage onWalletSetup={handleWalletSetup} />
      )}
    </FullPageBox>
  );
}

export default App;
