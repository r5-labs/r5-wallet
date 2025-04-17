// components/Modal.tsx
import { useState, useEffect } from "react";
import { borderRadiusDefault, ModalBackground, ModalContainer } from "../theme";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function ModalInner({ open, onClose, children }: ModalProps) {
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
    <ModalBackground visible style={{ borderRadius: borderRadiusDefault }}>
      {/* 1) backdrop click catcher: below the modal */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0
        }}
        onClick={onClose}
      />

      {/* 2) modal card: above the backdrop */}
      <ModalContainer exiting={exiting} style={{ zIndex: 1 }}>
        {children}
      </ModalContainer>
    </ModalBackground>
  );
}
