// Toggle.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useWeb3Context } from '../contexts/Web3Context';

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Switch = styled.div<{ isOn: boolean }>`
  width: 50px;
  height: 24px;
  background-color: ${({ isOn }) => (isOn ? '#4caf50' : '#ccc')};
  border-radius: 12px;
  position: relative;
  transition: background-color 0.3s;
`;

const Knob = styled.div<{ isOn: boolean }>`
  position: absolute;
  top: 2px;
  left: ${({ isOn }) => (isOn ? '26px' : '2px')};
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: left 0.3s;
`;

const Label = styled.span`
  margin-left: 10px;
  font-size: 14px;
  width: 50px;
`;

const Toggle: React.FC = () => {
  const { isMainnet, swithNetwork } = useWeb3Context()

  return (
    <ToggleWrapper onClick={() => swithNetwork(!isMainnet)}>
      <Switch isOn={isMainnet}>
        <Knob isOn={isMainnet} />
      </Switch>
      <Label>{isMainnet ? 'Mainnet' : 'Testnet'}</Label>
    </ToggleWrapper>
  );
};

export default Toggle;
