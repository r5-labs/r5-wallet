// Web3Context.tsx
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { JsonRpcProvider } from 'ethers';
import { ExplorerUrl, RpcUrl, TestnetExplorerUrl, TestnetRpcUrl } from '../constants';

const Web3Context = createContext<{ provider: JsonRpcProvider, explorerUrl: string, swithNetwork: Function, isMainnet: boolean } | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [rpcUrl, setRpcUrl] = useState(RpcUrl)

    const provider = useMemo(() => new JsonRpcProvider(rpcUrl), [rpcUrl]);
    const isMainnet = useMemo(() => rpcUrl === RpcUrl, [rpcUrl])

    const explorerUrl = useMemo(() => isMainnet ? ExplorerUrl : TestnetExplorerUrl, [isMainnet])

    const swithNetwork = useCallback((isMainnet: boolean) => {
        if (isMainnet) setRpcUrl(RpcUrl)
        else setRpcUrl(TestnetRpcUrl)
    }, [])

    return (
        <Web3Context.Provider value={{ provider, explorerUrl, isMainnet, swithNetwork }}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3Context = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3 must be used within a Web3Provider');
    }
    return context;
};
