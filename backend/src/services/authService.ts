import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { z, ZodError } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const login = async (object: { email: string; password: string }) => {
  try {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    });

    const { email, password } = loginSchema.parse(object);

    const user = await prisma.user.findUnique({ where: { email } });
    const passwordCorrect =
      user === null ? false : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
      return {
        statusCode: 401,
        content: 'invalid email or password'
      };
    }

    const userForToken = {
      email: user.email,
      id: user.id
    };

    const secret = process.env.SECRET;
    if (!secret) {
      return {
        statusCode: 500,
        content: 'Failed to sign JWT'
      };
    }

    const token = jwt.sign(userForToken, secret, {
      expiresIn: 1 * 60 * 60
    });

    return {
      statusCode: 200,
      content: {
        token,
        email: user.email,
        name: user.name
      }
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return { statusCode: 400, content: error.issues };
    }
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return { statusCode: 200, content: 'User not found' };
      }
      return { statusCode: 400, content: error.message };
    }
    if (error instanceof Error) {
      return { statusCode: 400, content: error.message };
    }
    return { statusCode: 400, content: 'Unknown error' };
  }
};

export default { login };
