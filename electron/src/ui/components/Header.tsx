import { useState, useEffect } from "react";
import { ethers, JsonRpcProvider, formatEther } from "ethers";
import {
  BoxHeader,
  HeaderSection,
  TextSubTitle,
  SmallText,
  ButtonRound,
  HeaderButtonWrapper
} from "../theme";
import { RpcUrl, ExplorerUrl } from "../constants";
import {
  GoArrowDownLeft,
  GoTrash,
  GoKey,
  GoHistory,
  GoUpload,
  GoInfo,
  GoSync,
  GoCopy,
  GoCheck
} from "react-icons/go";
import R5Logo from "../assets/logo_white-transparent.png";

import { ReceiveFunds } from "./ReceiveFunds";
import { PrivateKey } from "./PrivateKey";
import { About } from "./About";

const ReceiveIcon = GoArrowDownLeft;
const ResetIcon = GoTrash;
const PrivateKeyIcon = GoKey;
const HistoryIcon = GoHistory;
const ExportIcon = GoUpload;
const InfoIcon = GoInfo;
const RefreshIcon = GoSync;
const CopyIcon = GoCopy;
const CheckIcon = GoCheck;

export function Header({
  decryptedPrivateKey
}: {
  decryptedPrivateKey: string;
}) {
  const [balance, setBalance] = useState("0");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showReceiveQR, setShowReceiveQR] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const provider = new JsonRpcProvider(RpcUrl);
  let wallet: ethers.Wallet;
  try {
    wallet = new ethers.Wallet(decryptedPrivateKey, provider);
  } catch (e) {
    console.error("Invalid private key:", e);
    alert("Invalid private key. Please reset your wallet.");
    return null;
  }

  const updateBalance = () => {
    provider
      .getBalance(wallet.address)
      .then((wei) => setBalance(formatEther(wei)))
      .catch((err) => console.error("Failed to update balance:", err));
  };

  useEffect(() => {
    updateBalance();
    const interval = setInterval(updateBalance, 60000);
    return () => clearInterval(interval);
  }, [provider, wallet.address]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    updateBalance();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const openTxHistory = () => {
    const url = `${ExplorerUrl}/address/${wallet.address}`;
    (window as any).require("electron").shell.openExternal(url);
  };

  const exportWalletFile = () => {
    const raw = localStorage.getItem("walletInfo");
    if (!raw) return alert("No wallet to export.");
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${wallet.address}.key`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(wallet.address)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  return (
    <>
      <BoxHeader>
        <HeaderSection>
          <img src={R5Logo} width={64} height={64} />
        </HeaderSection>
        <HeaderSection>
          <TextSubTitle>
            R5 {balance}{" "}
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
            <span>{wallet.address}</span>
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
        <HeaderSection style={{ width: "100%" }}>
          <HeaderButtonWrapper>
            <ButtonRound
              title="Receive Transaction"
              onClick={() => setShowReceiveQR(true)}
            >
              <ReceiveIcon />
            </ButtonRound>
            <ButtonRound title="Transaction History" onClick={openTxHistory}>
              <HistoryIcon />
            </ButtonRound>
            <ButtonRound title="Export Wallet File" onClick={exportWalletFile}>
              <ExportIcon />
            </ButtonRound>
            <ButtonRound
              title="Show Private Key"
              onClick={() =>
                window.confirm("Expose private key? Make sure you are doing this on a safe environment.") && setShowPrivateKey(true)
              }
            >
              <PrivateKeyIcon />
            </ButtonRound>
            <ButtonRound
              title="Reset Wallet"
              onClick={() => {
                if (window.confirm("Reset wallet? This is irreversible.")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
            >
              <ResetIcon />
            </ButtonRound>
            <ButtonRound title="About" onClick={() => setShowInfo(true)}>
              <InfoIcon />
            </ButtonRound>
          </HeaderButtonWrapper>
        </HeaderSection>
      </BoxHeader>

      <ReceiveFunds
        open={showReceiveQR}
        onClose={() => setShowReceiveQR(false)}
        address={wallet.address}
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
