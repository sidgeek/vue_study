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

export async function listUsers(page = 1, pageSize = 10) {
  const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  return getJson<UserListResponse>(`/users?${q.toString()}`)
}