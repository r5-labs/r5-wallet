import { useState } from "react";
import { ethers } from "ethers";

/**
 * Keeps UI and TxProcess in sync with the blockchain.
 *
 * stageIndex progression:
 *   0 → (send) → 1 → (mined) → 2 → (status checked) → 3
 */
export interface TxLifecycle {
  stageIndex: 0 | 1 | 2 | 3;
  success: boolean;
  error?: string;
  txHash?: string;
  sendTx: (call: () => Promise<ethers.TransactionResponse>) => Promise<void>;
  reset: () => void;
}

export const useTxLifecycle = (_provider: ethers.Provider): TxLifecycle => {
  const [stageIndex, setStageIndex] = useState<0 | 1 | 2 | 3>(0);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState<string>();
  const [txHash,     setTxHash]     = useState<string>();

  const reset = () => {
    setStageIndex(0);
    setSuccess(false);
    setError(undefined);
    setTxHash(undefined);
  };

  /**
   * Wrap your transaction‑sending function with sendTx().
   * Example:
   *   await sendTx(() => signer.sendTransaction(populatedTx));
   */
  const sendTx = async (
    txFn: () => Promise<ethers.TransactionResponse>,
  ) => {
    try {
      const response = await txFn();            // user signed, tx broadcast
      setStageIndex(1);
      setTxHash(response.hash);

      const receipt = await response.wait(1);   // mined (≥1 confirmation)
      setStageIndex(2);

      if (receipt?.status === 1) {
        setSuccess(true);
      } else {
        setError("Transaction reverted");
      }
    } catch (e: any) {
      setError(e?.reason ?? e?.message ?? "Unknown error");
    } finally {
      setStageIndex(3);                         // push to final row
    }
  };

  return { stageIndex, success, error, txHash, sendTx, reset };
};
