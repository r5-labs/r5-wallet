import React from "react";
import styled, { keyframes, css } from "styled-components";
import {
  Text,
  ButtonPrimary,
  colorGlassBackgroundBlur,
  colorGlassBackgroundModal,
  borderRadiusDefault,
  colorSemiBlack,
  colorWhite,
  paddingLow,
  colorAccent,
  colorSecondary,
  Spinner,
  fadeInUp,
  Sp
} from "../theme";
import { GoCheck, GoX, GoLinkExternal } from "react-icons/go";
import { ExplorerUrl } from "../constants";

/* ------------------------------------------------------------
   STAGES
   0  → “Transaction initiated”
   1  → “Sent transaction to blockchain”
   2  → “Waiting for confirmation”
   3  → “Transaction successful / failed”
-------------------------------------------------------------*/

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colorGlassBackgroundBlur};
  backdrop-filter: blur(5px);
  border-radius: ${borderRadiusDefault};
  z-index: 1000;
`;

const Container = styled.div`
  background: ${colorGlassBackgroundModal};
  border-radius: ${borderRadiusDefault};
  padding: 40px 20px;
  width: 90%;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: left;
`;

const zoomIn = keyframes`
  0%   { transform: scale(0.5); opacity: 0; }
  50%  { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1);   opacity: 1; }
`;

const IconWrapper = styled.div<{ $active: boolean }>`
  display: inline-flex;
  background: ${({ $active }) =>
    $active ? colorAccent : colorGlassBackgroundModal};
  padding: ${paddingLow};
  border-radius: 50%;
  animation: ${({ $active }) =>
    $active
      ? css`
          ${zoomIn} 0.3s ease-out;
        `
      : "none"};
`;

const StageRow = styled.div<{ $visible: boolean }>`
  display: ${({ $visible }) => ($visible ? "flex" : "none")};
  align-items: center;
  gap: 10px;
  animation: ${({ $visible }) =>
    $visible
      ? css`
          ${fadeInUp} 0.3s ease-out;
        `
      : "none"};
`;

interface TxProcessProps {
  open: boolean;
  stageIndex: 0 | 1 | 2 | 3;
  success: boolean;
  error?: string;
  txHash?: string;
  onClose: () => void;
}

export function TxProcess({
  open,
  stageIndex,
  success,
  error,
  txHash,
  onClose
}: TxProcessProps) {
  if (!open) return null;

  const finalVisible = stageIndex === 3;
  const failed = Boolean(error);
  const succeeded = finalVisible && success && !failed;

  const stageLabels = [
    "Initiating transaction",
    "Processing transaction on the blockchain",
    "Parsing transaction result",
    failed
      ? `Transaction failed: ${error}`
      : `Transaction successful${txHash ? `, your receipt is ${txHash}` : ""}`
  ] as const;

  const openExplorer = () => {
    if (succeeded && txHash) {
      const url = `${ExplorerUrl}/tx/${txHash}`;
      const shell = (window as any).require("electron").shell;
      shell.openExternal(url);
    }
  };

  return (
    <Overlay>
      <Container>
        <div style={{ textAlign: "center", margin: "0 auto" }}>
          <h3 style={{ margin: "0 0 10px", color: colorSemiBlack }}>
            Processing Blockchain Transaction
          </h3>
        </div>

        {stageLabels.map((label, idx) => {
          /* Visibility */
          const isVisible = idx < 3 ? idx <= stageIndex : finalVisible;

          /* Icon */
          let icon: React.ReactNode = null;
          switch (idx) {
            case 0:
            case 1:
              icon =
                stageIndex > idx ? (
                  <GoCheck />
                ) : (
                  <Spinner style={{ width: 20, height: 20 }} />
                );
              break;
            case 2:
              icon = !finalVisible ? (
                <Spinner style={{ width: 20, height: 20 }} />
              ) : succeeded ? (
                <GoCheck />
              ) : (
                <GoX />
              );
              break;
            case 3:
              icon = succeeded ? <GoCheck /> : <GoX />;
              break;
          }

          /* Active colour & bold label decision */
          const active =
            (idx < 2 && stageIndex > idx) ||
            (idx === 2 && finalVisible) ||
            (idx === 3 && finalVisible);

          return (
            <StageRow key={idx} $visible={isVisible}>
              <IconWrapper $active={active}>
                {React.cloneElement(icon as any, {
                  color: active ? colorWhite : colorSemiBlack,
                  size: 20
                })}
              </IconWrapper>

              <Text
                style={{
                  color: colorSemiBlack,
                  fontWeight: active || idx === stageIndex ? "bold" : "normal"
                }}
              >
                {label}
              </Text>
            </StageRow>
          );
        })}

        {/* Explorer link – only on confirmed success */}
        {succeeded && (
          <>
            <Sp />
            <Text
              style={{
                color: colorSecondary,
                cursor: "pointer",
                margin: "auto"
              }}
              onClick={openExplorer}
            >
              Open on Explorer{" "}
              <span>
                <GoLinkExternal />
              </span>
            </Text>
          </>
        )}

        {/* Done button – always visible at stage 3 */}
        {finalVisible && (
          <ButtonPrimary onClick={onClose} style={{ alignSelf: "center" }}>
            Done
          </ButtonPrimary>
        )}
      </Container>
    </Overlay>
  );
}
