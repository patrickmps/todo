import { Request, Response, Router } from 'express';
import usersService from '../services/usersService';
import { UserCreate } from '../@types/userTypes';
import authService from '../services/authService';

const router = Router();

router.post(
  '/login',
  async (req: Request<object, object, UserCreate>, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    return res.status(result.statusCode).json(result.content);
  }
);

router.post(
  '/create-user',
  async (req: Request<object, object, Partial<UserCreate>>, res: Response) => {
    const { email, name, password } = req.body;

    const result = await usersService.create({ email, name, password });

    return res.status(result.statusCode).json(result.content);
  }
);

export default router;
