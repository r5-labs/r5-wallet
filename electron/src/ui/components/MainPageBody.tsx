import { FullPageBox } from "../theme";
import { TransferFunds } from "./TransferFunds";

export function MainPageBody({ decryptedPrivateKey }: { decryptedPrivateKey: string }): any {
  return (
    <>
      <FullPageBox style={{ minHeight: "80vh" }}>
        <TransferFunds decryptedPrivateKey={decryptedPrivateKey} />
      </FullPageBox>
    </>
  );
}
