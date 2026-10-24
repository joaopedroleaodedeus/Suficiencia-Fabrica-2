async function request(method, path, body) {
  let res;
  try {
    res = await fetch('/api' + path, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor.');
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.error || 'Erro inesperado.');
    error.status = res.status;
    throw error;
  }
  return data;
}

export const register = (name, email, password) =>
  request('POST', '/auth/register', { name, email, password });

export const login = (email, password) =>
  request('POST', '/auth/login', { email, password });

export const logout = () => request('POST', '/auth/logout');

export const getMe = () => request('GET', '/auth/me');

export const listTasks = () => request('GET', '/tasks');

export const getTask = (id) => request('GET', `/tasks/${id}`);

export const createTask = (title, description) =>
  request('POST', '/tasks', { title, description });

export const updateTask = (id, title, description) =>
  request('PUT', `/tasks/${id}`, { title, description });

export const deleteTask = (id) => request('DELETE', `/tasks/${id}`);
