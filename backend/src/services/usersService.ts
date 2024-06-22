import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { excludeField } from '../utils/prisma';
import { UserCreate, UserWithoutPassword } from '../@types/userTypes';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ZodError, z } from 'zod';

const prisma = new PrismaClient();

/**
 * Obtém todos os usuários
 * @returns {Promise<{ statusCode: number; content: UserWithoutPassword[] | string }>} - Uma promessa que resolve para um objeto contendo o código de status e o conteúdo da resposta
 */
const getAll = async (): Promise<{
  statusCode: number;
  content: UserWithoutPassword[] | string;
}> => {
  try {
    // Busca todos os usuários no banco de dados
    const users = await prisma.user.findMany({ include: { _count: true } });

    // Exclui o campo passwordHash de cada objeto de usuário
    const usersWithoutPass = users.map((user) =>
      excludeField(user, ['passwordHash'])
    );

    // Retorna o código de status e o conteúdo da resposta
    return { statusCode: 200, content: usersWithoutPass };
  } catch (error) {
    if (error instanceof Error) {
      // Retorna o código de status e a mensagem de erro se ocorrer um erro
      return { statusCode: 400, content: error.message };
    }
    // Retorna o código de status e uma mensagem genérica de erro se ocorrer um erro desconhecido
    return { statusCode: 400, content: 'Unknown error' };
  }
};

/**
 * Obtém um usuário específico por ID
 * @param {string} id - O ID do usuário a ser recuperado
 * @returns {Promise<{ statusCode: number; content: UserWithoutPassword | string }>} - Uma promessa que resolve para um objeto contendo o código de status e o conteúdo da resposta
 */
const getOne = async (
  id: string
): Promise<{ statusCode: number; content: UserWithoutPassword | string }> => {
  try {
    // Busca o usuário no banco de dados com base no ID fornecido
    const user = await prisma.user.findUnique({
      where: {
        id: id
      },
      include: { _count: true, todos: true }
    });

    // Retorna o código de status e o conteúdo da resposta
    return {
      statusCode: 200,
      // Se o usuário for encontrado, retorna o usuário excluindo o campo passwordHash
      // Caso contrário, retorna uma mensagem indicando que o usuário não foi encontrado
      content: user ? excludeField(user, ['passwordHash']) : 'Uset not found'
    };
  } catch (error) {
    if (error instanceof Error) {
      // Retorna o código de status e a mensagem de erro se ocorrer um erro
      return { statusCode: 400, content: error.message };
    }
    // Retorna o código de status e uma mensagem genérica de erro se ocorrer um erro desconhecido
    return { statusCode: 400, content: 'Unknown error' };
  }
};

/**
 * Cria um novo usuário
 * @param {Partial<UserCreate>} object - Um objeto contendo o email, senha e nome do usuário
 * @returns {Promise<{ statusCode: number; content: UserWithoutPassword }>} - Uma promessa que resolve para um objeto contendo o código de status e o conteúdo da resposta
 */
const create = async (object: Partial<UserCreate>) => {
  // regex para validação da senha
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  // esquema para validar os dados enviados para criar o usuário
  const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).regex(passwordRegex),
    name: z.string()
  });

  // faz a validação dos dados de acordo com o esquema
  const data = userSchema.parse(object);

  // faz a criptografia da senha
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(data.password, saltRounds);

  try {
    // Verifica se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email
      }
    });

    if (existingUser) {
      // Retorna o código de status e uma mensagem indicando que o usuário já existe
      return { statusCode: 400, content: 'User already exists' };
    }

    // Cria o usuário no banco de dados
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name
      }
    });
    // Retorna o código de status e o objeto do usuário com o campo passwordHash excluído
    return { statusCode: 200, content: excludeField(user, ['passwordHash']) };
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      // Retorna o código de status e os erros de validação se o objeto do usuário falhar na validação
      return { statusCode: 400, content: error.issues };
    }
    if (error instanceof Error) {
      // Retorna o código de status e a mensagem de erro se ocorrer um erro
      return { statusCode: 400, content: error.message };
    }
    // Retorna o código de status e uma mensagem genérica de erro se ocorrer um erro desconhecido
    return { statusCode: 400, content: 'Unknown error' };
  }
};

/**
 * Remove um usuário por ID
 * @param {string} id - O ID do usuário a ser removido
 * @returns {Promise<{ statusCode: number; content: string }>} - Uma promessa que resolve para um objeto contendo o código de status e o conteúdo da resposta
 */
const remove = async (id: string) => {
  try {
    if (!id) {
      // Retorna o código de status 401 dizendo que o usuário não está autorizado
      return { statusCode: 401 };
    }
    // Exclui o usuário do banco de dados com base no ID fornecido
    await prisma.user.delete({ where: { id } });

    // Retorna o código de status http 204 confirmando a exclusão
    return { statusCode: 204 };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Retorna o código de status e uma mensagem indicando que o usuário não foi encontrado
        return { statusCode: 200, content: 'User not found' };
      }
      // Retorna o código de status e a mensagem de erro se ocorrer um erro
      return { statusCode: 400, content: error.message };
    }
    if (error instanceof Error) {
      // Retorna o código de status e a mensagem de erro se ocorrer um erro
      return { statusCode: 400, content: error.message };
    }
    // Retorna o código de status e uma mensagem genérica de erro se ocorrer um erro desconhecido
    return { statusCode: 400, content: 'Unknown error' };
  }
};

export default { getAll, getOne, create, remove };
