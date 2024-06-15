import { Router } from "express";

import usersService from "../services/usersService";

const router = Router();

router.get("/", async (_req, res) => {
	const users = await usersService.getAll();

	res.status(users.statusCode).json(users.content);
});

router.get("/:id", async (req, res) => {
	const user = await usersService.getOne(req.params.id);

	res.status(user.statusCode).json(user.content);
});

router.delete("/", async (req: any, res) => {
	const userId = req.user?.id;
	const result = await usersService.remove(userId);
	res.status(result.statusCode).json(result.content);
});

export default router;
