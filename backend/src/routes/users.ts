import { Router } from "express";

import usersService from "../services/usersService";

const router = Router();

router.get("/", async (_req, res) => {
	const users = await usersService.getAll();

	res.send(users);
});

router.get("/:id", async (req, res) => {
	const user = await usersService.getOne(req.params.id);

	res.send(user);
});

router.delete("/:id", async (req, res) => {
	await usersService.remove(req.params.id);
	res.status(204).end();
});

// router.get("/:id/todos", async (req, res) => {
// 	const todos = await prisma.todo.findMany({
// 		where: {
// 			userId: req.params.id,
// 		},
// 	});
// 	res.send(todos);
// });

// router.get("/:id/todos/:id", async (req, res) => {
// 	const todo = await prisma.todo.findUnique({
// 		where: {
// 			id: req.params.id,
// 		},
// 	});
// 	res.send(todo);
// });

export default router;
