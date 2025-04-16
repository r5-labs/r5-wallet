import { useState } from "react";
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
} from "../theme";
import { RpcUrl } from "../constants";

export default function WalletConnectPage({
  onWalletSetup,
}: {
  onWalletSetup: () => void;
}) {
  const [step, setStep] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState("");

  const provider = new ethers.JsonRpcProvider(RpcUrl);

  const saveEncryptedWallet = async (
    address: string,
    encryptedPrivateKey: string
  ) => {
    localStorage.setItem(
      "walletInfo",
      JSON.stringify({ address, encryptedPrivateKey })
    );
  };

  const handleSetPassword = () => {
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    setStep(1);
  };

  const handleCreateWallet = async () => {
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
  };

  const handleImportWallet = async () => {
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
  };

  return (
    <FullContainerBox style={{ position: "relative", height: "100vh" }}>
      {/* Step 0: Set Password */}
      <StepWrapper active={step === 0}>
        <TextSubTitle>Let's first set a secure password…</TextSubTitle>
        <Text>
          Your password must have at least 8 characters. Avoid using dates of
          birth, your own name, or passwords that may be easy to guess.
        </Text>
        <Sp />
        <BoxContent>
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ minWidth: "40ch" }}
          />
          <Input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ minWidth: "40ch" }}
          />
        </BoxContent>
        <ButtonPrimary onClick={handleSetPassword}>
          Set Wallet Password
        </ButtonPrimary>
      </StepWrapper>

      {/* Step 1: Choose Import or Create */}
      <StepWrapper active={step === 1}>
        <ButtonSecondary
          onClick={() => setStep(0)}
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
          <ButtonSecondary onClick={() => setStep(2)}>
            Import Wallet
          </ButtonSecondary>
          <ButtonPrimary onClick={handleCreateWallet}>
            Create Wallet
          </ButtonPrimary>
        </BoxContent>
      </StepWrapper>

      {/* Step 2: Import Wallet */}
      <StepWrapper active={step === 2}>
        <ButtonSecondary
          onClick={() => setStep(1)}
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
          type="text"
          placeholder="Enter private key"
          value={privateKey}
          onChange={(e) => setPrivateKey(e.target.value)}
          style={{ minWidth: "64ch" }}
        />
        <ButtonPrimary onClick={handleImportWallet}>
          Import Wallet
        </ButtonPrimary>
      </StepWrapper>

      {error && (
        <p style={{ position: "absolute", bottom: 20, color: "red" }}>
          {error}
        </p>
      )}
    </FullContainerBox>
  );
}
