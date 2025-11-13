import COS from 'cos-nodejs-sdk-v5'
import { env } from '../config/env'

type SongItem = {
  key: string
  name: string
  size: number
  lastModified: string
  url: string
}

function isAudio(key: string): boolean {
  const k = key.toLowerCase()
  return [
    '.mp3',
    '.flac',
    '.wav',
    '.m4a',
    '.aac',
    '.ogg'
  ].some((ext) => k.endsWith(ext))
}

function getClient() {
  return new COS({ SecretId: env.COS_SECRET_ID, SecretKey: env.COS_SECRET_KEY })
}

function getBucketContents(cos: COS): Promise<any[]> {
  return new Promise((resolve, reject) => {
    cos.getBucket(
      { Bucket: env.COS_BUCKET, Region: env.COS_REGION, Prefix: env.COS_SONGS_PREFIX },
      (err: any, data: any) => {
        if (err) {
          console.error('[cos] getBucket failed', err?.message || err)
          return reject(err)
        }
        resolve(data?.Contents || [])
      }
    )
  })
}

function getSignedUrl(cos: COS, key: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cos.getObjectUrl(
      { Bucket: env.COS_BUCKET, Region: env.COS_REGION, Key: key, Sign: true, Expires: env.COS_SIGN_EXPIRE_SECONDS },
      (err: any, data: any) => {
        if (err) {
          console.error('[cos] getObjectUrl failed', err?.message || err)
          return reject(err)
        }
        resolve(String(data?.Url || ''))
      }
    )
  })
}

export async function listSongs(): Promise<SongItem[]> {
  const ready = !!env.COS_BUCKET && !!env.COS_REGION && !!env.COS_SECRET_ID && !!env.COS_SECRET_KEY
  if (!ready) {
    console.warn('[cos] env missing: id=%s key=%s bucket=%s region=%s prefix=%s', !!env.COS_SECRET_ID, !!env.COS_SECRET_KEY, env.COS_BUCKET || '(missing)', env.COS_REGION || '(missing)', env.COS_SONGS_PREFIX || '(empty)')
    return []
  }
  try {
    const cos = getClient()
    const contents = await getBucketContents(cos)
    console.log('[cos] bucket objects=%s bucket=%s region=%s prefix=%s', contents.length || 0, env.COS_BUCKET, env.COS_REGION, env.COS_SONGS_PREFIX || '')
    const items = contents.filter((obj: any) => isAudio(String(obj.Key)))
    console.log('[cos] audio objects=%s', items.length || 0)
    const urls = await Promise.all(items.map((obj: any) => getSignedUrl(cos, String(obj.Key)).catch((e: any) => { console.error('[cos] sign error', e?.message || e); return '' })))
    return items.map((obj: any, i: number) => ({
      key: String(obj.Key),
      name: String(obj.Key).split('/').pop() || String(obj.Key),
      size: Number(obj.Size || 0),
      lastModified: String(obj.LastModified || ''),
      url: urls[i]
    }))
  } catch (e: any) {
    console.error('[cos] listSongs failed', e?.message || e)
    return []
  }
}

export async function signUrl(key: string): Promise<string> {
  if (!env.COS_BUCKET || !env.COS_REGION || !env.COS_SECRET_ID || !env.COS_SECRET_KEY) {
    return ''
  }
  const cos = getClient()
  try {
    return await getSignedUrl(cos, key)
  } catch {
    return ''
  }
}