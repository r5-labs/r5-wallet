import { Modal } from "../Modal";
import { TransferFunds } from ".";

interface TransferModalProps {
    open: boolean;
    onClose: () => void;
    decryptedPrivateKey: string;
  }

  export function TransferModal({ open, onClose, decryptedPrivateKey }: TransferModalProps) {
    return(
        <>
        <Modal open={open} onClose={onClose}>
        <TransferFunds decryptedPrivateKey={decryptedPrivateKey} />
        </Modal>
        </>
    )
  }