import { postJson } from './http'

export type LoginResponse = {
  token: string
  user: { id: number; username: string; nickname: string | null; roleId?: number; roleCode?: string }
}

export async function login(username: string, password: string) {
  return postJson<LoginResponse>('/auth/login', { username, password })
}

export type RegisterResponse = { id: number; username: string; nickname: string | null; roleId?: number; roleCode?: string }
export async function register(username: string, password: string, nickname?: string | null) {
  return postJson<RegisterResponse>('/auth/register', { username, password, nickname })
}