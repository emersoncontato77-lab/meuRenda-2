// components/LoginPage.js

import React, { useState } from "react";
import { loginUser, registerUser } from "../auth";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    let result;

    if (isRegister) {
      result = await registerUser(email, password);
    } else {
      result = await loginUser(email, password);
    }

    setLoading(false);

    if (result.ok) {
      onLogin(result.user);
    } else {
      setErrorMsg(result.error);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2 style={styles.title}>
          {isRegister ? "Criar Conta" : "Entrar no MeuRenda+"}
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button disabled={loading} style={styles.button}>
            {loading
              ? "Carregando..."
              : isRegister
              ? "Criar Conta"
              : "Entrar"}
          </button>

          {errorMsg && <p style={styles.error}>{errorMsg}</p>}
        </form>

        <p
          style={styles.toggle}
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? "Já tem conta? Entrar"
            : "Não tem conta? Criar agora"}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#0d0d0d",
    color: "#fff",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  box: {
    backgroundColor: "#1a1a1a",
    padding: 25,
    borderRadius: 12,
    width: "100%",
    maxWidth: 350,
    textAlign: "center"
  },
  title: {
    marginBottom: 20
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  input: {
    padding: 12,
    borderRadius: 8,
    border: "none",
    backgroundColor: "#262626",
    color: "#fff",
    fontSize: 15
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    border: "none",
    color: "#fff",
    fontSize: 15,
    cursor: "pointer"
  },
  toggle: {
    marginTop: 15,
    color: "#4CAF50",
    cursor: "pointer"
  },
  error: {
    color: "red",
    fontSize: 14,
    marginTop: 10
  }
};