import express from "express";
import cors from "cors";

import * as middleware from "./utils/middleware";
import authRouter from "./routes/authentication";
import usersRouter from "./routes/users";
import todosRouter from "./routes/todos";

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.get("/api/hello", (_req: any, res: any) => {
	res.send("Hello World!");
});

app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use("/api/auth", authRouter);
app.use("/api/users", middleware.auth, middleware.userExtractor, usersRouter);
app.use("/api/todos", middleware.auth, middleware.userExtractor, todosRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

app.listen(port, () => {
	console.log(`App listening on port ${port}`);
});
