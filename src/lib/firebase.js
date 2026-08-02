import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyD5y4YQXzD8-7BT9eQgz67ABES6Eh5fBTc",
  authDomain: "study-hub-v2.firebaseapp.com",
  projectId: "study-hub-v2",
  storageBucket: "study-hub-v2.firebasestorage.app",
  messagingSenderId: "99743138752",
  appId: "1:99743138752:web:9c1d720e23fb168bc07e25",
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app