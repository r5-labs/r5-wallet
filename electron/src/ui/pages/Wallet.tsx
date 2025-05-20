import { Header } from "../components/Header";
import { MainPageBody } from "../components/MainPageBody";

function Wallet({
  decryptedPrivateKey,
}: {
  onReset: () => void;
  decryptedPrivateKey: string;
}) {
  return (
    <>
      <Header decryptedPrivateKey={decryptedPrivateKey} />
      <MainPageBody decryptedPrivateKey={decryptedPrivateKey} />
    </>
  );
}

export default Wallet;
