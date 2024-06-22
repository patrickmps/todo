import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { z, ZodError } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

/**
 * Realiza o login do usuário com base no email e senha fornecidos.
 * @param {Object} object - Um objeto contendo o email e a senha do usuário.
 * @param {string} object.email - O email do usuário.
 * @param {string} object.password - A senha do usuário.
 * @returns {Promise<Object>} - Uma promessa que resolve para um objeto contendo o código de status e o conteúdo da resposta.
 */
const login = async (object: { email: string; password: string }) => {
  try {
    // Define um esquema para validar os dados fornecidos
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    });

    // Faz a validação dos dados de acordo com o esquema
    const { email, password } = loginSchema.parse(object);

    // Verifica se o usuário existe no banco de dados e se a senha fornecida é válida
    const user = await prisma.user.findUnique({ where: { email } });
    const passwordCorrect =
      user === null ? false : await bcrypt.compare(password, user.passwordHash);

    if (!(user && passwordCorrect)) {
      // Retorna um código de status 401 e uma mensagem de erro se o email ou a senha forem inválidos
      return {
        statusCode: 401,
        content: 'Email or password is wrong'
      };
    }

    // Cria um token JWT com as informações do usuário
    const userForToken = {
      email: user.email,
      id: user.id
    };
    const secret = process.env.SECRET;
    if (!secret) {
      // Retorna um código de status 500 e uma mensagem de erro se o token não puder ser assinado
      return {
        statusCode: 500,
        content: 'Failed to sign JWT token'
      };
    }
    const token = jwt.sign(userForToken, secret, {
      expiresIn: 1 * 60 * 60
    });

    // Retorna um código de status 200 e as informações do usuário, incluindo o token
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
      // Retorna um código de status 400 e os erros de validação se o objeto do usuário falhar na validação
      return { statusCode: 400, content: error.issues };
    }
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Retorna um código de status 200 e uma mensagem indicando que o usuário não foi encontrado
        return { statusCode: 200, content: 'User not found' };
      }
      // Retorna um código de status 400 e a mensagem de erro do PrismaClient
      return { statusCode: 400, content: error.message };
    }
    if (error instanceof Error) {
      // Retorna um código de status 400 e a mensagem de erro do objeto de erro
      return { statusCode: 400, content: error.message };
    }
    // Retorna um código de status 400 e uma mensagem de erro genérica
    return { statusCode: 400, content: 'Unknown error' };
  }
};

export default { login };
