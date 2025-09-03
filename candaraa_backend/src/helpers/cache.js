import client from "../database/redis.js"

export async function setCache(key, value, ttl = 300) {
  try {
    await client.set(key, JSON.stringify(value), { EX: ttl })
  } catch (err) {
    console.error("Redis set error:", err)
  }
}

export async function getCache(key) {
  try {
    const data = await client.get(key)
    return data ? JSON.parse(data) : null
  } catch (err) {
    console.error("Redis get error:", err)
    return null
  }
}

export async function delCache(key) {
  try {
    await client.del(key)
  } catch (err) {
    console.error("Redis delete error:", err)
  }
}
