import {
  BoxContent,
  BoxContentParent,
  TextSubTitle,
  Text,
  colorBorder,
  colorGlassBackground,
  borderRadiusDefault,
} from "../../theme";
import styled from "styled-components";
import useTxHistory from "../../hooks/useTxHistory";
import { formatEther } from "ethers";
import { Loading } from "../Loading";

export const ScrollContainer = styled(BoxContent)`
  overflow-y: auto;
  width: 100%;
  margin-top: 10px;
  border-top: 1px solid ${colorBorder};
  padding-top: 10px;
  display: flex;
  flex-direction: column;
`;

export const TxItem = styled.div`
  background: ${colorGlassBackground};
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 15px;
  border-radius: ${borderRadiusDefault};
  font-size: 12px;
  word-break: break-word;
`;

export function TxHistory({ walletAddress }: { walletAddress: string }) {
  const { transactions, loading } = useTxHistory(walletAddress);

  return (
    <BoxContentParent
      style={{
        margin: "0",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        padding: "15px"
      }}
    >
      <BoxContent
        style={{ alignItems: "flex-start", justifyContent: "flex-start" }}
      >
        <TextSubTitle>Latest Account Activity</TextSubTitle>
      </BoxContent>

      {loading ? (
        <BoxContentParent>
          <BoxContent>
            <Loading />
          </BoxContent>
        </BoxContentParent>
      ) : transactions.length === 0 ? (
        <Text>There's no recorded activity.</Text>
      ) : (
        <ScrollContainer>
          {transactions.slice(0, 10).map((tx) => (
            <TxItem key={tx.id}>
              <div style={{ textAlign: "center" }}>
                {new Date(tx.sent_at).toLocaleString()}
              </div>
              <div style={{ marginTop: 10, textAlign: "center" }}>
                <b>{tx.from_address}</b> Sent{" "}
                <b>R5 {Number(formatEther(tx.value)).toFixed(6)}</b> To{" "}
                <b>{tx.to_address}</b>
              </div>
            </TxItem>
          ))}
        </ScrollContainer>
      )}
    </BoxContentParent>
  );
}
