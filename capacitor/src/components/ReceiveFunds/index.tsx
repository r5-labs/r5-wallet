import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  borderRadiusDefault,
  ButtonPrimary,
  colorSemiBlack,
  Text
} from "../../theme";
import { Modal } from "../Modal";
import { GoCopy, GoCheck } from "react-icons/go";

const GoCopyIcon = GoCopy as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const GoCheckIcon = GoCheck as unknown as React.FC<React.SVGProps<SVGSVGElement>>;

interface ReceiveFundsProps {
  open: boolean;
  onClose: () => void;
  address: string;
}

export function ReceiveFunds({ open, onClose, address }: ReceiveFundsProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h3 style={{ marginBottom: "-10px", color: colorSemiBlack }}>
        Receive Funds
      </h3>
      <Text style={{ color: colorSemiBlack }}>
        You can use the QR code below or copy your wallet address.
      </Text>
      <div
        style={{
          background: "#fff",
          padding: "20px 20px 10px 20px",
          borderRadius: borderRadiusDefault,
          width: "auto",
          margin: "auto"
        }}
      >
        <QRCodeCanvas value={address} size={200} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          marginTop: "10px"
        }}
      >
        <Text style={{ wordBreak: "break-all", color: colorSemiBlack }}>
          {address}
        </Text>
        <span
          onClick={handleCopy}
          title="Copy Address"
          style={{ cursor: "pointer", display: "inline-flex", color: colorSemiBlack }}
        >
          {isCopied ? (
            <GoCheckIcon style={{ width: 12, height: 12 }} />
          ) : (
            <GoCopyIcon style={{ width: 12, height: 12 }} />
          )}
        </span>
      </div>
      <ButtonPrimary onClick={onClose}>Close</ButtonPrimary>
    </Modal>
  );
}
