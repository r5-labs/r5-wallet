import { Header } from "../../components/Header";
import { Navigation } from "../../components/Navigation";

function Wallet({
  decryptedPrivateKey,
}: {
  onReset: () => void;
  decryptedPrivateKey: string;
}) {
  return (
    <>
      <Header decryptedPrivateKey={decryptedPrivateKey} />
      <Navigation decryptedPrivateKey={decryptedPrivateKey} />
    </>
  );
}

export default Wallet;
