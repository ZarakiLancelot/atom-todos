import express from 'express';
import cors from 'cors';
import usersRouter from './api/users.router';
import todosRouter from './api/todos.router';

const app = express();
app.use(express.json());

app.use(cors({ origin: true, credentials: true }));

app.use('/auth', usersRouter);
app.use('/users', todosRouter);

export default app;
