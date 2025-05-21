import { useState, useEffect, useRef, useCallback } from "react";
import styled, { css } from "styled-components";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import {
  FullContainerBox,
  Text,
  TextSubTitle,
  Input,
  ButtonPrimary,
  ButtonSecondary,
  BoxContent,
  Sp,
  StepWrapper,
  fadeIn,
  fadeOut,
  BoxContentParent,
  borderRadiusDefault
} from "../../theme";
import { useWeb3Context } from "../../contexts/Web3Context";
import R5Logo from "../../assets/r5-wallet.png";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";

const AnimatedStep = styled(StepWrapper)<{ $active: boolean }>`
  animation: ${({ $active }) =>
    $active
      ? css`
          ${fadeIn} 0.5s forwards
        `
      : css`
          ${fadeOut} 0.5s forwards
        `};
`;

export default function Onboard({
  onWalletSetup
}: {
  onWalletSetup: () => void;
}) {
  /* ------------------------------------------------------------------ */
  /* State                                                               */
  /* ------------------------------------------------------------------ */
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState("");
  const [scannerVisible, setScannerVisible] = useState(false);

  /* ------------------------------------------------------------------ */
  /* Refs for focusing                                                   */
  /* ------------------------------------------------------------------ */
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const privateKeyInputRef = useRef<HTMLInputElement | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const refMap: Record<
      0 | 1 | 2 | 3,
      React.RefObject<HTMLInputElement | null> | undefined
    > = {
      0: fileInputRef,
      1: passwordRef,
      2: undefined,
      3: privateKeyInputRef
    };
    refMap[step]?.current?.focus();
  }, [step]);

  /* ------------------------------------------------------------------ */
  /* Provider                                                            */
  /* ------------------------------------------------------------------ */
  const { provider } = useWeb3Context();

  const saveEncryptedWallet = async (
    address: string,
    encryptedPrivateKey: string
  ) => {
    localStorage.setItem(
      "walletInfo",
      JSON.stringify({ address, encryptedPrivateKey })
    );
  };

  /* ------------------------------------------------------------------ */
  /* STEP ACTIONS                                                        */
  /* ------------------------------------------------------------------ */
  const handleSetPassword = useCallback(() => {
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setStep(2);
  }, [password, confirmPassword]);

  const handleCreateWallet = useCallback(async () => {
    try {
      const wallet = ethers.Wallet.createRandom().connect(provider);
      const encrypted = CryptoJS.AES.encrypt(
        wallet.privateKey,
        password
      ).toString();
      await saveEncryptedWallet(wallet.address, encrypted);
      onWalletSetup();
      window.location.reload();
    } catch {
      setError("Failed to create wallet. Please try again.");
    }
  }, [password, provider, onWalletSetup]);

  const handleImportWallet = useCallback(async () => {
    try {
      const trimmed = privateKey.trim();
      if (!/^0x[0-9a-fA-F]{64}$/.test(trimmed)) {
        throw new Error("Invalid private key format.");
      }
      const wallet = new ethers.Wallet(trimmed, provider);
      const encrypted = CryptoJS.AES.encrypt(trimmed, password).toString();
      await saveEncryptedWallet(wallet.address, encrypted);
      onWalletSetup();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    }
  }, [privateKey, password, provider, onWalletSetup]);

  const startQrScanner = () => {
    const qrRegionId = "qr-scanner-region";

    if (scannerRef.current !== null) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        })
        .catch(() => {
          scannerRef.current = null;
        });
    }

    const scanner = new Html5Qrcode(qrRegionId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250
        },
        (decodedText) => {
          setPrivateKey(decodedText);
          setScannerVisible(false);
          scanner.stop().then(() => scanner.clear());
        },
        (error) => {
          // Optional: console.log("QR Scan Error", error);
        }
      )
      .catch((err) => {
        setError("Failed to start QR scanner: " + err.message);
      });
  };

  /* ------------------------------------------------------------------ */
  /* File import                                                         */
  /* ------------------------------------------------------------------ */
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.address || !parsed.encryptedPrivateKey)
          throw new Error("Invalid wallet file: missing required fields.");
        if (!/^0x[0-9a-fA-F]{40}$/.test(parsed.address))
          throw new Error("Invalid wallet file: invalid address format.");

        localStorage.setItem("walletInfo", JSON.stringify(parsed));
        window.location.reload();
      } catch (err) {
        setError(err instanceof Error ? err.message : "File import failed.");
      }
    };
    reader.readAsText(file);
  };

  /* ------------------------------------------------------------------ */
  /* Keyboard shortcuts                                                  */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        switch (step) {
          case 0:
            setStep(1);
            break;
          case 1:
            handleSetPassword();
            break;
          case 2:
            handleCreateWallet();
            break;
          case 3:
            handleImportWallet();
            break;
        }
      } else if (e.key === "Escape") {
        switch (step) {
          case 1:
            setStep(0);
            break;
          case 2:
            setStep(1);
            break;
          case 3:
            setStep(2);
            break;
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [step, handleSetPassword, handleCreateWallet, handleImportWallet]);

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */
  return (
    <FullContainerBox style={{ position: "relative", height: "100vh" }}>
      {/* STEP 0: T&Cs */}
      <BoxContentParent>
        <AnimatedStep $active={step === 0} style={{ marginBottom: "auto" }}>
          <img
            src={R5Logo}
            alt="R5Logo"
            width={64}
            height={64}
            style={{ margin: 0 }}
          />
          <TextSubTitle>
            <b>Important:</b> This Software is provided "AS IS".
          </TextSubTitle>
          <Text>
            This software is provided "as is", without warranty of any kind,
            express or implied, including but not limited to the warranties of
            merchantability, fitness for a particular purpose and
            noninfringement. In no event shall the authors or copyright holders
            be liable for any claim, damages, or other liability, whether in an
            action of contract, tort or otherwise, arising from, out of or in
            connection with the software or the use or other dealings in the
            software. The software developers and contributors assume{" "}
            <b>no liability</b> for the usage of this application under any
            circumstance.
          </Text>
          <Text>
            Additionally, it is important for you to understand that this is a
            <b>self-custody wallet</b>, which means that{" "}
            <b>NO ONE WILL BE ABLE TO HELP YOU TO RECOVER YOUR FUNDS</b> if your
            private key is stolen or if you lose your device and do not have a
            backup of your keys.
          </Text>
          <Text>
            <b>
              Make sure you understand and agree with the terms above before
              creating your wallet.
            </b>
          </Text>
          <Sp />
          <ButtonPrimary onClick={() => setStep(1)}>
            Agree & Continue
          </ButtonPrimary>
        </AnimatedStep>
      </BoxContentParent>

      {/* STEP 1: Set password */}
      <BoxContentParent>
        <AnimatedStep
          $active={step === 1}
          style={{ marginBottom: "auto", padding: 10 }}
        >
          <ButtonSecondary
            onClick={() => setStep(0)}
            style={{ alignSelf: "center", marginBottom: "10px" }}
          >
            ← Go Back
          </ButtonSecondary>
          <TextSubTitle>Secure Your Wallet</TextSubTitle>
          <Text>
            Your password must have at least 8 characters. Avoid using dates of
            birth or easy‑to‑guess words.
          </Text>
          <Sp />
          <BoxContent>
            <Input
              ref={passwordRef}
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ minWidth: "40ch", zIndex: 1000 }}
            />
          </BoxContent>
          <BoxContent>
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirm(e.target.value)}
              style={{ minWidth: "40ch", zIndex: 1000 }}
            />
          </BoxContent>
          <ButtonPrimary onClick={handleSetPassword}>
            Set Wallet Password
          </ButtonPrimary>
        </AnimatedStep>
      </BoxContentParent>

      {/* STEP 2: Choose create or import */}
      <BoxContentParent>
        <AnimatedStep
          $active={step === 2}
          style={{ marginBottom: "auto", padding: 10 }}
        >
          <ButtonSecondary
            onClick={() => setStep(1)}
            style={{ alignSelf: "center", marginBottom: "10px" }}
          >
            ← Go Back
          </ButtonSecondary>
          <Sp />
          <TextSubTitle>
            Import an existing private key or want to create a new wallet?
          </TextSubTitle>
          <Text>
            You can create a fresh new wallet or import an existing one using
            its private key.
          </Text>
          <Text>
            If you want to use the same wallet as you use on your R5 Desktop
            Wallet software, you can do that by using the "Show Private Key"
            option on your desktop and importing it to your mobile wallet
            application.
          </Text>
          <Sp />
          <BoxContent>
            <ButtonSecondary onClick={() => setStep(3)}>
              Import Wallet
            </ButtonSecondary>
            <ButtonPrimary onClick={handleCreateWallet}>
              Create Wallet
            </ButtonPrimary>
          </BoxContent>
        </AnimatedStep>
      </BoxContentParent>

      {/* STEP 3: Import via private key */}
      <BoxContentParent>
        <AnimatedStep
          $active={step === 3}
          style={{ marginBottom: "auto", padding: 10 }}
        >
          <ButtonSecondary
            onClick={() => setStep(2)}
            style={{ alignSelf: "center", marginBottom: "10px" }}
          >
            ← Go Back
          </ButtonSecondary>
          <TextSubTitle>Your Private Key</TextSubTitle>
          <Text>
            Enter your private key string below and click on "Import Wallet" to
            proceed.
          </Text>
          <Text>
            You can sync with your Desktop Wallet by exposing your Private Key{" "}
            <b>(More Options ~ Expose Private Key)</b> and scanning the QR code
            using the button below.
          </Text>
          <ButtonPrimary
            onClick={() => {
              setScannerVisible(true);
              setTimeout(startQrScanner, 100); // Give time for DOM to render
            }}
          >
            Scan QR Code
          </ButtonPrimary>

          {scannerVisible && (
            <div style={{ marginTop: 10 }}>
              <div
                id="qr-scanner-region"
                style={{ width: "100%", maxWidth: 400, margin: "0 auto", borderRadius: borderRadiusDefault }}
              />
              <ButtonSecondary
                onClick={() => {
                  scannerRef.current?.stop().then(() => {
                    scannerRef.current?.clear();
                    setScannerVisible(false);
                  });
                }}
                style={{ marginTop: 10 }}
              >
                Cancel Scanner
              </ButtonSecondary>
            </div>
          )}

          <Sp />
          <Input
            ref={privateKeyInputRef}
            type="text"
            placeholder="Enter private key"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            style={{ minWidth: "100%" }}
          />
          <ButtonPrimary onClick={handleImportWallet}>
            Import Wallet
          </ButtonPrimary>
        </AnimatedStep>

        {/* Error banner */}
        {error && (
          <p style={{ position: "absolute", bottom: 20, color: "red" }}>
            {error}
          </p>
        )}
      </BoxContentParent>
    </FullContainerBox>
  );
}
