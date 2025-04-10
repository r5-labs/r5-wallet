import { Box, colorLightGray } from "../theme";
import R5Logo from "../assets/logo_white-transparent.png";

export function Header(): any {
  const walletInfo = JSON.parse(localStorage.getItem("walletInfo") || "{}");

  return (
    <>
      <Box>
        <img src={R5Logo} width={64} height={64} />
        {walletInfo.address}
        <div
          style={{ margin: "-20px 0 0 0", fontSize: "8pt", fontWeight: "600", color: colorLightGray }}
        >
          <p>YOUR WALLET</p>
        </div>
      </Box>
    </>
  );
}
