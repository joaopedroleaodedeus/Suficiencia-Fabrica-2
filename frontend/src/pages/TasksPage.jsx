import { useEffect, useState } from 'react';
import {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '../services/api.js';
import TaskForm from '../components/TaskForm.jsx';
import TaskDetails from '../components/TaskDetails.jsx';

export default function TasksPage({ user, onLogout, onSessionExpired }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('list');
  const [current, setCurrent] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleError(err) {
    if (err.status === 401) {
      onSessionExpired();
      return;
    }
    setError(err.message);
  }

  useEffect(() => {
    let active = true;
    listTasks()
      .then((data) => {
        if (active) setTasks(data.tasks);
      })
      .catch((err) => {
        if (active) handleError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearFeedback() {
    setError('');
    setSuccess('');
  }

  function backToList() {
    setCurrent(null);
    setMode('list');
  }

  function openCreate() {
    clearFeedback();
    setCurrent(null);
    setMode('create');
  }

  function openEdit(task) {
    clearFeedback();
    setCurrent(task);
    setMode('edit');
  }

  async function openDetails(id) {
    clearFeedback();
    try {
      const data = await getTask(id);
      setCurrent(data.task);
      setMode('details');
    } catch (err) {
      handleError(err);
    }
  }

  async function handleCreate(title, description) {
    clearFeedback();
    try {
      const data = await createTask(title, description);
      setTasks((prev) => [...prev, data.task]);
      setSuccess('Tarefa criada.');
      backToList();
    } catch (err) {
      handleError(err);
    }
  }

  async function handleUpdate(title, description) {
    clearFeedback();
    try {
      const data = await updateTask(current.id, title, description);
      setTasks((prev) =>
        prev.map((task) => (task.id === data.task.id ? data.task : task)),
      );
      setSuccess('Tarefa atualizada.');
      backToList();
    } catch (err) {
      handleError(err);
    }
  }

  async function handleDelete(task) {
    if (!window.confirm('Excluir esta tarefa?')) return;
    clearFeedback();
    try {
      await deleteTask(task.id);
      setTasks((prev) => prev.filter((item) => item.id !== task.id));
      setSuccess('Tarefa excluída.');
    } catch (err) {
      handleError(err);
    }
  }

  return (
    <div className="container">
      <header className="app-header">
        <div>
          <h1>Todo List Notepad</h1>
          <p className="greeting">Olá, {user.name}</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={onLogout}>
          Sair
        </button>
      </header>

      {error && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="message success" role="status">
          {success}
        </p>
      )}

      {mode === 'list' && (
        <>
          <div className="toolbar">
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              Nova tarefa
            </button>
          </div>

          <section className="card notepad">
            {loading && <p>Carregando...</p>}
            {!loading && tasks.length === 0 && !error && (
              <p className="empty">Nenhuma tarefa cadastrada.</p>
            )}
            {!loading && tasks.length > 0 && (
              <ul className="task-list">
                {tasks.map((task) => (
                  <li key={task.id} className="task-item">
                    <div className="task-info">
                      <span className="task-title">{task.title}</span>
                      <span className="task-date">
                        {new Date(task.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="task-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => openDetails(task.id)}
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => openEdit(task)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleDelete(task)}
                      >
                        Excluir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {mode === 'create' && (
        <section className="card">
          <TaskForm
            onSubmit={handleCreate}
            onCancel={backToList}
            submitLabel="Salvar"
          />
        </section>
      )}

      {mode === 'edit' && current && (
        <section className="card">
          <TaskForm
            initial={current}
            onSubmit={handleUpdate}
            onCancel={backToList}
            submitLabel="Salvar"
          />
        </section>
      )}

      {mode === 'details' && current && (
        <TaskDetails
          task={current}
          onEdit={() => openEdit(current)}
          onBack={backToList}
        />
      )}
    </div>
  );
}
