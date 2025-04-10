import { useState, useEffect } from 'react';
import WelcomePage from './pages/WelcomePage';
import WalletConnectPage from './pages/WalletConnectPage';
import MainPage from './pages/MainPage';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    const walletInfo = localStorage.getItem('walletInfo');
    if (walletInfo) {
      setHasWallet(true);
    }
  }, []);

  const handleAuthenticate = () => {
    setIsAuthenticated(true);
  };

  const handleWalletSetup = () => {
    setHasWallet(true);
  };

  const handleReset = () => {
    localStorage.removeItem('walletInfo');
    setHasWallet(false);
    setIsAuthenticated(false);
  };

  return (
    <>
      {isAuthenticated ? (
        hasWallet ? (
          <MainPage onReset={handleReset} />
        ) : (
          <WalletConnectPage onWalletSetup={handleWalletSetup} />
        )
      ) : (
        <WelcomePage onAuthenticate={handleAuthenticate} />
      )}
    </>
  );
}

export default App;
