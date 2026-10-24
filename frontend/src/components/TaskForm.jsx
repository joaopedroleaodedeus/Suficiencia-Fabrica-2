import { useState } from 'react';

export default function TaskForm({ initial, onSubmit, onCancel, submitLabel = 'Salvar' }) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('O título é obrigatório.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(cleanTitle, description);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      {error && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}

      <div className="field">
        <label htmlFor="task-title">Título</label>
        <input
          id="task-title"
          type="text"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="task-description">Descrição</label>
        <textarea
          id="task-description"
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitLabel}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
