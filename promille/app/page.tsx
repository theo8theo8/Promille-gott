"use client";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  increment,
  onValue,
  ref,
  set,
  update,
} from "firebase/database";
import {
  Avatar,
  Box,
  Button,
  Fab,
  FormControl,
  FormHelperText,
  InputAdornment,
  Modal,
  OutlinedInput,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { SportsBar } from "@mui/icons-material";
import {
  LocalizationProvider,
  MobileDateTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/sv";

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

interface Drink {
  volume: number;
  abv: number;
  time: Dayjs | null;
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
    weight: 110,
    pic: "/static/images/avatar/marcus.png",
  };

  const sd: User = {
    name: "Simon",
    promille: 0,
    weight: 85,
    pic: "/static/images/avatar/simon.jpg",
  };

  set(ref(db, "users/"), [tms, mw, sd]);
  set(ref(db, "latestUpdate/"), dayjs(new Date()).format());
}

const test: User = {
  name: "Test",
  promille: 0,
  weight: 10,
  pic: "/static/images/avatar/test.jpg",
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [currDrink, setCurrDrink] = useState<Drink>({} as Drink);
  const [currModalUser, setCurrModalUser] = useState<User>(test);
  const [modalOpen, setModalOpen] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState<Dayjs>(dayjs(new Date()));

  function handleModalOpen(user: User) {
    setCurrModalUser(user);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    if (currDrink.volume && currDrink.abv /*&& currDrink.time*/) {
      calcPromille();
    }

    currDrink.volume = 0;
    currDrink.abv = 0;
    currDrink.time = null;
  }

  function handleTimeChoice(date: Dayjs | null) {
    console.log("GHJKR");
    let use = dayjs(new Date());
    if (date) {
      use = date;
    }
    setCurrDrink({
      ...currDrink,
      time: use,
    });
  }

  function calcPromille() {
    updateMetabolism();

    let bac: number =
      ((currDrink.volume * 10 * currDrink.abv) /
        100 /
        (currModalUser.weight * 1000 * 0.68)) *
      1000;
    const userIndex = users.findIndex(
      (user) => user.name === currModalUser.name
    );
    let timeDiff = 0;
    if (currDrink.time) {
      timeDiff = dayjs(new Date()).diff(currDrink.time, "minute");
    }
    bac -= timeDiff * 0.0025;

    update(ref(db, `users/${userIndex}`), { promille: increment(bac) });
  }

  function updateMetabolism() {
    const currDate = dayjs(new Date());
    const minuteDiff = currDate.diff(latestUpdate, "minute");
    if (minuteDiff > 0) {
      let dec = minuteDiff * 0.0025;
      users.forEach((user) => {
        const userIndex = users.findIndex((u) => u.name === user.name);
        if (dec >= user.promille) {
          dec = user.promille;
        } else {
          dec = minuteDiff * 0.0025;
        }

        update(ref(db, `users/${userIndex}`), {
          promille: increment(-dec),
        });
      });
      set(ref(db, "latestUpdate/"), currDate.format());
    }
  }

  //initDB();

  useEffect(() => {
    onValue(ref(db, "users/"), (snapshot) => {
      const data = snapshot.val();
      setUsers(data);
    });
    onValue(ref(db, "latestUpdate/"), (snapshot) => {
      const data = snapshot.val();
      setLatestUpdate(dayjs(data));
    });
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="sv">
      <main className="flex min-h-screen flex-col items-center justify-between px-24 py-4">
        <Typography variant="h4" color="black" textAlign="center">TMS Promilleräknare</Typography>
        {users.map((user) => (
          
          <Box
            key={user.name}
            className="flex justify-center items-center flex-row flex-wrap"
            sx={{
              backgroundColor: "#30BA39",
              borderRadius: 5,
              margin: 2,
            }}
          >
            <Box className="flex items-center space-x-4  mx-4">
              <Box
                className="flex flex-col items-center"
                sx={{
                  padding: 1,
                  margin: 2,
                  borderRadius: 3,
                  backgroundColor: "#008612",
                }}
              >
                <Avatar src={user.pic} />
                <Typography variant="h5">{user.name}</Typography>
              </Box>
              <Typography variant="h5">
                {Math.round(user.promille * 100) / 100}‰
              </Typography>
              <Typography variant="h5">{Math.floor(user.promille/0.0025)}min</Typography>
              </Box>
            <Box className="mr-4">
              <Fab
                onClick={() => handleModalOpen(user)}
                variant="extended"
                color="success"
                sx={{
                  margin: 2,
                }}
              >
                <SportsBar />
                Add drink
              </Fab>
            </Box>
          </Box>
        ))}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
            <Box
              className="flex flex-col items-center justify-center"
              sx={{
                backgroundColor: "white",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <Typography variant="h3" color="DimGray">Add drink</Typography>
              <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
                <OutlinedInput
                  id="outlined-adornment-weight"
                  endAdornment={
                    <InputAdornment position="end">cl</InputAdornment>
                  }
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    "aria-label": "weight",
                  }}
                  onChange={(e) =>
                    setCurrDrink({
                      ...currDrink,
                      volume: parseInt(e.target.value),
                    })
                  }
                />
                <FormHelperText id="outlined-weight-helper-text">
                  Volume
                </FormHelperText>
              </FormControl>
              <Typography variant="h4" color="DimGray">of</Typography>
              <FormControl sx={{ m: 1, width: "25ch" }} variant="outlined">
                <OutlinedInput
                  id="outlined-adornment-weight"
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  aria-describedby="outlined-weight-helper-text"
                  inputProps={{
                    "aria-label": "weight",
                  }}
                  onChange={(e) =>
                    setCurrDrink({
                      ...currDrink,
                      abv: parseFloat(e.target.value),
                    })
                  }
                />
                <FormHelperText id="outlined-weight-helper-text">
                  ABV
                </FormHelperText>
              </FormControl>
              <Typography variant="h4" color="DimGray">at</Typography>
              <MobileDateTimePicker
                defaultValue={dayjs(new Date())}
                onAccept={(e) => handleTimeChoice(e)}
              />
              <Button
                onClick={() => handleModalClose()}
                color="success"
                sx={{
                  margin: 2,
                }}
              >
                Add drink
              </Button>
            </Box>
          </Modal>
        <Button onClick={updateMetabolism}>Update Metabolism </Button>
      </main>
    </LocalizationProvider>
  );
}
