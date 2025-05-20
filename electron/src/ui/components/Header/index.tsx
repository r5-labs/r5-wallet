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
  BoxContent,
  HorMenuOption,
  BoxContentParent,
  colorGlassBackgroundModal
} from "../../theme";
import {
  GoArrowDownLeft,
  GoTrash,
  GoKey,
  GoSearch,
  GoUpload,
  GoInfo,
  GoSync,
  GoCopy,
  GoCheck,
  GoLock,
  GoGear
} from "react-icons/go";
import { LuNetwork } from "react-icons/lu";
import R5Logo from "../../assets/logo_white-transparent.png";

import { ReceiveFunds } from "../ReceiveFunds";
import { PrivateKey } from "../PrivateKey";
import { About } from "../About";
import { Modal } from "../Modal";
import Toggle from "../Toggle";
import { useWeb3Context } from "../../contexts/Web3Context";
import usePrice from "../../hooks/usePrice";

/* Icon aliases for readability */
const ReceiveIcon = GoArrowDownLeft;
const ResetIcon = GoTrash;
const PrivateKeyIcon = GoKey;
const HistoryIcon = GoSearch;
const ExportIcon = GoUpload;
const InfoIcon = GoInfo;
const RefreshIcon = GoSync;
const CopyIcon = GoCopy;
const CheckIcon = GoCheck;
const LockIcon = GoLock;
const SettingsIcon = GoGear;
const NetworkIcon = LuNetwork;

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
  const [showSettingsModal, setShowSettingsModal] = useState(false);

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
        .then((wei) => setBalance(formatEther(wei)))
        .catch((err) => console.error("Failed to update balance:", err));
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
      {/* Settings dialog */}
      <Modal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      >
        <BoxContentParent style={{ marginTop: 10 }}>

        <HorMenuOption style={{ background: colorGlassBackgroundModal }}>
        <BoxContent style={{ width: "auto" }}>
            <NetworkIcon />
          </BoxContent>
        <BoxContent
            style={{
              width: "100%",
              justifyContent: "flex-start",
              marginLeft: 10
            }}
          >
            Network
          </BoxContent>
        <BoxContent>
        <Toggle />
        </BoxContent>
        </HorMenuOption>

        <HorMenuOption onClick={exportWalletFile}>
          <BoxContent style={{ width: "auto" }}>
            <ExportIcon />
          </BoxContent>
          <BoxContent
            style={{
              width: "100%",
              justifyContent: "flex-start",
              marginLeft: 10
            }}
          >
            Export Wallet File
          </BoxContent>
        </HorMenuOption>
        
        <HorMenuOption onClick={() => setShowConfirmPkModal(true)}>
          <BoxContent style={{ width: "auto" }}>
            <PrivateKeyIcon />
          </BoxContent>
          <BoxContent
            style={{
              width: "100%",
              justifyContent: "flex-start",
              marginLeft: 10
            }}
          >
            Show Private Key
          </BoxContent>
        </HorMenuOption>

        <HorMenuOption onClick={() => setShowConfirmResetModal(true)}>
          <BoxContent style={{ width: "auto" }}>
            <ResetIcon />
          </BoxContent>
          <BoxContent
            style={{
              width: "100%",
              justifyContent: "flex-start",
              marginLeft: 10
            }}
          >
            Reset Wallet
          </BoxContent>
        </HorMenuOption>

        <HorMenuOption onClick={() => setShowInfo(true)}>
          <BoxContent style={{ width: "auto" }}>
            <InfoIcon />
          </BoxContent>
          <BoxContent
            style={{
              width: "100%",
              justifyContent: "flex-start",
              marginLeft: 10
            }}
          >
            About
          </BoxContent>
        </HorMenuOption>

        <HorMenuOption onClick={handleLockWallet}>
          <BoxContent style={{ width: "auto" }}>
            <LockIcon />
          </BoxContent>
          <BoxContent
            style={{
              width: "100%",
              justifyContent: "flex-start",
              marginLeft: 10
            }}
          >
            Logout
          </BoxContent>
        </HorMenuOption>

        </BoxContentParent>

        <ButtonSecondary onClick={() => setShowSettingsModal(false)}>
          Close
        </ButtonSecondary>
      </Modal>

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
        <HeaderSection>
          <img src={R5Logo} width={64} height={64} />
        </HeaderSection>

        {/* Balance & address */}
        <HeaderSection>
          <TextSubTitle>
            ${(Number(balance) * price).toFixed(2)}
            <span>
              {" "}
              <text style={{ fontSize: "10pt", color: colorGray }}>
                R5 {Number(balance).toFixed(6)}
              </text>
            </span>
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
          </TextSubTitle>
          <SmallText style={{ display: "flex", alignItems: "center" }}>
            <span>{wallet?.address ?? ""}</span>
            <span
              onClick={handleCopy}
              title="Copy Address"
              style={{ marginLeft: 5, cursor: "pointer" }}
            >
              {isCopied ? (
                <CheckIcon style={{ width: 12, height: 12 }} />
              ) : (
                <CopyIcon style={{ width: 12, height: 12 }} />
              )}
            </span>
          </SmallText>
        </HeaderSection>

        <HeaderSection
          style={{ width: "100%", margin: "auto", alignItems: "center" }}
        >

        </HeaderSection>

        {/* Buttons */}
        <HeaderSection style={{ width: "auto" }}>
          <HeaderButtonWrapper>
            <ButtonRound
              title="Receive Transaction"
              onClick={() => setShowReceiveQR(true)}
            >
              <ReceiveIcon />
            </ButtonRound>

            <ButtonRound
              title="Transaction History"
              onClick={() => {
                window.electron.openExternal(
                  `${explorerUrl}/address/${wallet?.address ?? ""}`
                );
              }}
            >
              <HistoryIcon />
            </ButtonRound>

            <ButtonRound
              title="More Options"
              onClick={() => setShowSettingsModal(true)}
            >
              <SettingsIcon />
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
