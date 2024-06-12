import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const router = Router();
const prisma = new PrismaClient();

router.get("/", async (_req: any, res: any) => {
	const todos = await prisma.todo.findMany();
	res.send(todos);
});

router.post("/", async (req: any, res: any) => {
	const todo = await prisma.todo.create({
		data: req.body,
	});
	res.send(todo);
});

router.get("/:id", async (req: any, res: any) => {
	const todo = await prisma.todo.findUnique({
		where: {
			id: req.params.id,
		},
	});
	res.send(todo);
});

export default router;
