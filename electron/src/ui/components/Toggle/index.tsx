import React from "react";
import styled from "styled-components";
import { useWeb3Context } from "../../contexts/Web3Context";
import {
  BoxContent,
  BoxContentParent,
  colorDarkGray,
  colorGlassBorder,
  colorLightGray,
  colorPrimary
} from "../../theme";

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Switch = styled.div<{ isOn: boolean }>`
  width: 50px;
  height: 24px;
  background-color: ${({ isOn }) => (isOn ? colorPrimary : "transparent")};
  border-radius: 12px;
  border: 1px solid ${colorLightGray};
  position: relative;
  transition: background-color 0.3s;
`;

const Knob = styled.div<{ isOn: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ isOn }) => (isOn ? "26px" : "2px")};
  width: 17px;
  height: 17px;
  background-color: white;
  border-radius: 50%;
  transition: left 0.3s;
`;

const Label = styled.span`
  margin: auto;
  margin-top: -7px;
  text-align: center;
  font-size: 10px;
  color: ${colorDarkGray};
  width: 100%;
`;

const Toggle: React.FC = () => {
  const { isMainnet, swithNetwork } = useWeb3Context();

  return (
    <ToggleWrapper onClick={() => swithNetwork(!isMainnet)}>
      <BoxContentParent
        style={{ margin: "auto 10px auto 10px", height: "100%" }}
      >
        <BoxContent>
          <Switch isOn={isMainnet}>
            <Knob isOn={isMainnet} />
          </Switch>
        </BoxContent>
        <BoxContent>
          <Label>{isMainnet ? "MAINNET" : "TESTNET"}</Label>
        </BoxContent>
      </BoxContentParent>
    </ToggleWrapper>
  );
};

export default Toggle;
