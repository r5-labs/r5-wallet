import { ethers } from "ethers";
import { useMemo } from "react";
import { FullContainerBox } from "../../theme";
import { TxHistory } from "../TxHistory";
import { useWeb3Context } from "../../contexts/Web3Context";

export function Navigation({
  decryptedPrivateKey
}: {
  decryptedPrivateKey: string;
}): any {

  const { provider, explorerUrl } = useWeb3Context();

  const wallet = useMemo(() => {
    try {
      return new ethers.Wallet(decryptedPrivateKey, provider);
    } catch (e) {
      console.error("Invalid private key:", e);
      alert("Invalid private key. Please reset your wallet.");
      return null;
    }
  }, [decryptedPrivateKey]);

  return (
    <>
      <FullContainerBox>
        <TxHistory walletAddress={wallet?.address ?? ""} />
      </FullContainerBox>
    </>
  );
}
