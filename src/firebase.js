import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBJvi2AkRe-WQMENRuWB_hIF4gps546_Es",
  authDomain: "kojiki-d26c5.firebaseapp.com",
  projectId: "kojiki-d26c5",
  storageBucket: "kojiki-d26c5.appspot.com",
  messagingSenderId: "970918994826",
  appId: "1:970918994826:web:32f235a9bd3fe210061e73",
  measurementId: "G-8RFWBDVDH0",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

export const storage = getStorage(app);

export default app;
