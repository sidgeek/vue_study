import { getJson } from './http'

export type UserItem = {
  id: number
  username: string
  nickname: string | null
}

export type UserListResponse = {
  items: UserItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export async function listUsers(page = 1, pageSize = 10, username?: string) {
  const params: Record<string, string> = { page: String(page), pageSize: String(pageSize) }
  if (username && username.trim()) params.username = username.trim()
  const q = new URLSearchParams(params)
  return getJson<UserListResponse>(`/users?${q.toString()}`)
}