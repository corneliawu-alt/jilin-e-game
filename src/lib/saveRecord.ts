import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { UserInfo } from '../App';

const LOCAL_RECORDS_KEY = 'jilin-e-game-records';

export type SaveResult = 'cloud' | 'local';

export async function saveStudentRecord(
  userInfo: UserInfo,
  score: number,
): Promise<SaveResult> {
  const record = {
    ...userInfo,
    score,
    savedAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'studentRecords'), {
        ...userInfo,
        score,
        timestamp: serverTimestamp(),
      });
      return 'cloud';
    } catch (error) {
      console.warn('Firebase 上傳失敗，改存本機：', error);
    }
  }

  const existing = JSON.parse(localStorage.getItem(LOCAL_RECORDS_KEY) || '[]');
  existing.push(record);
  localStorage.setItem(LOCAL_RECORDS_KEY, JSON.stringify(existing));
  return 'local';
}
