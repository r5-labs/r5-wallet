import {
  BoxContent,
  BoxContentParent,
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

    // Helper to display "You" if the address matches
    const formatAddress = (address: string) =>
      address.toLowerCase() === walletAddress.toLowerCase() ? "You" : address;

    return (
      <PageWrapper>
        <BoxContent style={{ alignItems: "center", justifyContent: "center", flexShrink: 0, width: "100%" }}>
          <TextSubTitle style={{ marginBottom: 10 }}>Latest Activity</TextSubTitle>
        </BoxContent>
  
        {loading ? (
          <BoxContent style={{ flex: 1, width: "100%", flexShrink: 0 }}>
            <Loading />
          </BoxContent>
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
                  <b>{formatAddress(tx.from_address)}</b> Sent{" "}
                  <b>R5 {Number(formatEther(tx.value)).toFixed(6)}</b> To{" "}
                  <b>{formatAddress(tx.to_address)}</b>
                </div>
              </TxItem>
            ))}
          </ScrollContainer>
        )}
      </PageWrapper>
    );
  }  
