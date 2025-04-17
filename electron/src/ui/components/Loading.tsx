import styled from "styled-components";
import { colorPrimary, Spinner } from "../theme";

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
`;

const LoadingText = styled.p`
  font-size: 14pt;
  color: ${colorPrimary};
  margin: 0;
`;

export function Loading() {
  return (
    <LoadingWrapper>
      <Spinner />
      <LoadingText>Loading…</LoadingText>
    </LoadingWrapper>
  );
}
