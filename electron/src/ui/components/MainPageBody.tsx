import { FullPageBox } from "../theme";
import { TransferFunds } from "./TransferFunds";

export function MainPageBody(): any {

  return (
    <>
      <FullPageBox style={{ minHeight: "80vh" }}>
        <TransferFunds />
      </FullPageBox>
    </>
  );
}
