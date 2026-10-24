export default function TaskDetails({ task, onEdit, onBack }) {
  return (
    <article className="card task-details">
      <h2>{task.title}</h2>

      <p className={task.description ? 'task-description' : 'muted'}>
        {task.description || 'Sem descrição.'}
      </p>

      <p className="task-date">
        Criada em {new Date(task.created_at).toLocaleString('pt-BR')}
      </p>

      <div className="task-actions">
        <button type="button" className="btn btn-primary" onClick={onEdit}>
          Editar
        </button>
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          Voltar
        </button>
      </div>
    </article>
  );
}
