"use client";
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, set } from "firebase/database";
import { Avatar, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const firebaseConfig = {
  apiKey: "AIzaSyAli6KOYZNuPL5RY2xR626oa3ZxXg6RIso",
  authDomain: "promille-tms.firebaseapp.com",
  databaseURL:
    "https://promille-tms-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "promille-tms",
  storageBucket: "promille-tms.appspot.com",
  messagingSenderId: "426492690423",
  appId: "1:426492690423:web:8a8085dc3577aff36778f2",
  measurementId: "G-WH3FFN4LVJ",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

interface User {
  name: string;
  promille: number;
  weight: number;
  pic: string;
}

function initDB() {
  const tms: User = {
    name: "Theo",
    promille: 0,
    weight: 65,
    pic: "/static/images/avatar/theo.jpg",
  };

  const mw: User = {
    name: "Marcus",
    promille: 0,
    weight: 10000,
    pic: "/static/images/avatar/marcus.jpg",
  };

  const sd: User = {
    name: "Simon",
    promille: 0,
    weight: 10000,
    pic: "/static/images/avatar/simon.jpg",
  };

  set(ref(db, "promille/"), [tms, mw, sd]);
}

export default function Home() {
  const [promille, setPromille] = useState<User[]>([]);

  initDB();

  useEffect(() => {
    onValue(ref(db, "promille/"), (snapshot) => {
      const data = snapshot.val();
      setPromille(data);
    });
  }, []);

  console.log(promille);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {promille.map((user) => (
        <Box
          key={user.name}
          className="flex items-center"
          sx={{
            width: 200,
            height: 50,
            marginRight: 24,
            backgroundColor: "primary.dark",
          }}
        >
          <Avatar src={user.pic} />
          <Typography variant="h4">{user.name}</Typography>
          <Typography variant="h4">{user.promille}</Typography>
        </Box>
      ))}
    </main>
  );
}
