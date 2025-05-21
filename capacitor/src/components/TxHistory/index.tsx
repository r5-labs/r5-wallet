import {
  BoxContent,
  TextSubTitle,
  Text,
  colorBorder,
  colorGlassBackground,
  borderRadiusDefault
} from "../../theme";
import styled from "styled-components";
import useTxHistory from "../../hooks/useTxHistory";
import { formatEther } from "ethers";
import { Loading } from "../Loading";

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 15px;
`;

export const ScrollContainer = styled(BoxContent)`
  overflow-y: auto;
  width: 100%;
  border-top: 1px solid ${colorBorder};
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 10px;
  flex: 1;
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

  const isSender = (tx: any) =>
    tx.from_address.toLowerCase() === walletAddress.toLowerCase();

  const isReceiver = (tx: any) =>
    tx.to_address.toLowerCase() === walletAddress.toLowerCase();

  const formatCounterparty = (address: string) =>
    address.toLowerCase() === walletAddress.toLowerCase() ? "You" : address;

  return (
    <PageWrapper>
      <BoxContent
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          width: "100%",
        }}
      >
        <TextSubTitle style={{ marginBottom: 10 }}>
          Latest Activity
        </TextSubTitle>
      </BoxContent>

      {loading ? (
        <BoxContent style={{ flex: 1, width: "100%", flexShrink: 0 }}>
          <Loading />
        </BoxContent>
      ) : transactions.length === 0 ? (
        <Text>There's no recorded activity.</Text>
      ) : (
        <ScrollContainer>
          {transactions.slice(0, 10).map((tx) => {
            const amount = Number(formatEther(tx.value)).toFixed(6);
            const timestamp = new Date(tx.sent_at).toLocaleString();

            let message = "";

            if (isSender(tx)) {
              message = `Sent R5 ${amount} To ${formatCounterparty(tx.to_address)}`;
            } else if (isReceiver(tx)) {
              message = `Received R5 ${amount} From ${formatCounterparty(tx.from_address)}`;
            } else {
              message = `Sent R5 ${amount}`; // fallback
            }

            return (
              <TxItem key={tx.id}>
                <div style={{ textAlign: "center", fontSize: "0.7rem" }}>{timestamp}</div>
                <div style={{ marginTop: 10, textAlign: "center", fontSize: "0.7rem" }}>
                  <b>{message}</b>
                </div>
              </TxItem>
            );
          })}
        </ScrollContainer>
      )}
    </PageWrapper>
  );
}
