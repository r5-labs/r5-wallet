import { useState } from 'react';
import sha256 from 'crypto-js/sha256'; // Import hashing library

function WelcomePage({ onAuthenticate }: { onAuthenticate: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [storedPassword, setStoredPassword] = useState(
    localStorage.getItem('walletPassword') || ''
  );
  const [error, setError] = useState('');

  const handleSetPassword = () => {
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    const hashedPassword = sha256(password).toString(); // Hash the password
    localStorage.setItem('walletPassword', hashedPassword);
    setStoredPassword(hashedPassword);
    onAuthenticate(); // Notify parent component of successful authentication
  };

  const handleLogin = () => {
    const hashedPassword = sha256(password.trim()).toString(); // Hash the input password
    if (hashedPassword === storedPassword) {
      onAuthenticate(); // Notify parent component of successful authentication
    } else {
      setError('Incorrect password.');
    }
  };

  const handleReset = () => {
    localStorage.removeItem('walletPassword');
    setStoredPassword('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  return (
    <div>
      <h1>Welcome to Your Crypto Wallet</h1>
      {storedPassword ? (
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
