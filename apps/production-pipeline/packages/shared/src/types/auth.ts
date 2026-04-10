export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  name: string
  password: string
}

export interface AuthResponse {
  user: AuthUser
}
