import { useState } from "react";
import {
  TextTitle,
  Text,
  colorSemiBlack,
  ButtonSecondary,
  ButtonPrimary,
  BoxContentParent,
  BoxContent,
  HorMenuOption
} from "../../theme";
import { Modal } from "../Modal";
import { GoInfo, GoKey, GoLock, GoTrash } from "react-icons/go";
import { About } from "../About";
import { PrivateKey } from "../PrivateKey";

const LockIcon = GoLock as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const InfoIcon = GoInfo as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const ResetIcon = GoTrash as unknown as React.FC<React.SVGProps<SVGSVGElement>>;
const PrivateKeyIcon = GoKey as unknown as React.FC<
  React.SVGProps<SVGSVGElement>
>;

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
  const [showInfo, setShowInfo] = useState(false);

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
        <BoxContentParent style={{ width: "100%" }}>

        <HorMenuOption onClick={() => setShowConfirmPkModal(true)}>
            <BoxContent style={{ width: "auto" }}><PrivateKeyIcon /></BoxContent>
            <BoxContent
              style={{
                width: "100%",
                justifyContent: "flex-start",
                marginLeft: 10
              }}
            >
              Show Private Key
            </BoxContent>
          </HorMenuOption>

          <HorMenuOption onClick={() => setShowConfirmResetModal(true)}>
            <BoxContent style={{ width: "auto" }}><ResetIcon /></BoxContent>
            <BoxContent
              style={{
                width: "100%",
                justifyContent: "flex-start",
                marginLeft: 10
              }}
            >
              Reset Wallet
            </BoxContent>
          </HorMenuOption>

          <HorMenuOption onClick={() => setShowInfo(true)}>
            <BoxContent style={{ width: "auto" }}><InfoIcon /></BoxContent>
            <BoxContent
              style={{
                width: "100%",
                justifyContent: "flex-start",
                marginLeft: 10
              }}
            >
              About
            </BoxContent>
          </HorMenuOption>

          <HorMenuOption onClick={handleLockWallet}>
            <BoxContent style={{ width: "auto" }}><LockIcon /></BoxContent>
            <BoxContent
              style={{
                width: "100%",
                justifyContent: "flex-start",
                marginLeft: 10
              }}
            >
              Logout
            </BoxContent>
          </HorMenuOption>

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
          This will permanently delete your wallet data. Make sure you’ve
          backed up your private key before continuing. This action cannot be undone.
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

      <About open={showInfo} onClose={() => setShowInfo(false)} />

        <PrivateKey
                open={showPrivateKey}
                onClose={() => setShowPrivateKey(false)}
                privateKey={decryptedPrivateKey}
              />
    </>
  );
}
