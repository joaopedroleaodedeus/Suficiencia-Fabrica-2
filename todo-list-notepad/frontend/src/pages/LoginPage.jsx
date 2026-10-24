import { useState } from 'react';
import { login } from '../services/api.js';

export default function LoginPage({ onLogin, onCreateAccount, successMessage }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(email, password);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="card auth-card">
        <h1>Todo List Notepad</h1>

        {successMessage && (
          <p className="message success" role="status">
            {successMessage}
          </p>
        )}
        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email">E-mail</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Senha</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            Entrar
          </button>
        </form>

        <div className="auth-switch">
          <button type="button" className="btn btn-link" onClick={onCreateAccount}>
            Criar conta
          </button>
        </div>
      </section>
    </main>
  );
}
