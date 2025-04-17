import {
  ButtonPrimary,
  Text,
  colorWhite,
  borderRadiusDefault,
  colorSemiBlack
} from "../theme";
import { Modal } from "./Modal";

interface PrivateKeyProps {
  open: boolean;
  onClose: () => void;
  privateKey: string;
}

export function PrivateKey({ open, onClose, privateKey }: PrivateKeyProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <h3 style={{ marginBottom: "-10px", color: colorSemiBlack }}>
        Your Private Key
      </h3>
      <Text style={{ marginBottom: "10px", color: colorSemiBlack }}>
        <b>Anyone with your private key can control your wallet.</b> Store it in
        a safe place.
      </Text>
      <Text
        style={{
          wordWrap: "break-word",
          background: colorWhite,
          padding: "10px 15px",
          borderRadius: borderRadiusDefault,
          fontFamily: "monospace",
          color: colorSemiBlack
        }}
      >
        {privateKey}
      </Text>
      <ButtonPrimary onClick={onClose}>Close</ButtonPrimary>
    </Modal>
  );
}
