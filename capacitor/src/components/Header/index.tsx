import { useState, useEffect, useMemo } from "react";
import { ethers, formatEther } from "ethers";
import {
  BoxHeader,
  HeaderSection,
  TextSubTitle,
  ButtonRound,
  HeaderButtonWrapper,
  colorGray,
  borderRadiusDefault,
  colorSecondary
} from "../../theme";
import {
  GoArrowDownLeft,
  GoArrowUpRight,
  GoSync,
  GoSearch,
  GoGear
} from "react-icons/go";
import R5Logo from "../../assets/logo_white-transparent.png";

import { ReceiveFunds } from "../ReceiveFunds";
import { TransferModal } from "../TransferFunds/TransferModal";
import { MoreOptions } from "../MoreOptions";
import { useWeb3Context } from "../../contexts/Web3Context";
import usePrice from "../../hooks/usePrice";

/* Icon aliases for readability */
const ReceiveIcon = GoArrowDownLeft as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const SendIcon = GoArrowUpRight as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const RefreshIcon = GoSync as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const ExplorerIcon = GoSearch as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;
const ConfigIcon = GoGear as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

export function Header({
  decryptedPrivateKey
}: {
  decryptedPrivateKey: string;
}) {
  /* ------------------------------------------------------------------ */
  /* State                                                               */
  /* ------------------------------------------------------------------ */
  const [balance, setBalance] = useState("0");
  const [showReceiveQR, setShowReceiveQR] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

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

  return (
    <>
      <BoxHeader style={{ margin: "30px auto 15px auto" }}>
        {/* Logo */}
        <HeaderSection style={{ margin: -2 }}>
          <img src={R5Logo} width={64} height={64} />
        </HeaderSection>

        {/* Balance & address */}
        <HeaderSection style={{ width: "100%" }}>
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
            <div style={{ marginTop: "-10px" }}>
              {" "}
              <text style={{ fontSize: "10pt", color: colorGray }}>
                R5 {Number(balance).toFixed(6)}
              </text>
            </div>
          </TextSubTitle>
        </HeaderSection>
        <HeaderSection style={{ marginRight: 5 }}>
          <HeaderButtonWrapper>
            <ButtonRound
              title="More Options"
              onClick={() => setShowMoreOptions(true)}
            >
              <ConfigIcon />
            </ButtonRound>
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
          padding: "20px 5px",
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
              justifyContent: "center"
            }}
          >
            <ButtonRound
              title="Receive Transaction"
              onClick={() => setShowReceiveQR(true)}
            >
              <ReceiveIcon />
            </ButtonRound>

            <a href={explorerUrl + `/address/` + wallet?.address} target="_blank">
            <ButtonRound
              title="Inspect on Explorer"
              >
              <ExplorerIcon />
            </ButtonRound>
            </a>

            <ButtonRound
              title="Send Transaction"
              onClick={() => setShowSend(true)}
            >
              <SendIcon />
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
      <MoreOptions
        open={showMoreOptions}
        onClose={() => setShowMoreOptions(false)}
        decryptedPrivateKey={decryptedPrivateKey}
      />
      <TransferModal
        open={showSend}
        onClose={() => setShowSend(false)}
        decryptedPrivateKey={decryptedPrivateKey}
      />
    </>
  );
}
