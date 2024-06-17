import express from 'express';
import cors from 'cors';

import {
  auth,
  requestLogger,
  tokenExtractor,
  userExtractor,
  errorHandler,
  unknownEndpoint
} from './utils/middleware';
import authRouter from './routes/authentication';
import usersRouter from './routes/users';
import todosRouter from './routes/todos';

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/api/hello', (_req, res) => {
  res.send('Hello World!');
});

app.use(requestLogger);
app.use(tokenExtractor);

app.use('/api/auth', authRouter);
app.use('/api/users', auth, userExtractor, usersRouter);
app.use('/api/todos', auth, userExtractor, todosRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
