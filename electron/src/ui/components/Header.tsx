import { useState, useEffect } from "react";
import { ethers, JsonRpcProvider, formatEther } from "ethers";
import {
  BoxHeader,
  HeaderSection,
  TextSubTitle,
  SmallText,
  ButtonRound,
  HeaderButtonWrapper,
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

export function Header({ decryptedPrivateKey }: { decryptedPrivateKey: string }): any {
  const [balance, setBalance] = useState("0");
  const [showPrivateKey, setShowPrivateKey] = useState(false); // State to toggle private key display

  const provider = new JsonRpcProvider("https://rpc.r5.network/");
  let wallet;

  try {
    wallet = new ethers.Wallet(decryptedPrivateKey, provider);
  } catch (error) {
    console.error("Failed to create wallet:", error);
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
          <SmallText>{wallet.address}</SmallText>
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
                if (
                  confirm(
                    "Are you sure you want to reset the wallet? This action cannot be undone."
                  )
                ) {
                  localStorage.clear(); // Clear all local storage
                  window.location.reload(); // Reload the app to reset state
                }
              }}
            >
              <ResetIcon />
            </ButtonRound>
            <ButtonRound
              title="Show Private Key"
              onClick={() => setShowPrivateKey(true)} // Show private key pop-up
            >
              <PrivateKeyIcon />
            </ButtonRound>
          </HeaderButtonWrapper>
        </HeaderSection>
      </BoxHeader>

      {/* Pop-up for displaying private key */}
      {showPrivateKey && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            textAlign: "center", // Ensure text is centered
          }}
        >
          <h3 style={{ marginBottom: "10px", color: "#333" }}>Your Private Key</h3>
          <p
            style={{
              wordWrap: "break-word",
              background: "#f9f9f9",
              padding: "10px",
              borderRadius: "5px",
              fontFamily: "monospace",
              color: "black",
            }}
          >
            {decryptedPrivateKey}
          </p>
          <button
            onClick={() => setShowPrivateKey(false)}
            style={{
              marginTop: "10px",
              padding: "10px 15px",
              borderRadius: "5px",
              background: "#459381",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
}
