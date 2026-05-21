// src/main.jsx

import React, { useState } from "react";
import ReactDOMClient from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./main.css";

import Grid from "./Grid.jsx";
import Presets from "./Presets.jsx";
import Login from "./Login.jsx";
import Items from "./Items.jsx";

const INVALID_TOKEN = "INVALID_TOKEN";

function HomePage() {
  return (
    <div className="app">
      <Presets />
      <Grid />
      <Items />
    </div>
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

  function signupUser(creds) {
    fetch("http://localhost:8000/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(creds),
    })
      .then((response) => {
        if (response.status === 201) {
          response.json().then((payload) => {
            setToken(payload.token);
            setMessage(
              `Signup successful for user: ${creds.username}`,
            );
          });
        } else {
          setMessage("Signup failed");
        }
      })
      .catch((error) => {
        setMessage(`Signup error: ${error}`);
      });
  }

  function testProtectedRoute() {
    fetch("http://localhost:8000/protected", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.text())
      .then((data) => {
        setMessage(data);
      })
      .catch((error) => {
        setMessage(`Error: ${error}`);
      });
  }

  return (
  <BrowserRouter>
    <p style={{ color: "white" }}>{message}</p>

    <button onClick={testProtectedRoute}>
      Test Protected Route
    </button>

    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/login"
        element={<Login handleSubmit={loginUser} />}
      />

      <Route
        path="/signup"
        element={
          <Login
            handleSubmit={signupUser}
            buttonLabel="Sign Up"
          />
        }
      />
    </Routes>
  </BrowserRouter>
);
}

const container = document.getElementById("root");
const root = ReactDOMClient.createRoot(container);

root.render(<MyApp />);
ReactDOM.createRoot(document.getElementById("root")).render(<MyApp />);
