import { FullContainerBox } from "../../theme";
import { TransferFunds } from "../TransferFunds";

export function MainPageBody({
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
