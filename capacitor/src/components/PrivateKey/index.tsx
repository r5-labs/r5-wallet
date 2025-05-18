import { useState } from "react";
import {
  ButtonPrimary,
  Text,
  colorWhite,
  borderRadiusDefault,
  colorSemiBlack
} from "../../theme";
import { Modal } from "../Modal";
import { QRCodeCanvas } from "qrcode.react";
import { GoCopy, GoCheck } from "react-icons/go";

const GoCopyIcon = GoCopy as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const GoCheckIcon = GoCheck as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;

interface PrivateKeyProps {
  open: boolean;
  onClose: () => void;
  privateKey: string;
}

export function PrivateKey({ open, onClose, privateKey }: PrivateKeyProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(privateKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy private key:", err);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h3 style={{ marginBottom: "-10px", color: colorSemiBlack }}>
        Your Private Key
      </h3>
      <Text style={{ marginBottom: "10px", color: colorSemiBlack }}>
        <b>Anyone with your private key can control your wallet.</b> Store it in
        a safe place.
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
        <QRCodeCanvas value={privateKey} size={200} />
      </div>
      <Text
        style={{
          wordBreak: "break-all",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
          background: colorWhite,
          padding: "10px 15px",
          borderRadius: borderRadiusDefault,
          fontFamily: "monospace",
          color: colorSemiBlack
        }}
      >
        {privateKey}{" "}
        <span
          onClick={handleCopy}
          title="Copy Address"
          style={{
            cursor: "pointer",
            display: "inline-flex",
            color: colorSemiBlack
          }}
        >
          {isCopied ? (
            <GoCheckIcon style={{ width: 12, height: 12 }} />
          ) : (
            <GoCopyIcon style={{ width: 12, height: 12 }} />
          )}
        </span>
      </Text>

      <ButtonPrimary onClick={onClose}>Close</ButtonPrimary>
    </Modal>
  );
}
