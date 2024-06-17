import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import usersService from '../services/usersService';
import { UserCreate } from '../@types/userTypes';

const router = Router();
const prisma = new PrismaClient();

router.post(
  '/login',
  async (req: Request<object, object, UserCreate>, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    const passwordCorrect =
      user === null ? false : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
      return res.status(401).json({
        error: 'invalid email or password'
      });
    }

    const userForToken = {
      email: user.email,
      id: user.id
    };

    const secret = process.env.SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Failed to sign JWT' });
    }

    const token = jwt.sign(userForToken, secret, {
      expiresIn: 1 * 60 * 60
    });

    return res.status(200).send({ token, email: user.email, name: user.name });
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
