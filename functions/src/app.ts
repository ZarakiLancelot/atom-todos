import cors from "cors";
import express from "express";

import todosRouter from "./api/todos.router";
import usersRouter from "./api/users.router";
import { getAllowedOrigins } from "./config/env";

const app = express();
app.use(express.json());

const allowed = new Set(getAllowedOrigins());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowed.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use("/auth", usersRouter);
app.use("/users", todosRouter);

export default app;
