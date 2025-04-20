import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  created_date: string;
}

export interface UserCreate {
  username: string;
  password: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  password?: string;
  role?: string;
  is_active?: boolean;
}

// Dohvaćanje trenutnog korisnika
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/users/me');
  return response.data;
};

// Dohvaćanje svih korisnika
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>('/users');
  return response.data;
};

// Kreiranje novog korisnika
export const createUser = async (user: UserCreate): Promise<User> => {
  const response = await api.post<User>('/users', user);
  return response.data;
};

// Ažuriranje korisnika
export const updateUser = async (id: number, user: UserUpdate): Promise<User> => {
  const response = await api.put<User>(`/users/${id}`, user);
  return response.data;
};

// Brisanje korisnika
export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};
