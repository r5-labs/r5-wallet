import { useState } from 'react';
import CryptoJS from 'crypto-js'; // Import encryption library

function WelcomePage({ onAuthenticate }: { onAuthenticate: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [storedEncryptedPassword, setStoredEncryptedPassword] = useState(
    localStorage.getItem('walletPassword') || ''
  );
  const [error, setError] = useState('');

  const encryptData = (data: string, key: string) => {
    return CryptoJS.AES.encrypt(data, key).toString();
  };

  const decryptData = (encryptedData: string, key: string) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return null; // Return null if decryption fails
    }
  };

  const handleSetPassword = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const encryptedPassword = encryptData(password, password); // Encrypt password with itself as the key
    localStorage.setItem('walletPassword', encryptedPassword);
    setStoredEncryptedPassword(encryptedPassword);
    onAuthenticate(); // Notify parent component of successful authentication
  };

  const handleLogin = () => {
    const decryptedPassword = decryptData(storedEncryptedPassword, password.trim());
    if (decryptedPassword === password.trim()) {
      onAuthenticate(); // Notify parent component of successful authentication
    } else {
      setError('Incorrect password.');
    }
  };

  const handleReset = () => {
    localStorage.removeItem('walletPassword');
    localStorage.removeItem('walletInfo'); // Clear wallet info as well
    setStoredEncryptedPassword('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div>
      <h1>Welcome to Your Crypto Wallet</h1>
      {storedEncryptedPassword ? (
        <>
          <p>Please enter your password to continue:</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <button onClick={handleReset}>Reset Wallet</button>
        </>
      ) : (
        <>
          <p>Create a new password to secure your wallet:</p>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button onClick={handleSetPassword}>Set Password</button>
        </>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default WelcomePage;
