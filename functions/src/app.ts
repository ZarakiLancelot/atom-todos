import cors from "cors";
import express from "express";

import todosRouter from "./api/todos.router";
import usersRouter from "./api/users.router";

const app = express();
app.use(express.json());

app.use(cors({ origin: true, credentials: true }));

app.use("/auth", usersRouter);
app.use("/users", todosRouter);

export default app;
