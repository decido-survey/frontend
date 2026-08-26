export interface UserResponse {
  id: string;
  pseudo: string;
  email: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface LoginRequest {
  pseudoOrEmail: string;
  password?: string;
}

export interface RegisterRequest {
  pseudo: string;
  email?: string;
  password?: string;
}