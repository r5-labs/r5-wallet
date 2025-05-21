import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ethers,

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
import {
  Html5Qrcode,
  Html5QrcodeCameraScanConfig,
} from "html5-qrcode";

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
  const [txConfirmed, setTxConfirmed] = useState(false);

  /* currency toggle + balance */
  const [useUSD, setUseUSD] = useState(true);
  const [balance, setBalance] = useState("0");
  const [convertedAmount, setConvertedAmount] = useState("");
  const price = usePrice(); // price is in USD per 1 R5 coin
  const usdToR5 = price ? 1 / price : 0; // convert USD → R5
  const amountInputRef = useRef<HTMLInputElement>(null);

  /* Modal flags */
  const [loadingModal, setLoadingModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processOpen, setProcessOpen] = useState(false);

  /* gas/error modal state */
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* QR */
  const [showQRScanner, setShowQRScanner] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scanningActive = useRef(false);

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
  }, [decryptedPrivateKey, provider]);

  const handleQRScanSuccess = useCallback((decodedText: string) => {
    setRecipient(decodedText);
    closeQRScannerModal();
    setTimeout(() => {
      amountInputRef.current?.focus();
    }, 300); // wait for modal animation to finish
  }, [amountInputRef])

  /* html5-qrcode effect */
  useEffect(() => {
    if (!showQRScanner) return;
    let mounted = true;
    let chosenCameraId: string;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!mounted || devices.length === 0) {
          throw new Error("No cameras found");
        }
        const backCam = devices.find((d) =>
          /back|rear|environment/i.test(d.label)
        );
        chosenCameraId = backCam?.id || devices[0].id;

        const html5QrCode = new Html5Qrcode("qr-reader");
        html5QrCodeRef.current = html5QrCode;

        const config: Html5QrcodeCameraScanConfig = {
          fps: 10,
          qrbox: { width: 320, height: 320 },
          videoConstraints: { deviceId: { exact: chosenCameraId } }
        };

        // start() returns a Promise that resolves once preview is up
        return html5QrCode.start(
          chosenCameraId,
          config,
          (decodedText) => mounted && handleQRScanSuccess(decodedText),
          () => { }
        );
      })
      .then(() => {
        // once start() resolves, we know scanning is active
        scanningActive.current = true;
      })
      .catch((err) => {
        console.error("QR init error:", err);
        setErrorMsg(`QR init failed: ${err.message || err}`);
        setShowErrorModal(true);
        closeQRScannerModal();
      });

    return () => {
      mounted = false;
      // only call stop() if we actually started
      if (scanningActive.current && html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current?.clear())
          .catch(() => {
            /* swallow */
          });
        scanningActive.current = false;
      }
    };
  }, [showQRScanner, handleQRScanSuccess]);

  const updateConvertedAmount = useCallback(() => {
    if (!amount || isNaN(+amount) || !price) {
      setConvertedAmount("");
      return;
    }
    const value = +amount;
    setConvertedAmount(
      useUSD ? (value / price).toFixed(6) : (value * price).toFixed(2)
    );
  }, [amount, price, useUSD]);

  /* Helpers */

  const calculateDefaultGas = useCallback(async () => {
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
      const r5AmountStr = useUSD
        ? (parseFloat(amount) / price).toString()
        : amount;
      const estimatedGas = await wallet.estimateGas({
        to: recipient,
        value: parseUnits(r5AmountStr, 18)
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
  }, [recipient, amount, wallet, useUSD, price, provider]);

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
    setConvertedAmount(r5Amount);
    setLoadingModal(true);
    setTimeout(() => {
      setLoadingModal(false);
      setShowConfirmModal(true);
    }, 300);
  };

  const confirmAndSend = async () => {
    if (!wallet) return;
    setTxConfirmed(true); // ⬅️ prevent further gas updates
    setShowConfirmModal(false);
    setProcessOpen(true);
    const r5AmountStr = useUSD
      ? (parseFloat(amount) * usdToR5).toString()
      : amount;
    await sendTx(() =>
      wallet.sendTransaction({
        to: recipient,
        value: parseUnits(r5AmountStr, 18),
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
    setTxConfirmed(false); // ⬅️ reset for next tx
  };

  const handleMax = async () => {
    const fee = parseFloat(calculateFee());
    const maxSendable = Math.max(parseFloat(balance) - fee, 0);
    setAmount(
      useUSD ? (maxSendable * price).toFixed(2) : maxSendable.toFixed(6)
    );
  };

  const cleanupScanner = () => {
    if (scanningActive.current && html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => html5QrCodeRef.current?.clear())
        .catch(() => { });
      scanningActive.current = false;
    }
    closeQRScannerModal();
  };

  const closeQRScannerModal = () => {
    const modalBackdrop = document.querySelector("[data-modal='qr']");
    if (modalBackdrop) {
      modalBackdrop.classList.remove("open");
      modalBackdrop.classList.add("close"); // Triggers fade-up
      setTimeout(() => setShowQRScanner(false), 200); // Hide modal after transition
    } else {
      setShowQRScanner(false); // fallback if modal not found
    }
  };

  /* Balance */
  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet) {
        const bal = await provider.getBalance(wallet.address);
        setBalance(formatEther(bal));
      }
    };
    fetchBalance();
  }, [wallet, provider]);

  /* Converted amount */
  useEffect(() => {
    if (!amount || isNaN(parseFloat(amount))) return;
    const interval = setInterval(updateConvertedAmount, 10000);
    return () => clearInterval(interval);
  }, [amount, useUSD, updateConvertedAmount]);

  useEffect(updateConvertedAmount, [updateConvertedAmount]);

  /* Poll gas */
  useEffect(() => {
    if (!recipient || !amount || txConfirmed) return;
    const interval = setInterval(calculateDefaultGas, 10000);
    return () => clearInterval(interval);
  }, [recipient, amount, txConfirmed, calculateDefaultGas]); // ⬅️ add txConfirmed to deps

  /* Tx lifecycle */
  const {
    stageIndex,
    success,
    error,
    txHash,
    sendTx,
    reset: resetLifecycle
  } = useTxLifecycle(provider);



  /* Render */
  return (
    <>
      <BoxSection style={{ gap: "5px", color: colorSemiBlack, padding: 0 }}>
        <TextSubTitle style={{ color: colorSemiBlack }}>Send Transaction</TextSubTitle>
        <Text style={{ margin: "auto", color: colorSemiBlack }}>
          Double-check the address and amount before confirming your
          transaction.
        </Text>
        <BoxSection
          style={{ gap: "10px", alignItems: "flex-start", width: "100%", color: colorSemiBlack }}
        >
          <Text style={{ width: "100%", color: colorSemiBlack }}>
            <b>To</b>
            <span
              onClick={() => setShowQRScanner(true)}
              style={{
                background: colorPrimary,
                padding: "7px",
                borderRadius: 99,
                color: colorText,
                fontSize: "8pt",
                marginLeft: "10px",
                cursor: "pointer"
              }}
            >
              <QrIcon style={{ width: 15, height: 15, marginBottom: -4 }} />
            </span>
          </Text>
          <InputModal
            type="text"
            placeholder="Public address, starting with 0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            style={{ width: "100%" }}
          />
          <Text style={{ marginTop: "10px", width: "100%", color: colorSemiBlack }}>
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
            ref={amountInputRef}
            type="number"
            placeholder="Amount to send..."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: "100%" }}
          />
          <SmallText style={{ width: "100%", color: colorSemiBlack }}>
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
        amount={convertedAmount}
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
          That didn’t work…
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
        <ModalInner open onClose={cleanupScanner}>
          <BoxContentParent
            style={{
              // make this a flex‐column container
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",

              // cap its size to viewport
              width: "100%",
              maxWidth: "90vw",
              maxHeight: "90vh",

              // no overflow
              overflow: "hidden",
              padding: 0,
              position: "relative",
              margin: "0 auto"
            }}
          >
            <TextTitle style={{ color: colorSemiBlack, margin: "0" }}>
              Scan QR Code
            </TextTitle>
            <Text style={{ color: colorSemiBlack, marginTop: "-10px" }}>
              Point your camera to the QR code containing your recipient's
              wallet address.
            </Text>

            {/* this DIV is the html5-qrcode host — it will size by CSS above */}
            <div
              id="qr-reader"
              ref={scannerRef}
              style={{
                width: "100%",
                // let it flex‐grow if parent has extra room
                flex: "1 1 auto",
                marginBottom: 16
              }}
            />

            {/* bottom‐center close button */}
            <ButtonSecondary
              onClick={cleanupScanner}
              style={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10
              }}
            >
              X
            </ButtonSecondary>
          </BoxContentParent>
        </ModalInner>
      )}
    </>
  );
}
