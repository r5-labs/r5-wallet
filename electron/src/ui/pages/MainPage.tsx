import { Header } from "../components/Header";
import { MainPageBody } from "../components/MainPageBody";

function MainPage({ }: { onReset: () => void }) {
  return (
    <>
      <Header />
      <MainPageBody />
      {/* <button onClick={onReset}>Reset Wallet</button> */}
    </>
  );
}

export default MainPage;
