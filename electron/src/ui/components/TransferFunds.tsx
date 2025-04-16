import { JSX, useState } from "react";
import {
  ethers,
  JsonRpcProvider,
  parseEther,
  parseUnits,
  formatUnits,
  formatEther
} from "ethers";
import {
  BoxSection,
  BoxContent,
  ButtonPrimary,
  ButtonSecondary,
  Input,
  TextSubTitle,
  Text,
  colorLightGray,
  colorGlassBackgroundBlur,
  colorSemiBlack,
  colorGlassBackgroundModal,
  borderRadiusDefault,
  SmallText,
  colorSecondary,
  colorGray
} from "../theme";
import { LuArrowUpRight } from "react-icons/lu";
import { RpcUrl, ExplorerUrl } from "../constants";

const SendIcon = LuArrowUpRight as React.FC<React.PropsWithChildren>;

export function TransferFunds({
  decryptedPrivateKey
}: {
  decryptedPrivateKey: string;
}): JSX.Element | null {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [gasPrice, setGasPrice] = useState("");
  const [maxGas, setMaxGas] = useState("");
  const [defaultGasPrice, setDefaultGasPrice] = useState("");
  const [defaultMaxGas, setDefaultMaxGas] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalMessage, setResultModalMessage] = useState("");
  const [txHash, setTxHash] = useState("");

  const provider = new JsonRpcProvider(RpcUrl);
  let wallet;
  try {
    wallet = new ethers.Wallet(decryptedPrivateKey, provider);
  } catch (error) {
    console.error("Failed to create wallet:", error);
    alert("Invalid private key. Please reset your wallet.");
    return null;
  }

  // Calculate default gas parameters using ethers v6 API
  const calculateDefaultGas = async (): Promise<{
    gasPrice: string;
    maxGas: string;
  } | null> => {
    if (!recipient || !amount) {
      alert(
        "Please fill in both the recipient and amount fields for gas calculation."
      );
      return null;
    }
    try {
      // Use provider.getFeeData() instead of getGasPrice()
      const feeData = await provider.getFeeData();
      const gasPriceBN = feeData.gasPrice;
      if (gasPriceBN === null) {
        throw new Error("Gas price is null");
      }
      const estimatedGasLimit = await wallet.estimateGas({
        to: recipient,
        value: parseEther(amount)
      });
      const gasPriceGwei = formatUnits(gasPriceBN, "gwei");
      const estimatedGasStr = estimatedGasLimit.toString();
      setDefaultGasPrice(gasPriceGwei);
      setDefaultMaxGas(estimatedGasStr);
      setGasPrice(gasPriceGwei);
      setMaxGas(estimatedGasStr);
      return { gasPrice: gasPriceGwei, maxGas: estimatedGasStr };
    } catch (error) {
      console.error("Gas calculation failed:", error);
      alert("Failed to calculate gas parameters.");
      return null;
    }
  };

  // Compute the approximate fee in R5 using native bigint
  const calculateFee = () => {
    try {
      if (!gasPrice || !maxGas) return "0";
      const fee = parseUnits(gasPrice, "gwei") * BigInt(maxGas);
      return formatEther(fee);
    } catch (error) {
      return "0";
    }
  };

  // Handle clicking the "Send Transaction" button
  const handleSendCoins = async () => {
    if (!recipient || !amount) {
      alert("Please fill in all required fields before trying to send your transaction.");
      return;
    }
    let effectiveGasPrice = gasPrice;
    let effectiveMaxGas = maxGas;
    // Automatically calculate gas parameters if empty.
    if (!gasPrice || !maxGas) {
      const gasParams = await calculateDefaultGas();
      if (!gasParams) return;
      effectiveGasPrice = gasParams.gasPrice;
      effectiveMaxGas = gasParams.maxGas;
      // Force update the state so that confirmAndSend uses the calculated values.
      setGasPrice(effectiveGasPrice);
      setMaxGas(effectiveMaxGas);
    }
    // If gas parameters have been modified, confirm with the user.
    if (
      defaultGasPrice &&
      defaultMaxGas &&
      (effectiveGasPrice !== defaultGasPrice ||
        effectiveMaxGas !== defaultMaxGas)
    ) {
      const overrideConfirm = confirm(
        "You are sending this transaction with your own gas parameters. Please make sure you know what you are doing, otherwise the transaction may fail. Do you want to proceed?"
      );
      if (!overrideConfirm) {
        return;
      }
    }
    // Show a transaction confirmation modal.
    setShowConfirmModal(true);
  };

  const resetForm = () => {
    setRecipient("");
    setAmount("");
    setGasPrice("");
    setMaxGas("");
    setDefaultGasPrice("");
    setDefaultMaxGas("");
  };

  const confirmAndSend = async () => {
    setShowConfirmModal(false);
    setIsSending(true);
    try {
      // Send the transaction and immediately reset the form fields
      const tx = await wallet.sendTransaction({
        to: recipient,
        value: parseEther(amount),
        gasPrice: parseUnits(gasPrice, "gwei"),
        gasLimit: BigInt(maxGas)
      });
      resetForm();
      // Wait for transaction confirmation and update state accordingly
      await tx.wait();
      setTxHash(tx.hash);
      setResultModalMessage(
        `Transaction successful! Your receipt hash is ${tx.hash}.`
      );
    } catch (error: any) {
      console.error("Transaction failed:", error);
      setResultModalMessage(`Transaction failed: ${error.message}`);
    } finally {
      setIsSending(false);
      setShowResultModal(true);
    }
  };

  const openTxHash = () => {
    const url = `${ExplorerUrl}/tx/${txHash}`;
    const shell = (window as any).require("electron").shell;
    shell.openExternal(url);
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
            placeholder="Enter public address, starting with 0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            style={{ minWidth: "40ch", width: "100%" }}
          />
          <Text style={{ marginLeft: "15px" }}>R5 Amount</Text>
          <Input
            type="number"
            placeholder="Enter the amount to send..."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ minWidth: "40ch", width: "100%" }}
          />
          {/* Gas Parameter Inputs */}
          <BoxSection style={{ gap: "10px", alignItems: "center" }}>
            <BoxContent
              style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
            >
              <div style={{ flex: 1 }}>
                <Text style={{ marginLeft: "15px" }}>Gas Price (Gwei)</Text>
                <Input
                  type="number"
                  value={gasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                  style={{ width: "100%" }}
                  placeholder="Custom gas price..."
                />
              </div>
              <div style={{ flex: 1 }}>
                <Text style={{ marginLeft: "15px" }}>Max Gas</Text>
                <Input
                  type="number"
                  value={maxGas}
                  onChange={(e) => setMaxGas(e.target.value)}
                  style={{ width: "100%" }}
                  placeholder="Custom gas limit..."
                />
              </div>
            </BoxContent>
            <SmallText>
              * Leave the gas parameters empty if you want it to be calculated
              automatically.
            </SmallText>
            <ButtonSecondary onClick={calculateDefaultGas}>
              Reset Gas Calculation
            </ButtonSecondary>
          </BoxSection>
          <ButtonPrimary
  onClick={handleSendCoins}
  style={{
    width: "100%",
    backgroundColor: isSending ? colorGray : undefined,
    cursor: isSending ? "default" : undefined,
    pointerEvents: isSending ? "none" : undefined,
  }}
  disabled={isSending}
>
  {isSending ? <span>Sending Transaction...</span> : "Send Transaction"}
</ButtonPrimary>
        </BoxSection>
      </BoxSection>

      {/* Confirmation Modal */}
      {showConfirmModal && (
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
              background: colorGlassBackgroundBlur,
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)",
              borderRadius: borderRadiusDefault,
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
              borderRadius: borderRadiusDefault,
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              background: colorGlassBackgroundModal,
              textAlign: "center"
            }}
          >
            <h3 style={{ marginBottom: "-10px", color: colorSemiBlack }}>
              Confirm Transaction
            </h3>
            <Text style={{ color: colorSemiBlack }}>
              Do you confirm sending <b>{amount} R5</b> to <b>{recipient}</b>?
              This transaction will cost you approximately{" "}
              <b>{calculateFee()} R5</b>.
            </Text>
            <BoxContent>
              <ButtonPrimary onClick={() => setShowConfirmModal(false)}>
                Cancel
              </ButtonPrimary>
              <ButtonPrimary onClick={confirmAndSend}>Proceed</ButtonPrimary>
            </BoxContent>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
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
              background: colorGlassBackgroundBlur,
              backdropFilter: "blur(5px)",
              WebkitBackdropFilter: "blur(5px)",
              borderRadius: borderRadiusDefault,
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
              borderRadius: borderRadiusDefault,
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              background: colorGlassBackgroundModal,
              textAlign: "center"
            }}
          >
            <h3 style={{ marginBottom: "-10px", color: colorSemiBlack }}>
              Your Transaction Information
            </h3>
            <Text style={{ color: colorSemiBlack }}>{resultModalMessage}</Text>
            {txHash && (
              <Text
                style={{ color: colorSecondary, cursor: "pointer" }}
                onClick={openTxHash}
              >
                View Transaction on Explorer
              </Text>
            )}
            <ButtonPrimary onClick={() => setShowResultModal(false)}>
              Close
            </ButtonPrimary>
          </div>
        </div>
      )}
    </>
  );
}
