import { Router } from "express";
import todosService from "../services/todosService";

const router = Router();

router.get("/", async (req: any, res: any) => {
	const user = req.user;
	const todos = await todosService.getAll(user.id);
	res.status(todos.statusCode).json(todos.content);
});

router.get("/:id", async (req: any, res: any) => {
	const userId = req.user.id;
	const id = req.params.id;
	const todo = await todosService.getOne({ id, userId });
	res.status(todo.statusCode).json(todo.content);
});

router.post("/", async (req: any, res: any) => {
	const userId = req.user.id;
	const note = req.body.note;
	const createdTodo = await todosService.create({ note, userId });
	res.status(createdTodo.statusCode).json(createdTodo.content);
});

router.put("/:id", async (req: any, res: any) => {
	const userId = req.user.id;
	const id = req.params.id;
	const todo = req.body;
	const updatedTodo = await todosService.update({ id, userId, ...todo });
	res.status(updatedTodo.statusCode).json(updatedTodo.content);
});

export default router;
