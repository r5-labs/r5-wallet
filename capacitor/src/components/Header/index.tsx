import { useState, useEffect, useMemo } from "react";
import { ethers, formatEther } from "ethers";
import {
  BoxHeader,
  HeaderSection,
  TextSubTitle,
  SmallText,
  ButtonRound,
  HeaderButtonWrapper,
  ButtonPrimary,
  ButtonSecondary,
  colorSemiBlack,
  TextTitle,
  Text,
  colorGray,
  colorGlassBackground,
  colorBackground,
  colorBorder,
  borderRadiusDefault,
  colorSecondary
} from "../../theme";
import {
  GoArrowDownLeft,
  GoArrowUpRight,
  GoTrash,
  GoKey,
  GoHistory,
  GoUpload,
  GoInfo,
  GoSync,
  GoCopy,
  GoCheck,
  GoLock
} from "react-icons/go";
import R5Logo from "../../assets/logo_white-transparent.png";

import { ReceiveFunds } from "../ReceiveFunds";
import { PrivateKey } from "../PrivateKey";
import { About } from "../About";
import { Modal } from "../Modal";
import { useWeb3Context } from "../../contexts/Web3Context";
import usePrice from "../../hooks/usePrice";

/* Icon aliases for readability */
const ReceiveIcon = GoArrowDownLeft as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const SendIcon = GoArrowUpRight as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const ResetIcon = GoTrash as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const PrivateKeyIcon = GoKey as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const HistoryIcon = GoHistory as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const ExportIcon = GoUpload as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const InfoIcon = GoInfo as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const RefreshIcon = GoSync as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const CopyIcon = GoCopy as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const CheckIcon = GoCheck as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const LockIcon = GoLock as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

export function Header({
  decryptedPrivateKey
}: {
  decryptedPrivateKey: string;
}) {
  /* ------------------------------------------------------------------ */
  /* State                                                               */
  /* ------------------------------------------------------------------ */
  const [balance, setBalance] = useState("0");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showReceiveQR, setShowReceiveQR] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showConfirmPkModal, setShowConfirmPkModal] = useState(false);
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);

  const price = usePrice();

  /* ------------------------------------------------------------------ */
  /* Blockchain side                                                    */
  /* ------------------------------------------------------------------ */
  const { provider, explorerUrl } = useWeb3Context();
  // let wallet: ethers.Wallet;

  const wallet = useMemo(() => {
    try {
      return new ethers.Wallet(decryptedPrivateKey, provider);
    } catch (e) {
      console.error("Invalid private key:", e);
      alert("Invalid private key. Please reset your wallet.");
      return null;
    }
  }, [decryptedPrivateKey]);

  const updateBalance = () => {
    if (wallet)
      provider
        .getBalance(wallet.address)
        .then((wei: ethers.BigNumberish) => setBalance(formatEther(wei)))
        .catch((err: any) => console.error("Failed to update balance:", err));
  };

  useEffect(() => {
    updateBalance();
    const id = setInterval(updateBalance, 60_000);
    return () => clearInterval(id);
  }, [provider, wallet?.address]);

  /* ------------------------------------------------------------------ */
  /* Button handlers                                                    */
  /* ------------------------------------------------------------------ */
  const handleRefresh = () => {
    setIsRefreshing(true);
    updateBalance();
    setTimeout(() => setIsRefreshing(false), 1_000);
  };

  const exportWalletFile = () => {
    const raw = localStorage.getItem("walletInfo");
    if (!raw) return alert("No wallet to export.");
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${wallet?.address}.key`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(wallet?.address ?? "")
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2_000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  /** Lock the wallet: keep encrypted JSON, drop any decrypted/session
   *  data, and reload so the app shows the password screen again. */
  const handleLockWallet = () => {
    /* Clear anything that might hold plaintext keys */
    sessionStorage.clear();
    /* Reload the renderer – React will mount at the login page */
    window.location.reload();
  };

  const handleResetWallet = () => {
    sessionStorage.clear();
    window.location.reload();
    localStorage.clear();
    window.location.reload();
  };

  return (
    <>
      {/* Confirm: expose private key */}
      <Modal
        open={showConfirmPkModal}
        onClose={() => setShowConfirmPkModal(false)}
      >
        <TextTitle style={{ color: colorSemiBlack }}>
          Expose Private Key?
        </TextTitle>
        <Text style={{ color: colorSemiBlack }}>
          This will expose your private key on‑screen. You may want to do this
          for backing up your wallet, however, be aware that your funds will be
          inherently at risk. Only proceed if you’re in a secure environment and
          have no one looking over your shoulder.
        </Text>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <ButtonSecondary onClick={() => setShowConfirmPkModal(false)}>
            Cancel
          </ButtonSecondary>
          <ButtonPrimary
            onClick={() => {
              setShowConfirmPkModal(false);
              setShowPrivateKey(true);
            }}
          >
            Show Private Key
          </ButtonPrimary>
        </div>
      </Modal>

      {/* Confirm: reset wallet */}
      <Modal
        open={showConfirmResetModal}
        onClose={() => setShowConfirmResetModal(false)}
      >
        <TextTitle style={{ color: colorSemiBlack }}>Reset Wallet?</TextTitle>
        <Text style={{ color: colorSemiBlack }}>
          This will delete all locally‑stored wallet data. Make sure you’ve
          exported a backup before continuing. This action cannot be undone.
        </Text>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <ButtonSecondary onClick={() => setShowConfirmResetModal(false)}>
            Cancel
          </ButtonSecondary>
          <ButtonPrimary
            onClick={() => {
              setShowConfirmResetModal(false);
              handleResetWallet();
            }}
          >
            Reset Wallet
          </ButtonPrimary>
        </div>
      </Modal>
      <BoxHeader>
        {/* Logo */}
        <HeaderSection style={{ margin: -7 }}>
          <img src={R5Logo} width={64} height={64} />
        </HeaderSection>

        {/* Balance & address */}
        <HeaderSection>
          <TextSubTitle>
          ${(Number(balance) * price).toFixed(2)}
            <span
              onClick={handleRefresh}
              style={{
                margin: "0 5px",
                display: "inline-block",
                width: 12,
                height: 12,
                cursor: "pointer"
              }}
              title="Refresh Balance"
            >
              <RefreshIcon
                style={{
                  width: "100%",
                  height: "100%",
                  animation: isRefreshing ? "spin 1s linear" : undefined
                }}
              />
            </span>
            <span>
              {" "}
              <text style={{ fontSize: "10pt", color: colorGray }}>
              R5 {Number(balance).toFixed(6)}
                
              </text>
            </span>
          </TextSubTitle>
          <SmallText style={{ display: "flex", alignItems: "center" }}>
            <span>{wallet?.address ?? ""}</span>
          </SmallText>
        </HeaderSection>
        <HeaderSection style={{ width: "100%" }}>
          <HeaderButtonWrapper>
            <ButtonRound title="Export Wallet File" onClick={exportWalletFile}>
              <ExportIcon />
            </ButtonRound>
            {/*
            <ButtonRound
              title="Show Private Key"
              onClick={() => setShowConfirmPkModal(true)}
            >
              <PrivateKeyIcon />
            </ButtonRound>

            <ButtonRound
              title="Reset Wallet"
              onClick={() => setShowConfirmResetModal(true)}
            >
              <ResetIcon />
            </ButtonRound>

            <ButtonRound title="About" onClick={() => setShowInfo(true)}>
              <InfoIcon />
            </ButtonRound>
            */}
          </HeaderButtonWrapper>
        </HeaderSection>
      </BoxHeader>

      {/* Buttons */}
      <BoxHeader
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          zIndex: 2,
          background: colorSecondary,
          margin: 0,
          padding: 5,
          borderRadius: `${borderRadiusDefault} ${borderRadiusDefault} 0 0`
        }}
      >
        <HeaderSection
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%"
          }}
        >
          <HeaderButtonWrapper
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
            }}
          >
            <ButtonRound
              title="Receive Transaction"
              onClick={() => setShowReceiveQR(true)}
            >
              <ReceiveIcon />
            </ButtonRound>

            <ButtonRound
              title="Receive Transaction"
              onClick={() => setShowReceiveQR(true)}
            >
              <SendIcon />
            </ButtonRound>

            <ButtonRound title="Transaction History">
              <HistoryIcon />
            </ButtonRound>

            <ButtonRound title="Lock Wallet" onClick={handleLockWallet}>
              <LockIcon />
            </ButtonRound>
          </HeaderButtonWrapper>
        </HeaderSection>
      </BoxHeader>

      {/* Modals */}
      <ReceiveFunds
        open={showReceiveQR}
        onClose={() => setShowReceiveQR(false)}
        address={wallet?.address ?? ""}
      />
      <PrivateKey
        open={showPrivateKey}
        onClose={() => setShowPrivateKey(false)}
        privateKey={decryptedPrivateKey}
      />
      <About open={showInfo} onClose={() => setShowInfo(false)} />
    </>
  );
}
