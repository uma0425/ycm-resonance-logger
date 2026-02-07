import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, onValue, off } from 'firebase/database'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let app = null
let db = null

function isConfigured() {
  return !!(
    config.apiKey &&
    config.databaseURL &&
    config.projectId
  )
}

function getDb() {
  if (!isConfigured()) return null
  if (!db) {
    app = initializeApp(config)
    db = getDatabase(app)
  }
  return db
}

const TAPS_PATH = 'resonance/taps'

/**
 * タップ1回を Firebase に送信（全参加者集計用）
 * @returns {Promise<boolean>} 送信できた場合 true
 */
export async function pushTap() {
  const database = getDb()
  if (!database) return false
  try {
    const tapsRef = ref(database, TAPS_PATH)
    await push(tapsRef, { t: Date.now() })
    return true
  } catch (_) {
    return false
  }
}

/**
 * Firebase のタップ一覧を購読。コールバックに { [pushId]: { t } } が渡る
 * @param {(snapshot: { [key: string]: { t: number } }) => void} callback
 * @returns {() => void} 購読解除関数
 */
export function subscribeToTaps(callback) {
  const database = getDb()
  if (!database) return () => {}
  const tapsRef = ref(database, TAPS_PATH)
  const handler = (snapshot) => {
    const val = snapshot.val()
    callback(val || {})
  }
  onValue(tapsRef, handler)
  return () => off(tapsRef)
}

export { isConfigured }
