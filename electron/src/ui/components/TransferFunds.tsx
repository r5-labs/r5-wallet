// components/TransferFunds.tsx
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
  SmallText
} from "../theme";
import { LuArrowUpRight } from "react-icons/lu";
import { RpcUrl } from "../constants";
import { TxConfirm } from "./TxConfirm";
import { FullPageLoader } from "./FullPageLoader";
import { TxProcess } from "./TxProcess";
import { useTxLifecycle } from "../hooks/useTxLifecycle";

const SendIcon = LuArrowUpRight;

export function TransferFunds({
  decryptedPrivateKey
}: {
  decryptedPrivateKey: string;
}): JSX.Element | null {
  /* Form state */
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [gasPrice, setGasPrice] = useState("");
  const [maxGas, setMaxGas] = useState("");
  const [defaultGasPrice, setDefaultGasPrice] = useState("");
  const [defaultMaxGas, setDefaultMaxGas] = useState("");

  /* Modal flags */
  const [loadingModal, setLoadingModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processOpen, setProcessOpen] = useState(false);

  /* RPC */
  const provider = new JsonRpcProvider(RpcUrl);
  let wallet: ethers.Wallet;
  try {
    wallet = new ethers.Wallet(decryptedPrivateKey, provider);
  } catch (err) {
    console.error("Failed to create wallet:", err);
    alert("Invalid private key. Please reset your wallet.");
    return null;
  }

  /* Tx lifecycle */
  const {
    stageIndex,
    success,
    error,
    txHash,
    sendTx,
    reset: resetLifecycle
  } = useTxLifecycle(provider);

  /* Helpers */
  const calculateDefaultGas = async () => {
    if (!recipient || !amount) {
      alert("Enter recipient and amount to calculate gas.");
      return null;
    }
    try {
      const feeData = await provider.getFeeData();
      if (!feeData.gasPrice) throw new Error("Gas price unavailable");
      const estimatedGas = await wallet.estimateGas({
        to: recipient,
        value: parseEther(amount)
      });
      const gp = formatUnits(feeData.gasPrice, "gwei");
      const gl = estimatedGas.toString();
      setDefaultGasPrice(gp);
      setDefaultMaxGas(gl);
      setGasPrice(gp);
      setMaxGas(gl);
      return { gasPrice: gp, maxGas: gl };
    } catch (err) {
      console.error("Gas calc failed:", err);
      alert("Failed to calculate gas.");
      return null;
    }
  };

  const calculateFee = () => {
    if (!gasPrice || !maxGas) return "0";
    try {
      const feeWei = parseUnits(gasPrice, "gwei") * BigInt(maxGas);
      return formatEther(feeWei);
    } catch {
      return "0";
    }
  };

  /* Actions */
  const handleSendCoins = async () => {
    if (!recipient || !amount) {
      alert("Please fill recipient and amount.");
      return;
    }
    const gasParams = await calculateDefaultGas();
    if (!gasParams) return;

    setLoadingModal(true);
    setTimeout(() => {
      setLoadingModal(false);
      setShowConfirmModal(true);
    }, 300);
  };

  const confirmAndSend = async () => {
    setShowConfirmModal(false);
    setProcessOpen(true);

    await sendTx(() =>
      wallet.sendTransaction({
        to: recipient,
        value: parseEther(amount),
        gasPrice: parseUnits(gasPrice || defaultGasPrice, "gwei"),
        gasLimit: BigInt(maxGas || defaultMaxGas)
      })
    );
  };

  /* ← UPDATED: resets inputs + tx lifecycle */
  const closeProcess = () => {
    setProcessOpen(false);
    resetLifecycle(); // clear TxProcess state

    /* clear form inputs & gas defaults */
    setRecipient("");
    setAmount("");
    setGasPrice("");
    setMaxGas("");
    setDefaultGasPrice("");
    setDefaultMaxGas("");
  };

  /* Render */
  return (
    <>
      <BoxSection style={{ gap: "5px" }}>
        <SendIcon />
        <TextSubTitle>Send Transaction</TextSubTitle>
        <Text style={{ margin: "auto", color: colorLightGray }}>
          Double‑check the address and amount before confirming your
          transaction.
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

          <BoxSection style={{ gap: "10px", alignItems: "center" }}>
            <BoxContent style={{ gap: "10px", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <Text>Gas Price (Gwei)</Text>
                <Input
                  type="number"
                  value={gasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                  style={{ width: "100%" }}
                  placeholder="auto"
                />
              </div>
              <div style={{ flex: 1 }}>
                <Text>Max Gas</Text>
                <Input
                  type="number"
                  value={maxGas}
                  onChange={(e) => setMaxGas(e.target.value)}
                  style={{ width: "100%" }}
                  placeholder="auto"
                />
              </div>
            </BoxContent>
            <SmallText>
              * Leave blank to calculate the gas parameters automatically.
            </SmallText>
            <ButtonSecondary onClick={calculateDefaultGas}>
              Reset Gas Calculation
            </ButtonSecondary>
          </BoxSection>

          <ButtonPrimary onClick={handleSendCoins} style={{ width: "100%" }}>
            Send Transaction
          </ButtonPrimary>
        </BoxSection>
      </BoxSection>

      {/* Modals */}
      <FullPageLoader open={loadingModal} />

      <TxConfirm
        open={showConfirmModal}
        amount={amount}
        recipient={recipient}
        fee={calculateFee()}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={confirmAndSend}
      />

      <TxProcess
        open={processOpen}
        stageIndex={stageIndex}
        success={success}
        error={error}
        txHash={txHash}
        onClose={closeProcess}
      />
    </>
  );
}
