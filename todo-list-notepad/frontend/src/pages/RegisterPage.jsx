import { useState } from 'react';
import { register } from '../services/api.js';

export default function RegisterPage({ onRegistered, onBackToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(name, email, password);
      onRegistered();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="card auth-card">
        <h1>Todo List Notepad</h1>

        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="register-name">Nome</label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="register-email">E-mail</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="register-password">Senha</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            Criar conta
          </button>
        </form>

        <div className="auth-switch">
          <button type="button" className="btn btn-link" onClick={onBackToLogin}>
            Voltar ao login
          </button>
        </div>
      </section>
    </main>
  );
}
