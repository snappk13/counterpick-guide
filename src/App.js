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

export default function CounterpickGuide() {
  const [selectedId, setSelectedId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [counterTable, setCounterTable] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [tempCounters, setTempCounters] = useState({});
  const [user, setUser] = useState(null);

  const isAdmin = user?.email === "snappk13@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const ref = doc(db, "data", "counterTable");
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setCounterTable(snapshot.data());
      }
    };
    fetchData();
  }, []);

  const saveToFirebase = async (updatedTable) => {
    const ref = doc(db, "data", "counterTable");
    await setDoc(ref, updatedTable);
  };

  const getClass = (unitId) => {
    if (selectedId === null) return "opacity-100";
    if (unitId === selectedId) return "border-4 border-blue-500 opacity-100";
    if (counterTable[selectedId]?.S?.some((u) => u.id === unitId)) return "border-4 border-green-500 opacity-100";
    if (counterTable[selectedId]?.B?.some((u) => u.id === unitId)) return "border-4 border-orange-500 opacity-100";
    return "opacity-30";
  };

  const getUnitsByEntries = (entries) =>
    entries
      .map(({ id, score }) => ({
        ...mockUnits.find((u) => u.id === id),
        score,
      }))
      .sort((a, b) => b.score - a.score);

  const handleUnitClick = (unitId) => {
    if (editMode && editingCategory) {
      setTempCounters((prev) => {
        const list = prev[editingCategory] || [];
        const exists = list.find((entry) => entry.id === unitId);
        return {
          ...prev,
          [editingCategory]: exists
            ? list.filter((entry) => entry.id !== unitId)
            : [...list, { id: unitId, score: 5 }],
        };
      });
    } else {
      setSelectedId(unitId);
    }
  };

  const handleScoreChange = (category, unitId, score) => {
    setTempCounters((prev) => ({
      ...prev,
      [category]: prev[category].map((entry) =>
        entry.id === unitId ? { ...entry, score: Number(score) } : entry
      ),
    }));
  };

  const startEditing = () => {
    if (selectedId !== null) {
      setTempCounters({
        S: [...(counterTable[selectedId]?.S || [])],
        B: [...(counterTable[selectedId]?.B || [])],
      });
      setEditMode(true);
      setEditingCategory(null);
    }
  };

  const saveChanges = async () => {
    const updated = {
      ...counterTable,
      [selectedId]: tempCounters,
    };
    setCounterTable(updated);
    await saveToFirebase(updated);
    setEditMode(false);
    setEditingCategory(null);
  };

  const loginAsAdmin = () => {
    signInWithEmailAndPassword(auth, "snappk13@gmail.com", prompt("Введите пароль:"))
      .catch((err) => alert("Ошибка входа: " + err.message));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Гид по контрпикам</h1>

      {!user && (
        <button
          onClick={loginAsAdmin}
          className="mb-4 px-4 py-2 bg-blue-700 text-white rounded"
        >Войти для редактирования</button>
      )}

      {isAdmin && (
        <div className="mb-4 space-x-2">
          <button
            onClick={startEditing}
            disabled={selectedId === null}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >Редактировать</button>
          {editMode && (
            <>
              <button
                onClick={() => setEditingCategory("S")}
                className={`px-4 py-2 rounded ${editingCategory === "S" ? "bg-green-600 text-white" : "bg-green-200"}`}
              >Категория S</button>
              <button
                onClick={() => setEditingCategory("B")}
                className={`px-4 py-2 rounded ${editingCategory === "B" ? "bg-orange-600 text-white" : "bg-orange-200"}`}
              >Категория B</button>
              <button
                onClick={saveChanges}
                className="px-4 py-2 bg-gray-800 text-white rounded"
              >Сохранить</button>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-10 gap-4">
        {mockUnits.map((unit) => (
          <div
            key={unit.id}
            onClick={() => handleUnitClick(unit.id)}
            className={`cursor-pointer bg-white shadow ${getClass(unit.id)}`}
            style={{ width: '100px', height: '100px' }}
          >
            <img src={unit.icon} alt={unit.name} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {editMode && editingCategory && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Редактирование категории {editingCategory}</h2>
          <div className="flex flex-wrap gap-4">
            {(tempCounters[editingCategory] || []).map((entry) => {
              const unit = mockUnits.find((u) => u.id === entry.id);
              return (
                <div key={entry.id} className="flex flex-col items-center">
                  <img
                    src={unit.icon}
                    alt={unit.name}
                    className="w-[80px] h-[80px] object-cover rounded"
                  />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={entry.score}
                    onChange={(e) => handleScoreChange(editingCategory, entry.id, e.target.value)}
                    className="mt-1 w-[80px] text-center border border-gray-400 rounded"
                  />
                  <button
                    onClick={() => handleUnitClick(entry.id)}
                    className="mt-1 text-xs text-red-600 underline"
                  >Удалить</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedId !== null && !editMode && (
        <>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Лучшие контры (S):</h2>
            <div className="flex flex-wrap gap-2">
              {getUnitsByEntries(counterTable[selectedId]?.S || []).map((unit) => (
                <div
                  key={unit.id}
                  className="flex flex-col items-center justify-center bg-white shadow border border-green-400"
                  style={{ width: '100px', height: '100px' }}
                >
                  <img src={unit.icon} alt={unit.name} className="w-full h-full object-cover" />
                  <div className="text-xs text-center text-green-700 bg-white w-full py-1 -mt-5">
                    Рейтинг: {unit.score}/10
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Хорошие контры (B):</h2>
            <div className="flex flex-wrap gap-2">
              {getUnitsByEntries(counterTable[selectedId]?.B || []).map((unit) => (
                <div
                  key={unit.id}
                  className="flex flex-col items-center justify-center bg-white shadow border border-orange-400"
                  style={{ width: '100px', height: '100px' }}
                >
                  <img src={unit.icon} alt={unit.name} className="w-full h-full object-cover" />
                  <div className="text-xs text-center text-orange-700 bg-white w-full py-1 -mt-5">
                    Рейтинг: {unit.score}/10
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
