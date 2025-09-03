import express from "express"
import { v4 as uuidv4 } from 'uuid'
import client from "../database/redis.js"

const router = express.Router()

router.post('/start', async (req, res) => {
  const guestId = uuidv4()
  const key = `guest:session:${guestId}`

 k
  await client.set(key, JSON.stringify({
    playCount: 0,
    streak: 0,
    createdAt: Date.now(),
  }), { EX: 86400 }) 

  res.json({ guestId });
});


router.post('/answer', async (req, res) => {
  const { guestId } = req.body;
  const key = `guest:session:${guestId}`
  const session = JSON.parse(await client.get(key))

  if (!session) return res.status(401).json({ success: false, message: 'Session expired' })
  if (session.playCount >= 10) return res.status(403).json({ success: false, message: 'Daily cap reached' })

  session.playCount++
  await client.set(key, JSON.stringify(session), { EX: 86400 })

  res.json({ success: true, playCount: session.playCount });
});

export default router;