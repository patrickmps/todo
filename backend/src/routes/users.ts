import { Router, Response } from 'express';

import usersService from '../services/usersService';
import { CustomRequest } from '../@types/curstom';

const router = Router();

router.get('/', async (_req, res) => {
  const users = await usersService.getAll();

  res.status(users.statusCode).json(users.content);
});

router.get('/:id', async (req, res) => {
  const user = await usersService.getOne(req.params.id);

  res.status(user.statusCode).json(user.content);
});

router.delete('/', async (req: CustomRequest, res: Response) => {
  const userId = req.user?.id as string;
  const result = await usersService.remove(userId);
  res.status(result.statusCode).json(result.content);
});

export default router;
