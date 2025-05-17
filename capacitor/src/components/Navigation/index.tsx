import { FullContainerBox } from "../../theme";
import { TransferFunds } from "../TransferFunds";

export function Navigation({
  decryptedPrivateKey
}: {
  decryptedPrivateKey: string;
}): any {
  return (
    <>
      <FullContainerBox>
        <TransferFunds decryptedPrivateKey={decryptedPrivateKey} />
      </FullContainerBox>
    </>
  );
}
