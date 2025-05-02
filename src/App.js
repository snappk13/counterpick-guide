import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDR7PW9uMZg7aHUtqdhQdWeagbUrGjyLgI",
  authDomain: "mech-app-f3344.firebaseapp.com",
  projectId: "mech-app-f3344",
  storageBucket: "mech-app-f3344.appspot.com",
  messagingSenderId: "337297229776",
  appId: "1:337297229776:web:6bd251179d6dc2d33c9bd5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const mockUnits = Array.from({ length: 30 }, (_, i) => {
  const customIcons = {
    0: "https://mechamonarch.com/wp-content/uploads/Crawler.jpg",
    1: "https://mechamonarch.com/wp-content/uploads/Fang.jpg",
    2: "https://mechamonarch.com/wp-content/uploads/Mustang.jpg",
  };

  return {
    id: i,
    name: `Unit ${i + 1}`,
    icon: customIcons[i] || `https://via.placeholder.com/64?text=U${i + 1}`,
  };
});

// ... остальной код оставлен прежним (см. предыдущую версию textdoc)
export default function CounterpickGuide() {
  // реализовано выше
}