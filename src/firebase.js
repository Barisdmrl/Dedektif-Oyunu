// Firebase yapılandırması
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase config - Firebase Console'dan alınan bilgiler
const firebaseConfig = {
  apiKey: "AIzaSyBbIdI5RLdjQo_5Gmy4SXhf1JIt1es1qDg",
  authDomain: "dedektif-oyunu-32fe1.firebaseapp.com",
  databaseURL: "https://dedektif-oyunu-32fe1-default-rtdb.firebaseio.com",
  projectId: "dedektif-oyunu-32fe1",
  storageBucket: "dedektif-oyunu-32fe1.firebasestorage.app",
  messagingSenderId: "605502397603",
  appId: "1:605502397603:web:1e026aa59eadb5108a7316",
  measurementId: "G-SFC1V1NGVY"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Realtime Database referansı
export const database = getDatabase(app);

export default app; 