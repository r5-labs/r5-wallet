import { useState, useEffect } from "react";
import {
  BoxContent,
  BoxContentParent,
  ModalBackground,
  ModalContainer
} from "../../theme";
import WalletLogo from "../../assets/r5-wallet.png";
interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  const [visible, setVisible] = useState(open);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setExiting(false);
    } else if (visible) {
      setExiting(true);
      const t = setTimeout(() => {
        setVisible(false);
        setExiting(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open, visible]);

  if (!visible) return null;

  return (
    <ModalBackground visible={visible}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0
        }}
        onClick={onClose}
      />
      <ModalContainer exiting={exiting} style={{ zIndex: 1 }}>
        <BoxContentParent>
          <BoxContent>
            <img
              src={WalletLogo}
              alt="R5 Wallet"
              style={{ width: 32, height: 32 }}
            />
          </BoxContent>
        </BoxContentParent>
        {children}
      </ModalContainer>
    </ModalBackground>
  );
}
