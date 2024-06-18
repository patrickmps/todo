import { PrismaClient, Todo } from '@prisma/client';
import { TodoCreate, TodoUpdate } from '../@types/todoTypes';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { z, ZodError } from 'zod';

const prisma = new PrismaClient();

const getAll = async (
  userId: string
): Promise<{ statusCode: number; content: Todo[] | string }> => {
  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId
      }
    });

    return { statusCode: 200, content: todos };
  } catch (error) {
    if (error instanceof Error) {
      return { statusCode: 400, content: error.message };
    }
    return { statusCode: 400, content: 'Unknown error' };
  }
};

const getOne = async ({
  id,
  userId
}: {
  id: string;
  userId: string;
}): Promise<{ statusCode: number; content: Todo | string }> => {
  try {
    const todo = await prisma.todo.findUnique({
      where: {
        id,
        userId
      }
    });

    return { statusCode: 200, content: todo ?? 'Todo not found' };
  } catch (error) {
    if (error instanceof Error) {
      return { statusCode: 400, content: error.message };
    }
    return { statusCode: 400, content: 'Unknown error' };
  }
};

const create = async (todo: Partial<TodoCreate>) => {
  try {
    const createTodoSchema = z.object({
      note: z
        .string()
        .min(1, 'Note cannot be empty')
        .max(255, 'Note cannot be longer than 255 characters'),
      userId: z.string().uuid('Invalid user ID')
    });

    const data = createTodoSchema.parse(todo);

    const createdTodo = await prisma.todo.create({
      data: {
        userId: data.userId,
        note: data.note
      }
    });
    return { statusCode: 201, content: createdTodo };
  } catch (error) {
    if (error instanceof ZodError) {
      return { statusCode: 400, content: error.issues };
    }
    if (error instanceof Error) {
      return { statusCode: 400, content: error.message };
    }
    return { statusCode: 400, content: 'Unknown error' };
  }
};

const update = async (todo: Partial<TodoUpdate>) => {
  try {
    const updateTodoSchema = z
      .object({
        id: z.string().uuid('Invalid todo ID'),
        userId: z.string().uuid('Invalid user ID'),
        note: z
          .string()
          .min(1, 'Note cannot be empty')
          .max(255, 'Note cannot be longer than 255 characters'),
        done: z.boolean()
      })
      .partial();

    const data = updateTodoSchema.parse(todo);

    const updatedTodo = await prisma.todo.update({
      where: {
        id: data.id,
        userId: data.userId
      },
      data: {
        note: data.note,
        done: data.done
      }
    });

    return { statusCode: 200, content: updatedTodo };
  } catch (error) {
    if (error instanceof ZodError) {
      return { statusCode: 400, content: error.issues };
    }

    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return { statusCode: 400, content: 'Todo not found' };
      }
      return { statusCode: 400, content: error.message };
    }

    if (error instanceof Error) {
      return { statusCode: 400, content: error.message };
    }
    return { statusCode: 400, content: 'Unknown error' };
  }
};

const remove = async (object: { todoId: string; userId: string }) => {
  try {
    const deleteTodoSchema = z.object({
      todoId: z.string().uuid('Invalid todo ID'),
      userId: z.string().uuid('Invalid user ID')
    });
    const data = deleteTodoSchema.parse(object);

    await prisma.todo.delete({
      where: {
        id: data.todoId,
        userId: data.userId
      }
    });

    return { statusCode: 204 };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return { statusCode: 200, content: 'Todo not found' };
      }
      return { statusCode: 400, content: error.message };
    }
    if (error instanceof Error) {
      return { statusCode: 400, content: error.message };
    }
    return { statusCode: 400, content: 'Unknown error' };
  }
};

export default { getAll, getOne, create, update, remove };
