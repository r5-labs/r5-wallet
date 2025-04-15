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

import { BsQrCode } from "react-icons/bs";
import { BsTrash } from "react-icons/bs";
import { LuArrowUpRight } from "react-icons/lu";
import { CiLock } from "react-icons/ci";

import R5Logo from "../assets/logo_white-transparent.png";

const ReceiveIcon = BsQrCode as React.FC<React.PropsWithChildren>;
const SendIcon = LuArrowUpRight as React.FC<React.PropsWithChildren>;
const ResetIcon = BsTrash as React.FC<React.PropsWithChildren>;
const PrivateKeyIcon = CiLock as React.FC<React.PropsWithChildren>;

export function Header(): any {
  const [balance, setBalance] = useState("0");
  const walletInfo = JSON.parse(localStorage.getItem("walletInfo") || "{}");

  const provider = new JsonRpcProvider("https://rpc.r5.network/");
  let wallet;

  try {
    if (!walletInfo.privateKey || !ethers.isHexString(walletInfo.privateKey, 32)) {
      throw new Error("Invalid private key format.");
    }
    wallet = new ethers.Wallet(walletInfo.privateKey, provider);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to create wallet:", error.message);
    } else {
      console.error("Failed to create wallet:", error);
    }
    alert("Invalid private key. Please reset your wallet.");
    return null; // Prevent rendering if the wallet is invalid
  }

  const fetchBalance = async () => {
    try {
      const balanceWei = await provider.getBalance(wallet.address);
      setBalance(formatEther(balanceWei));
    } catch (error) {
      console.error(error);
      alert("Failed to fetch balance.");
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

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
          <SmallText>{walletInfo.address}</SmallText>
        </HeaderSection>
        <HeaderSection style={{ width: "100%" }}>
          <HeaderButtonWrapper>
            <ButtonRound title="Send Transaction">
              <SendIcon />
            </ButtonRound>
            <ButtonRound title="Receive Transaction">
              <ReceiveIcon />
            </ButtonRound>
            <ButtonRound title="Reset Wallet">
              <ResetIcon />
            </ButtonRound>
            <ButtonRound title="Show Private Key">
              <PrivateKeyIcon />
            </ButtonRound>
          </HeaderButtonWrapper>
        </HeaderSection>
      </BoxHeader>
    </>
  );
}
