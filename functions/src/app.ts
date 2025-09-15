import cors, { CorsOptions } from "cors";
import express from "express";

import todosRouter from "./api/todos.router";
import usersRouter from "./api/users.router";
import { getAllowedOrigins } from "./config/env";

const app = express();
app.use(express.json());

const allowed = new Set(getAllowedOrigins());

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowed.has(origin)) {
      return callback(null, true);
    }

    try {
      const { hostname, protocol } = new URL(origin);
      if (
        (protocol === "https:" && (
          hostname.endsWith(".web.app") ||
          hostname.endsWith(".firebaseapp.com")
        )) ||
        origin === "http://localhost:4200"
      ) {
        return callback(null, true);
      }
    } catch {
      console.warn("[CORS] Rechazado origin:", origin, "Allowlist:", Array.from(allowed));
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use("/auth", usersRouter);
app.use("/users", todosRouter);

export default app;
