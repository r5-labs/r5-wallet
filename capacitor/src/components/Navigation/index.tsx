import { FullContainerBox } from "../../theme";
import { TransferFunds } from "../TransferFunds";
import { TxHistory } from "../TxHistory";

export function Navigation({
  decryptedPrivateKey
}: {
  decryptedPrivateKey: string;
}): any {
  return (
    <>
      <FullContainerBox>
        <TxHistory />
        {/*<TransferFunds decryptedPrivateKey={decryptedPrivateKey} />*/}
      </FullContainerBox>
    </>
  );
}
