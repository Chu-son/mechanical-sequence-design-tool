import React, { createContext, useContext, useState, ReactNode } from 'react';

// グローバルフラグの型定義
interface GlobalFlagContextType {
  isSidebarVisible: boolean;
  setSidebarVisibility: (visibility: boolean) => void;
}

// デフォルト値
const GlobalFlagContext = createContext<GlobalFlagContextType | undefined>(
  undefined,
);

// Provider コンポーネント
export function GlobalFlagProvider({ children }: { children: ReactNode }) {
  const [isSidebarVisible, setSidebarVisibility] = useState(true); // デフォルトで表示
  const value = React.useMemo(
    () => ({ isSidebarVisible, setSidebarVisibility }),
    [isSidebarVisible],
  );

  return (
    <GlobalFlagContext.Provider value={value}>
      {children}
    </GlobalFlagContext.Provider>
  );
}

// Context を使用するカスタムフック
export const useGlobalFlag = (): GlobalFlagContextType => {
  const context = useContext(GlobalFlagContext);
  if (!context) {
    throw new Error('useGlobalFlag must be used within a GlobalFlagProvider');
  }
  return context;
};
