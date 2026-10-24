import { useEffect, useState } from 'react';
import { getMe, logout } from './services/api.js';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TasksPage from './pages/TasksPage.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    getMe()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function showLogin(message = '') {
    setNotice(message);
    setView('login');
  }

  function handleLogin(loggedUser) {
    setNotice('');
    setUser(loggedUser);
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Mesmo sem resposta do servidor, o cliente volta para o login.
    }
    setUser(null);
    showLogin();
  }

  function handleSessionExpired() {
    setUser(null);
    showLogin();
  }

  if (loading) {
    return (
      <div className="container">
        <p>Carregando...</p>
      </div>
    );
  }

  if (user) {
    return (
      <TasksPage
        user={user}
        onLogout={handleLogout}
        onSessionExpired={handleSessionExpired}
      />
    );
  }

  if (view === 'register') {
    return (
      <RegisterPage
        onRegistered={() => showLogin('Conta criada com sucesso! Faça login.')}
        onBackToLogin={() => showLogin()}
      />
    );
  }

  return (
    <LoginPage
      onLogin={handleLogin}
      onCreateAccount={() => {
        setNotice('');
        setView('register');
      }}
      successMessage={notice}
    />
  );
}
