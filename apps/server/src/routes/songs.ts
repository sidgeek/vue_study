import Router from '@koa/router'
import { listSongs } from '../services/cos'

export function buildSongsRouter() {
  const router = new Router()
  router.get('/', async (ctx) => {
    const items = await listSongs()
    ctx.body = { items }
  })
  return router
}