// src/main.jsx

import React, { useState } from "react";
import ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./main.css";

import Grid from "./Grid.jsx";
import Presets from "./Presets.jsx";
import Login from "./Login.jsx";

const INVALID_TOKEN = "INVALID_TOKEN";

function HomePage() {
  return (
    <>
      <Grid />
      <Presets />
    </>
  );
}

function MyApp() {
  const [token, setToken] = useState(INVALID_TOKEN);
  const [message, setMessage] = useState("");

  function loginUser(creds) {
    fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(creds),
    })
      .then((response) => {
        if (response.status === 200) {
          response.json().then((payload) => {
            setToken(payload.token);
            setMessage("Login successful; auth token saved");
          });
        } else {
          setMessage("Login failed");
        }
      })
      .catch((error) => {
        setMessage(`Login error: ${error}`);
      });
  }

  return (
    <BrowserRouter>
      <p style={{ color: "white" }}>{message}</p>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login handleSubmit={loginUser} />} />
      </Routes>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

root.render(<MyApp />);
