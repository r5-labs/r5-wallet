import { useState } from "react";
import { ethers, JsonRpcProvider, parseEther } from "ethers";
import CryptoJS from "crypto-js";
import {
  BoxSection,
  ButtonPrimary,
  Input,
  TextSubTitle,
  Text,
  colorLightGray
} from "../theme";

import { LuArrowUpRight } from "react-icons/lu";

const SendIcon = LuArrowUpRight as React.FC<React.PropsWithChildren>;

export function TransferFunds(): any {
  const walletInfo = JSON.parse(localStorage.getItem("walletInfo") || "{}");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const provider = new JsonRpcProvider("https://rpc.r5.network/");
  let wallet;

  try {
    console.log("Wallet Info from localStorage:", walletInfo);
    console.log("Encrypted Private Key:", walletInfo.encryptedPrivateKey);
    console.log("Password used for decryption:", walletInfo.password || "");

    if (!walletInfo.privateKey) {
      const decryptedPrivateKey = CryptoJS.AES.decrypt(
        walletInfo.encryptedPrivateKey,
        walletInfo.password || "" // Ensure password is provided
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

  const handleSendCoins = async () => {
    if (!recipient || !amount) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const tx = await wallet.sendTransaction({
        to: recipient,
        value: parseEther(amount)
      });
      await tx.wait();
      alert(`Transaction successful! Hash: ${tx.hash}`);
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please try again.");
    }
  };

  return (
    <>
      <BoxSection style={{ gap: "5px" }}>
        <SendIcon />
        <TextSubTitle>Send Transaction</TextSubTitle>
        <Text style={{ margin: "auto", color: colorLightGray }}>
          Check the address and amount before confirming your transaction.
        </Text>
        <BoxSection style={{ gap: "10px", alignItems: "flex-start" }}>
          <Text style={{ marginLeft: "15px" }}>To</Text>
          <Input
            type="text"
            placeholder="Enter public addres, starting with 0x"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            style={{ minWidth: "40ch" }}
          />
          <Text style={{ marginLeft: "15px" }}>R5 Amount</Text>
          <Input
            type="number"
            placeholder="Enter the amount to send"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ minWidth: "40ch" }}
          />
          <ButtonPrimary onClick={handleSendCoins} style={{ width: "100%" }}>
            Send Transaction
          </ButtonPrimary>
        </BoxSection>
      </BoxSection>
    </>
  );
}
