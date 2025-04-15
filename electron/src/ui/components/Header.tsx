import { useState, useEffect } from "react";
import { ethers, JsonRpcProvider, formatEther } from "ethers";
import CryptoJS from "crypto-js";
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

  if (!walletInfo.password) {
    walletInfo.password = prompt("Please enter your wallet password:") || "";
    if (!walletInfo.password) {
      alert("Password is required to decrypt the wallet.");
      return null; // Prevent rendering if password is missing
    }
  }

  try {
    console.log("Wallet Info from localStorage:", walletInfo);
    console.log("Encrypted Private Key:", walletInfo.encryptedPrivateKey);
    console.log("Password used for decryption:", walletInfo.password);

    if (!walletInfo.privateKey) {
      const decryptedPrivateKey = CryptoJS.AES.decrypt(
        walletInfo.encryptedPrivateKey,
        walletInfo.password
      ).toString(CryptoJS.enc.Utf8);

      console.log("Decrypted Private Key:", decryptedPrivateKey);

      if (!decryptedPrivateKey || !/^0x[0-9a-fA-F]{64}$/.test(decryptedPrivateKey)) {
        throw new Error("Invalid private key format.");
      }
      walletInfo.privateKey = decryptedPrivateKey;
      localStorage.setItem("walletInfo", JSON.stringify(walletInfo));
    }
    wallet = new ethers.Wallet(walletInfo.privateKey, provider);
    console.log("Wallet successfully created:", wallet);
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
      console.error("Failed to fetch balance:", error);
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
            <ButtonRound
              title="Reset Wallet"
              onClick={() => {
                if (confirm("Are you sure you want to reset the wallet? This action cannot be undone.")) {
                  localStorage.clear(); // Clear all local storage
                  window.location.reload(); // Reload the app to reset state
                }
              }}
            >
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
