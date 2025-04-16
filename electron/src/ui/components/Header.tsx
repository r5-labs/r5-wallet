import { useState, useEffect, JSX } from "react";
import { ethers, JsonRpcProvider, formatEther } from "ethers";
import {
  BoxHeader,
  HeaderSection,
  TextSubTitle,
  SmallText,
  ButtonRound,
  HeaderButtonWrapper,
  colorGlassBackgroundModal,
  colorWhite,
  borderRadiusDefault,
  colorBlack,
  ButtonPrimary,
  Text,
  colorSemiBlack,
  colorGlassBackground,
  paddingHigh,
} from "../theme";
import {
  RpcUrl,
  ExplorerUrl,
  AppName,
  AppDescription,
  AppVersion,
  HelpUrl
} from "../constants";

import {
  GoArrowDownLeft,
  GoTrash,
  GoArrowUpRight,
  GoKey,
  GoHistory,
  GoUpload,
  GoInfo
} from "react-icons/go";

import R5Logo from "../assets/logo_white-transparent.png";

import { QRCodeCanvas } from "qrcode.react";

const ReceiveIcon = GoArrowDownLeft as React.FC<React.PropsWithChildren>;
const SendIcon = GoArrowUpRight as React.FC<React.PropsWithChildren>;
const ResetIcon = GoTrash as React.FC<React.PropsWithChildren>;
const PrivateKeyIcon = GoKey as React.FC<React.PropsWithChildren>;
const HistoryIcon = GoHistory as React.FC<React.PropsWithChildren>;
const ExportIcon = GoUpload as React.FC<React.PropsWithChildren>;
const InfoIcon = GoInfo as React.FC<React.PropsWithChildren>;

export function Header({
  decryptedPrivateKey
}: {
  decryptedPrivateKey: string;
}): JSX.Element | null {
  const [balance, setBalance] = useState("0");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showReceiveQR, setShowReceiveQR] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const provider = new JsonRpcProvider(RpcUrl);
  let wallet: ethers.Wallet;
  try {
    wallet = new ethers.Wallet(decryptedPrivateKey, provider);
  } catch (e) {
    console.error("Invalid private key:", e);
    alert("Invalid private key. Please reset your wallet.");
    return null;
  }

  useEffect(() => {
    provider
      .getBalance(wallet.address)
      .then((wei) => {
        setBalance(formatEther(wei));
      })
      .catch((err) => {
        console.error("Failed to fetch balance:", err);
      });
  }, [provider, wallet.address]);

  const openTxHistory = () => {
    const url = `${ExplorerUrl}/address/${wallet.address}`;
    const shell = (window as any).require("electron").shell;
    shell.openExternal(url);
  };

  const openHelp = () => {
    const url = `${HelpUrl}`;
    const shell = (window as any).require("electron").shell;
    shell.openExternal(url);
  };

  const exportWalletFile = () => {
    const raw = localStorage.getItem("walletInfo");
    if (!raw) {
      alert("No wallet to export.");
      return;
    }
    // create a blob and force download
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

  return (
    <>
      <BoxHeader>
        <HeaderSection>
          <img src={R5Logo} width={64} height={64} />
        </HeaderSection>
        <HeaderSection>
          <TextSubTitle>
            R5 {balance}{" "}
            <span style={{ fontSize: "10pt", fontWeight: "300" }}>$0.00</span>
          </TextSubTitle>
          <SmallText>{wallet.address}</SmallText>
        </HeaderSection>
        <HeaderSection style={{ width: "100%" }}>
          <HeaderButtonWrapper>
            <ButtonRound title="Send Transaction">
              <SendIcon />
            </ButtonRound>
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
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to expose your private key? This can be a security risk."
                  )
                ) {
                  setShowPrivateKey(true);
                }
              }}
            >
              <PrivateKeyIcon />
            </ButtonRound>

            <ButtonRound
              title="Reset Wallet"
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to reset the wallet? This action cannot be undone. You can make a backup of your current wallet by 'Exporting a Wallet File' before resetting it."
                  )
                ) {
                  if (
                    confirm(
                      "Do you really want to reset your wallet? This may result in PERMANENT loss of access and funds to your existing wallet! Please make sure you have backed up your Private Key and/or your Wallet File."
                    )
                  ) {
                    localStorage.clear();
                    window.location.reload();
                  }
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

      {showPrivateKey && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: colorGlassBackground,
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)",
              borderRadius: "10px",
              zIndex: -1
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              background: colorGlassBackgroundModal,
              textAlign: "center"
            }}
          >
            <h3 style={{ marginBottom: "-10px", color: colorSemiBlack }}>
              Your Private Key
            </h3>
            <Text style={{ marginBottom: "10px", color: colorSemiBlack }}>
              <b>Anyone with your private key can control your wallet.</b> Store
              it in a safe place.
            </Text>
            <Text
              style={{
                wordWrap: "break-word",
                background: colorWhite,
                padding: "10px 15px",
                borderRadius: borderRadiusDefault,
                fontFamily: "monospace",
                fontWeight: "light",
                color: colorBlack
              }}
            >
              {decryptedPrivateKey}
            </Text>
            <ButtonPrimary onClick={() => setShowPrivateKey(false)}>
              Close
            </ButtonPrimary>
          </div>
        </div>
      )}

      {showReceiveQR && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: colorGlassBackground,
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)",
              borderRadius: "10px",
              zIndex: -1
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              background: colorGlassBackgroundModal,
              textAlign: "center"
            }}
          >
            <h3 style={{ marginBottom: "-10px", color: colorSemiBlack }}>
              Receive Funds
            </h3>
            <Text style={{ marginBottom: "10px", color: colorSemiBlack }}>
              You can use the QR code below or copy your wallet address.
            </Text>
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                margin: "auto",
                alignItems: "center",
                justifyItems: "center",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  background: colorWhite,
                  width: `calc(200px + ${paddingHigh} + ${paddingHigh})`,
                  padding: "20px 20px 10px 20px",
                  borderRadius: borderRadiusDefault
                }}
              >
                <QRCodeCanvas value={wallet.address} size={200} />
              </div>
            </div>

            <Text
              style={{
                marginTop: "10px",
                color: colorSemiBlack,
                wordBreak: "break-all"
              }}
            >
              {wallet.address}
            </Text>
            <ButtonPrimary onClick={() => setShowReceiveQR(false)}>
              Close
            </ButtonPrimary>
          </div>
        </div>
      )}

      {showInfo && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: colorGlassBackground,
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)",
              borderRadius: "10px",
              zIndex: -1
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              background: colorGlassBackgroundModal,
              textAlign: "center"
            }}
          >
            <h3 style={{ marginBottom: "-10px", color: colorSemiBlack }}>
              {AppName}
            </h3>
            <Text style={{ marginBottom: "10px", color: colorSemiBlack }}>
              {AppDescription}
            </Text>
            <Text style={{ marginBottom: "10px", color: colorSemiBlack }}>
              <b>Version:</b> {AppVersion}
            </Text>
            <ButtonPrimary onClick={openHelp}>Help & Support</ButtonPrimary>
            <ButtonPrimary onClick={() => setShowInfo(false)}>
              Close
            </ButtonPrimary>
          </div>
        </div>
      )}
    </>
  );
}
