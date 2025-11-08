export interface UserEntity {
  id: number
  username: string
  passwordHash: string
  nickname?: string | null
  roleId: number
  createdAt: Date
}

export interface UserRepo {
  findByUsername(username: string): Promise<UserEntity | null>
  findById(id: number): Promise<UserEntity | null>
  create(data: { username: string; passwordHash: string; nickname?: string | null }): Promise<UserEntity>
  list(params: { page: number; pageSize: number }): Promise<{ items: UserEntity[]; total: number }>
  updateRole(id: number, roleId: number): Promise<UserEntity>
}