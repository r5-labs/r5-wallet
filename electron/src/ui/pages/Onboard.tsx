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
} from "../theme";
import { useWeb3Context } from "../contexts/Web3Context";

const AnimatedStep = styled(StepWrapper) <{ $active: boolean }>`
  animation: ${({ $active }) =>
    $active
      ? css`${fadeIn} 0.5s forwards`
      : css`${fadeOut} 0.5s forwards`};
`;

export default function Onboard({
  onWalletSetup,
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

  /* ------------------------------------------------------------------ */
  /* Refs for focusing                                                   */
  /* ------------------------------------------------------------------ */
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const privateKeyInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const refMap: Record<
      0 | 1 | 2 | 3,
      React.RefObject<HTMLInputElement | null> | undefined
    > = {
      0: fileInputRef,
      1: passwordRef,
      2: undefined,
      3: privateKeyInputRef,
    };
    refMap[step]?.current?.focus();
  }, [step]);

  /* ------------------------------------------------------------------ */
  /* Provider                                                            */
  /* ------------------------------------------------------------------ */
  const { provider } = useWeb3Context()

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
      {/* STEP 0: Import .key file */}
      <AnimatedStep $active={step === 0} style={{ marginBottom: "20px" }}>
        <TextSubTitle>
          Do you have an R5 key wallet file you would like to import?
        </TextSubTitle>
        <Input
          type="file"
          accept=".key"
          onChange={handleFileImport}
          style={{ margin: "20px auto", display: "block" }}
          ref={fileInputRef}
        />
        <ButtonPrimary onClick={() => setStep(1)}>
          I don't have an R5 key wallet file…
        </ButtonPrimary>
      </AnimatedStep>

      {/* STEP 1: Set password */}
      <AnimatedStep $active={step === 1}>
        <ButtonSecondary
          onClick={() => setStep(0)}
          style={{ alignSelf: "center", marginBottom: "10px" }}
        >
          ← Go Back
        </ButtonSecondary>
        <TextSubTitle>First, let's set a secure password…</TextSubTitle>
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

      {/* STEP 2: Choose create or import */}
      <AnimatedStep $active={step === 2}>
        <ButtonSecondary
          onClick={() => setStep(1)}
          style={{ alignSelf: "center", marginBottom: "10px" }}
        >
          ← Go Back
        </ButtonSecondary>
        <TextSubTitle>
          Do you already have a wallet or want to create a new one?
        </TextSubTitle>
        <Text>
          You can create a fresh new wallet or import an existing one using its
          private key.
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

      {/* STEP 3: Import via private key */}
      <AnimatedStep $active={step === 3}>
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
        <Sp />
        <Input
          ref={privateKeyInputRef}
          type="text"
          placeholder="Enter private key"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          style={{ minWidth: "64ch" }}
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
    </FullContainerBox>
  );
}
