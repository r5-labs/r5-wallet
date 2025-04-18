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
    <ModalBackground
      visible
      style={{
        borderRadius: borderRadiusDefault,
        background: "rgba(0, 0, 0, 0.75",
        backdropFilter: "none"
      }}
    >
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
      <ModalContainer
        exiting={exiting}
        style={{
          zIndex: 1,
          borderRadius: borderRadiusDefault,
          background:
            "radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.65) 100%)",
          backdropFilter: "none"
        }}
      >
        {children}
      </ModalContainer>
    </ModalBackground>
  );
}
