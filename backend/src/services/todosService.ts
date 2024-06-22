import { PrismaClient, Todo } from '@prisma/client';
import { TodoCreate, TodoUpdate } from '../@types/todoTypes';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { z, ZodError } from 'zod';

const prisma = new PrismaClient();

/**
 * Obtém todas as tarefas do usuário
 * @param {string} userId
 * @returns {Promise<{ statusCode: number; content: Todo[] | string }>} - Uma promessa que resolve para um objeto contendo o código de status http e o conteúdo da resposta que pode ser um array contendo as tarefas do usuário ou uma mensagem de erro
 */
const getAll = async (
  userId: string
): Promise<{ statusCode: number; content: Todo[] | string }> => {
  try {
    // Busca todas as tarefas do usuário no banco de dados
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

/**
 * Obtém uma tarefa específica do usuário pelo ID da tarefa e o ID do usuário
 * @param {{ id: string; userId: string }} params
 * @returns {Promise<{ statusCode: number; content: Todo | string }>} - Uma promessa que resolve para um objeto contendo o código de status http e o conteúdo da resposta que pode ser a tarefa do usuário ou uma mensagem dizendo que a tarefa não foi encontrada ou uma mensagem de erro
 */
const getOne = async ({
  id,
  userId
}: {
  id: string;
  userId: string;
}): Promise<{ statusCode: number; content: Todo | string }> => {
  try {
    // Busca a tarefa do usuário no banco de dados pelo ID da tarefa e o ID do usuário
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

/**
 * Cria uma nova tarefa para o usuário
 * @param {Partial<TodoCreate>} todo - Um objeto que contém o conteúdo da tarefa e o id do usuário
 * @returns {Promise<{ statusCode: number; content: Todo }>} - Uma promessa que resolve para um objeto contendo o código de status http e o conteúdo da resposta que pode ser a tarefa criada ou uma mensagem de erro
 */
const create = async (todo: Partial<TodoCreate>) => {
  try {
    // Define um esquema para validação dos dados enviados para salvar a tarefa
    const createTodoSchema = z.object({
      note: z
        .string()
        .min(1, 'Note cannot be empty')
        .max(255, 'Note cannot be longer than 255 characters'),
      userId: z.string().uuid('Invalid user ID')
    });

    // faz a validação dos dados de acordo com o esquema
    const data = createTodoSchema.parse(todo);

    // Cria a tarefa no banco de dados
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

/**
 * Atualiza a tarefa do usuário
 * @param {Partial<TodoUpdate>} todo - Um objeto que contém o id da tarefa, o id do usuário e o conteúdo da tarefa que será atualizado (note/done)
 * @returns {Promise<{ statusCode: number; content: Todo }>} -Uma promessa que resolve para um objeto contendo o código de status http e o conteúdo da resposta que pode ser a tarefa atualizada ou uma mensagem de erro
 */
const update = async (todo: Partial<TodoUpdate>) => {
  try {
    // Define um esquema para validação dos dados enviados para atualizar a tarefa
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

    // faz a validação dos dados de acordo com o esquema
    const data = updateTodoSchema.parse(todo);

    // Atualiza a tarefa no banco de dados
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

/**
 * Deleta uma tarefa do usuário
 * @param {{ todoId: string; userId: string }} object
 * @returns {Promise<{ statusCode: number; content: string }>} - Uma promessa que resolve para um objeto contendo o código de status http e o conteúdo da resposta que pode ser vazio ou uma mensagem dizendo que a tarefa não foi encontrada ou uma mensagem de erro
 */
const remove = async (object: { todoId: string; userId: string }) => {
  try {
    // define um esquema para validação dos dados enviados para deletar a tarefa
    const deleteTodoSchema = z.object({
      todoId: z.string().uuid('Invalid todo ID'),
      userId: z.string().uuid('Invalid user ID')
    });

    // faz a validação dos dados de acordo com o esquema
    const data = deleteTodoSchema.parse(object);

    // Deleta a tarefa no banco de dados
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
