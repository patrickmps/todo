import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { excludeField } from '../utils/prisma';
import { UserCreate, UserWithoutPassword } from '../@types/userTypes';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ZodError, z } from 'zod';

const prisma = new PrismaClient();

const getAll = async (): Promise<{
  statusCode: number;
  content: UserWithoutPassword[] | string;
}> => {
  try {
    const users = await prisma.user.findMany({ include: { _count: true } });

    const usersWithoutPass = users.map((user) =>
      excludeField(user, ['passwordHash'])
    );

    return { statusCode: 200, content: usersWithoutPass };
  } catch (error) {
    if (error instanceof Error) {
      return { statusCode: 400, content: error.message };
    }
    return { statusCode: 400, content: 'Unknown error' };
  }
};

const getOne = async (
  id: string
): Promise<{ statusCode: number; content: UserWithoutPassword | string }> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: id
      },
      include: { _count: true, todos: true }
    });

    return {
      statusCode: 200,
      content: user ? excludeField(user, ['passwordHash']) : 'User not found'
    };
  } catch (error) {
    if (error instanceof Error) {
      return { statusCode: 400, content: error.message };
    }
    return { statusCode: 400, content: 'Unknown error' };
  }
};

const create = async (object: Partial<UserCreate>) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).regex(passwordRegex),
    name: z.string()
  });

  const data = userSchema.parse(object);

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(data.password, saltRounds);

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email
      }
    });

    if (existingUser) {
      return { statusCode: 400, content: 'User already exists' };
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name
      }
    });
    return { statusCode: 200, content: excludeField(user, ['passwordHash']) };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return { statusCode: 400, content: error.issues };
    }
    if (error instanceof Error) {
      return { statusCode: 400, content: error.message };
    }
    return { statusCode: 400, content: 'Unknown error' };
  }
};

const remove = async (id: string) => {
  try {
    if (!id) {
      return { statusCode: 401 };
    }
    await prisma.user.delete({ where: { id } });

    return { statusCode: 204 };
  } catch (error) {
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

export default { getAll, getOne, create, remove };
