import { JSX, useEffect, useMemo, useState } from "react";
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
  SmallText,
  colorSemiBlack,
  InputModal,
  colorPrimary,
  colorText,
  BoxContentParent
} from "../../theme";
import { TxConfirm } from "./TxConfirm";
import { FullPageLoader } from "../FullPageLoader";
import { TxProcess } from "./TxProcess";
import { useTxLifecycle } from "../../hooks/useTxLifecycle";
import { ModalInner } from "../ModalInner";
import { useWeb3Context } from "../../contexts/Web3Context";
import usePrice from "../../hooks/usePrice";
import { IoQrCode } from "react-icons/io5";
import { BarcodeScanner } from "@capacitor-mlkit/barcode-scanning";

const QrIcon = IoQrCode as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

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

  /* currency toggle + balance */
  const [useUSD, setUseUSD] = useState(true);
  const [balance, setBalance] = useState("0");
  const [convertedAmount, setConvertedAmount] = useState("");
  const price = usePrice(); // price is in USD per 1 R5 coin
  const usdToR5 = price ? 1 / price : 0; // convert USD → R5

  /* Modal flags */
  const [loadingModal, setLoadingModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processOpen, setProcessOpen] = useState(false);

  /* gas/error modal state */
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* QR */
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleQRScanSuccess = (decodedText: string) => {
    setRecipient(decodedText);
    setShowQRScanner(false);
  };

  useEffect(() => {
    if (!showQRScanner) return;

    let scanListener: any;

    const startScan = async () => {
      try {
        const permission = await BarcodeScanner.checkPermissions();
        if (permission.camera !== "granted") {
          setErrorMsg(
            "Camera access was denied. Please enable camera permissions in your device settings and try again."
          );
          setShowErrorModal(true);
          setShowQRScanner(false);
          return;
        }

        // Start scan and listen for scan results
        scanListener = BarcodeScanner.addListener(
          "barcodesScanned",
          (result: any) => {
            if (result?.barcodes?.length) {
              const firstCode = result.barcodes[0];
              if (firstCode && firstCode.rawValue) {
                handleQRScanSuccess(firstCode.rawValue);
              }
            }
          }
        );

        await BarcodeScanner.startScan();
      } catch (err: any) {
        console.error("Scan error:", err);
        setErrorMsg(
          `QR scanning failed: ${
            err?.message || err?.toString() || "Unknown error"
          }`
        );
        setShowErrorModal(true);
        setShowQRScanner(false);
      }
    };

    startScan();

    // Cleanup listener and stop scan when component unmounts or scanner closes
    return () => {
      if (scanListener) {
        scanListener.remove();
      }
      BarcodeScanner.stopScan();
    };
  }, [showQRScanner]);

  /* RPC */
  const { provider } = useWeb3Context();
  const wallet = useMemo(() => {
    try {
      return new ethers.Wallet(decryptedPrivateKey, provider);
    } catch (e) {
      console.error("Invalid private key:", e);
      alert("Invalid private key. Please reset your wallet.");
      return null;
    }
  }, [decryptedPrivateKey]);

  /* update balance */
  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet) {
        const bal = await provider.getBalance(wallet.address);
        setBalance(formatEther(bal));
      }
    };
    fetchBalance();
  }, [wallet]);

  useEffect(() => {
    if (!amount || isNaN(parseFloat(amount))) return;

    const interval = setInterval(() => {
      updateConvertedAmount();
    }, 10000);

    return () => clearInterval(interval);
  }, [amount, useUSD]);

  useEffect(() => {
    updateConvertedAmount();
  }, [amount, useUSD]);

  /* poll gas every 10s */
  useEffect(() => {
    if (!recipient || !amount) return;

    const interval = setInterval(() => {
      calculateDefaultGas();
    }, 10000);

    return () => clearInterval(interval);
  }, [recipient, amount]);

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
  const updateConvertedAmount = () => {
    if (!amount || isNaN(parseFloat(amount)) || !price) {
      setConvertedAmount("");
      return;
    }

    const value = parseFloat(amount);
    const result = useUSD
      ? (value / price).toFixed(6) // USD → R5
      : (value * price).toFixed(2); // R5 → USD

    setConvertedAmount(result);
  };

  const calculateDefaultGas = async () => {
    if (!recipient || !amount) {
      setErrorMsg(
        "Entering the recipient and amount of coins to send is required to calculate gas. You can leave the gas fields blank to calculate it automatically."
      );
      setShowErrorModal(true);
      return null;
    }
    if (!wallet) return null;
    try {
      const feeData = await provider.getFeeData();
      if (!feeData.gasPrice) throw new Error("Gas price unavailable");

      const r5Amount = useUSD
        ? (parseFloat(amount) / price).toFixed(6)
        : amount;

      const estimatedGas = await wallet.estimateGas({
        to: recipient,
        value: parseEther(r5Amount)
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

  const handleSendCoins = async () => {
    if (!recipient || !amount) {
      setErrorMsg("Please fill recipient and amount.");
      setShowErrorModal(true);
      return;
    }

    const r5Amount = useUSD
      ? (parseFloat(amount) * usdToR5).toFixed(6)
      : amount;
    const total = parseFloat(r5Amount) + parseFloat(calculateFee());

    if (total > parseFloat(balance)) {
      setErrorMsg("Insufficient funds to cover amount + gas.");
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

    const r5Amount = useUSD
      ? (parseFloat(amount) * usdToR5).toFixed(6)
      : amount;

    await sendTx(() =>
      wallet.sendTransaction({
        to: recipient,
        value: parseEther(r5Amount),
        gasPrice: parseUnits(gasPrice || defaultGasPrice, "gwei"),
        gasLimit: BigInt(maxGas || defaultMaxGas)
      })
    );
  };

  const closeProcess = () => {
    setProcessOpen(false);
    resetLifecycle();
    setRecipient("");
    setAmount("");
    setGasPrice("");
    setMaxGas("");
    setDefaultGasPrice("");
    setDefaultMaxGas("");
  };

  const handleMax = async () => {
    const fee = parseFloat(calculateFee());
    const maxSendable = Math.max(parseFloat(balance) - fee, 0);
    const value = useUSD
      ? (maxSendable * price).toFixed(2) // R5 → USD
      : maxSendable.toFixed(6); // R5
    setAmount(value);
  };

  /* Render */
  return (
    <>
      <BoxSection style={{ gap: "5px", color: colorSemiBlack, padding: 0 }}>
        <TextSubTitle>Send Transaction</TextSubTitle>
        <Text style={{ margin: "auto" }}>
          Double‑check the address and amount before confirming your
          transaction.
        </Text>

        <BoxSection
          style={{ gap: "10px", alignItems: "flex-start", width: "100%" }}
        >
          <Text style={{ width: "100%" }}>
            <b>To</b>
            <span
              onClick={() => setShowQRScanner(true)}
              style={{
                background: colorPrimary,
                padding: "5px 10px",
                borderRadius: 10,
                color: colorText,
                fontSize: "8pt",
                marginLeft: "10px",
                cursor: "pointer"
              }}
            >
              <QrIcon style={{ width: 16, height: 16, marginBottom: -4 }} />
            </span>
          </Text>
          <InputModal
            type="text"
            placeholder="Public address, starting with 0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            style={{ width: "100%" }}
          />
          <Text style={{ marginTop: "10px", width: "100%" }}>
            <b>Amount in {useUSD ? "USD" : "R5 Coins"}</b>
            <span
              onClick={() => setUseUSD((prev) => !prev)}
              style={{
                background: colorPrimary,
                padding: "5px 10px",
                borderRadius: 10,
                color: colorText,
                fontSize: "8pt",
                marginLeft: "10px",
                cursor: "pointer"
              }}
            >
              USE {useUSD ? "R5 COINS" : "USD"}
            </span>
            <span
              onClick={handleMax}
              style={{
                background: colorPrimary,
                padding: "5px 10px",
                borderRadius: 10,
                color: colorText,
                fontSize: "8pt",
                marginLeft: "10px",
                cursor: "pointer"
              }}
            >
              MAX
            </span>
          </Text>
          <InputModal
            type="number"
            placeholder="Amount to send..."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: "100%" }}
          />
          <SmallText style={{ width: "100%" }}>
            {convertedAmount
              ? `Sending ${convertedAmount} ${useUSD ? "R5 Coins" : "USD"}`
              : ""}
          </SmallText>

          {/* Gas section (hidden by default) */}
          <BoxSection
            style={{ gap: "10px", alignItems: "center", display: "none" }}
          >
            <BoxContent style={{ gap: "10px", flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <Text style={{ marginLeft: "15px", marginBottom: "10px" }}>
                  Gas Price (Gwei)
                </Text>
                <Input
                  type="number"
                  value={gasPrice}
                  onChange={(e) => setGasPrice(e.target.value)}
                  style={{ width: "100%" }}
                  placeholder="auto"
                />
              </div>
              <div style={{ flex: 1 }}>
                <Text style={{ marginLeft: "15px", marginBottom: "10px" }}>
                  Max Gas
                </Text>
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

      <ModalInner
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
      >
        <TextTitle style={{ color: colorSemiBlack }}>
          That didn't work...
        </TextTitle>
        <Text style={{ marginBottom: 16, color: colorSemiBlack }}>
          {errorMsg}
        </Text>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ButtonPrimary onClick={() => setShowErrorModal(false)}>
            Done
          </ButtonPrimary>
        </div>
      </ModalInner>

      {showQRScanner && (
        <ModalInner open={true} onClose={() => setShowQRScanner(false)}>
          <BoxContentParent>
            <TextTitle style={{ color: colorSemiBlack, marginBottom: 10 }}>
              Scan QR Code
            </TextTitle>
            <BoxContent style={{ color: colorSemiBlack }}>
              <p style={{ textAlign: "center", margin: "24px 0" }}>
                Opening camera...
              </p>
            </BoxContent>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 16
              }}
            >
              <ButtonSecondary onClick={() => setShowQRScanner(false)}>
                Close Scanner
              </ButtonSecondary>
            </div>
          </BoxContentParent>
        </ModalInner>
      )}
    </>
  );
}
