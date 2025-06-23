
import React, { useState, useEffect } from 'react';
import LoginPage from '../components/LoginPage';
import Dashboard from '../components/Dashboard';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('kairo_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (username: string, password: string) => {
    if (username === '1234' && password === '1234') {
      setIsAuthenticated(true);
      localStorage.setItem('kairo_auth', 'true');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('kairo_auth');
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
};

export default Index;
