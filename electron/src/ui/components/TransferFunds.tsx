import { JSX, useMemo, useState } from "react";
import {
  ethers,
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
  TextTitle,
  colorLightGray,
  SmallText,
  colorSemiBlack
} from "../theme";
import { LuArrowUpRight } from "react-icons/lu";
import { TxConfirm } from "./TxConfirm";
import { FullPageLoader } from "./FullPageLoader";
import { TxProcess } from "./TxProcess";
import { useTxLifecycle } from "../hooks/useTxLifecycle";
import { ModalInner } from "./ModalInner";
import { useWeb3Context } from "../contexts/Web3Context";

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

  /* New: gas/error modal state */
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* RPC */
  const { provider } = useWeb3Context()
  // let wallet: ethers.Wallet;

  const wallet = useMemo(() => {
    try {
      return new ethers.Wallet(decryptedPrivateKey, provider);
    } catch (e) {
      console.error("Invalid private key:", e);
      alert("Invalid private key. Please reset your wallet.");
      return null;
    }
  }, [decryptedPrivateKey])

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
      setErrorMsg("Entering the recipient and amount of coins to send is required to calculate gas. You can leave the gas fields blank to calculate it automatically.");
      setShowErrorModal(true);
      return null;
    }
    if (!wallet) return null
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
      setErrorMsg("Failed to calculate gas.");
      setShowErrorModal(true);
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
      setErrorMsg("Please fill recipient and amount.");
      setShowErrorModal(true);
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
    if (!wallet) return;
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
                <Text style={{ marginLeft: "15px" }}>Gas Price (Gwei)</Text>
                <Input
                  type="number"
                  value={gasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                  style={{ width: "100%" }}
                  placeholder="auto"
                />
              </div>
              <div style={{ flex: 1 }}>
                <Text style={{ marginLeft: "15px" }}>Max Gas</Text>
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

      {/* Loading spinner */}
      <FullPageLoader open={loadingModal} />

      {/* Confirm transaction */}
      <TxConfirm
        open={showConfirmModal}
        amount={amount}
        recipient={recipient}
        fee={calculateFee()}
        onCancel={() => setShowConfirmModal(false)}
        onConfirm={confirmAndSend}
      />

      {/* Transaction progress */}
      <TxProcess
        open={processOpen}
        stageIndex={stageIndex}
        success={success}
        error={error}
        txHash={txHash}
        onClose={closeProcess}
      />

      {/* Gas/error modal */}
      <ModalInner open={showErrorModal} onClose={() => setShowErrorModal(false)}>
        <TextTitle style={{ color: colorSemiBlack }}>Gas Calculation Error</TextTitle>
        <Text style={{ marginBottom: 16, color: colorSemiBlack }}>
          {errorMsg}
        </Text>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ButtonPrimary onClick={() => setShowErrorModal(false)}>
            OK
          </ButtonPrimary>
        </div>
      </ModalInner>
    </>
  );
}
