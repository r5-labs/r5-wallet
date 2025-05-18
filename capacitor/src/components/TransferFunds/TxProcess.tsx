import React, { JSX, useEffect, useMemo, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import {
  Text,
  ButtonPrimary,
  colorGlassBackgroundModal,
  borderRadiusDefault,
  colorSemiBlack,
  colorWhite,
  paddingLow,
  colorAccent,
  colorSecondary,
  Spinner,
  fadeInUp,
  fadeOutUp,
  Sp
} from "../../theme";
import { GoCheck, GoX, GoLinkExternal } from "react-icons/go";
import { useWeb3Context } from "../../contexts/Web3Context";
import { ExplorerUrl } from "../../constants";

const GoCheckIcon = GoCheck as React.FC<React.PropsWithChildren>;
const GoXIcon = GoX as React.FC<React.PropsWithChildren>;
const GoLinkExternalIcon = GoLinkExternal as React.FC<React.PropsWithChildren>;

/* ------------------------------------------------------------
   STAGES
   0  → “Initiating transaction”
   1  → “Processing transaction on the blockchain”
   2  → “Parsing transaction result”
   3  → “Transaction successful / failed”
-------------------------------------------------------------*/

/* Overlay just fades opacity */
const fadeOverlayIn = keyframes`from{opacity:0}to{opacity:1}`;
const fadeOverlayOut = keyframes`from{opacity:1}to{opacity:0}`;

const Overlay = styled.div<{ $exiting: boolean }>`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: none;
  border-radius: ${borderRadiusDefault};
  z-index: 3;

  animation: ${({ $exiting }) =>
    $exiting
      ? css`
          ${fadeOverlayOut} 0.25s forwards
        `
      : css`
          ${fadeOverlayIn} 0.25s forwards
        `};
`;

/* Container slides up / down */
const Container = styled.div<{ $exiting: boolean }>`
  background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.65) 100%);
  border-radius: ${borderRadiusDefault};
  padding: 40px 20px;
  width: 90%;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: left;

  animation: ${({ $exiting }) =>
    $exiting
      ? css`
          ${fadeOutUp} 0.25s forwards
        `
      : css`
          ${fadeInUp} 0.25s forwards
        `};
`;

/* Existing bits (unchanged) --------------------------------------------- */
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
          ${zoomIn} 0.3s ease-out
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
          ${fadeInUp} 0.3s ease-out
        `
      : "none"};
`;

/* Props ------------------------------------------------------------------ */
interface TxProcessProps {
  open: boolean;
  stageIndex: 0 | 1 | 2 | 3;
  success: boolean;
  error?: string;
  txHash?: string;
  onClose: () => void;
}

/* Component -------------------------------------------------------------- */
export function TxProcess({
  open,
  stageIndex,
  success,
  error,
  txHash,
  onClose
}: TxProcessProps) {
  /* handle enter / exit animation */
  const [visible, setVisible] = useState(open);
  const [exiting, setExiting] = useState(false);

  const { explorerUrl } = useWeb3Context()

  /* logic reused from previous version */
  const finalVisible = useMemo(() => stageIndex === 3, [stageIndex]);

  const failed = useMemo(() => Boolean(error), [error]);
  const succeeded = useMemo(() => finalVisible && success && !failed, [failed, finalVisible, success]);

  const stageLabels = useMemo(() => [
    "Initiating transaction",
    "Validating on the blockchain",
    "Parsing transaction result",
    failed
      ? `Transaction failed: ${error}`
      : `Transaction successful${txHash ? `, your receipt is ${txHash}` : ""}`
  ] as const, [failed, error, txHash])

  useEffect(() => {
    if (open) {
      setVisible(true); // mount immediately
      setExiting(false);
    } else if (visible) {
      setExiting(true); // play exit anim, then unmount
      const t = setTimeout(() => setVisible(false), 250);
      return () => clearTimeout(t);
    }
  }, [open, visible]);

  if (!visible) return null;



  /* render --------------------------------------------------------------- */
  return (
    <Overlay $exiting={exiting}>
      <Container $exiting={exiting}>
        <div style={{ textAlign: "center", margin: "0 auto" }}>
          <h3 style={{ margin: "0 0 10px", color: colorSemiBlack }}>
            Blockchain Transaction
          </h3>
        </div>

        {stageLabels.map((label, idx) => {
          const isVisible = idx < 3 ? idx <= stageIndex : finalVisible;

          let icon: React.ReactNode = null;
          switch (idx) {
            case 0:
            case 1:
              icon =
                stageIndex > idx ? (
                  <>
                  <GoCheckIcon />
                  </>
                ) : (
                  <Spinner style={{ width: 20, height: 20 }} />
                );
              break;
            case 2:
              icon = !finalVisible ? (
                <Spinner style={{ width: 20, height: 20 }} />
              ) : succeeded ? (
                <GoCheckIcon />
              ) : (
                <GoXIcon />
              );
              break;
            case 3:
              icon = succeeded ? <GoCheckIcon /> : <GoXIcon />;
              break;
          }

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
                  fontWeight: active || idx === stageIndex ? "bold" : "normal",
                  wordBreak: "break-all",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap"
                }}
              >
                {label}
              </Text>
            </StageRow>
          );
        })}

        {succeeded && (
          <>
            <Sp />
            <a href={ExplorerUrl + `/tx/` + txHash} target="_blank" style={{ textAlign: "center" }}>
            <Text
              style={{
                color: colorSecondary,
                cursor: "pointer",
                margin: "auto"
              }}
            >
              Open on Explorer <GoLinkExternalIcon />
            </Text>
            </a>
          </>
        )}

        {finalVisible && (
          <ButtonPrimary onClick={onClose} style={{ alignSelf: "center" }}>
            Done
          </ButtonPrimary>
        )}
      </Container>
    </Overlay>
  );
}
