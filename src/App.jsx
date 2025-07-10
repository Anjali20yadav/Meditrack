import React, { useState } from 'react';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from './pages/Dashboard';

function App() {
  const [showLogin, setShowLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // 🔁 always false on load

  return (
    <div>
      {isAuthenticated ? (
        <Dashboard onLogout={() => setIsAuthenticated(false)} />
      ) : showLogin ? (
        <Login
          switchToRegister={() => setShowLogin(false)}
          onLoginSuccess={() => setIsAuthenticated(true)} // ✅ triggers on login
        />
      ) : (
        <Register switchToLogin={() => setShowLogin(true)} />
      )}
    </div>
  );
}

export default App;
