export interface ElectronAPI {
  shell: {
    openExternal: (url: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
    r5: {
      openExternal: (url: string) => void;
      downloadUrl: (url: string) => Promise<void>;
    };
  }
}
