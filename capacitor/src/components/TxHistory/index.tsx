import { BoxContent, BoxContentParent, TextSubTitle, Text } from "../../theme";

export function TxHistory() {
  return (
    <>
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
          <TextSubTitle>Account Activity</TextSubTitle>
        </BoxContent>
        <BoxContent
          style={{ alignItems: "flex-start", justifyContent: "flex-start" }}
        >
          <Text>There's no recorded activity.</Text>
        </BoxContent>
      </BoxContentParent>
    </>
  );
}
