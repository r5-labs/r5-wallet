import { useState } from "react";
import {
  TextTitle,
  Text,
  colorSemiBlack,
  ButtonSecondary,
  ButtonPrimary,
  BoxContentParent,
  BoxContent
} from "../../theme";
import { Modal } from "../Modal";

interface MoreOptionsProps {
  open: boolean;
  onClose: () => void;
  decryptedPrivateKey: string;
}

export function MoreOptions({
  open,
  onClose,
  decryptedPrivateKey
}: MoreOptionsProps) {
  const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);
  const [showConfirmPkModal, setShowConfirmPkModal] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const handleResetWallet = () => {
    sessionStorage.clear();
    window.location.reload();
    localStorage.clear();
    window.location.reload();
  };

  /** Lock the wallet: keep encrypted JSON, drop any decrypted/session
   *  data, and reload so the app shows the password screen again. */
  const handleLockWallet = () => {
    /* Clear anything that might hold plaintext keys */
    sessionStorage.clear();
    /* Reload the renderer – React will mount at the login page */
    window.location.reload();
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <BoxContentParent>
            <BoxContent>
                Option 1
            </BoxContent>
        </BoxContentParent>
      </Modal>
      
      {/**
       * Confirmation dialogs before displaying private key or resetting wallet
       */}

      {/* Confirm: reset wallet */}
      <Modal
        open={showConfirmResetModal}
        onClose={() => setShowConfirmResetModal(false)}
      >
        <TextTitle style={{ color: colorSemiBlack }}>Reset Wallet?</TextTitle>
        <Text style={{ color: colorSemiBlack }}>
          This will delete all locally‑stored wallet data. Make sure you’ve
          exported a backup before continuing. This action cannot be undone.
        </Text>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <ButtonSecondary onClick={() => setShowConfirmResetModal(false)}>
            Cancel
          </ButtonSecondary>
          <ButtonPrimary
            onClick={() => {
              setShowConfirmResetModal(false);
              handleResetWallet();
            }}
          >
            Reset Wallet
          </ButtonPrimary>
        </div>
      </Modal>

      {/* Confirm: expose private key */}
      <Modal
        open={showConfirmPkModal}
        onClose={() => setShowConfirmPkModal(false)}
      >
        <TextTitle style={{ color: colorSemiBlack }}>
          Expose Private Key?
        </TextTitle>
        <Text style={{ color: colorSemiBlack }}>
          This will expose your private key on‑screen. You may want to do this
          for backing up your wallet, however, be aware that your funds will be
          inherently at risk. Only proceed if you’re in a secure environment and
          have no one looking over your shoulder.
        </Text>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <ButtonSecondary onClick={() => setShowConfirmPkModal(false)}>
            Cancel
          </ButtonSecondary>
          <ButtonPrimary
            onClick={() => {
              setShowConfirmPkModal(false);
              setShowPrivateKey(true);
            }}
          >
            Show Private Key
          </ButtonPrimary>
        </div>
      </Modal>

    </>
  );
}
