import { PrismaClient, Todo } from "@prisma/client";
import { TodoCreate, TodoUpdate } from "../@types/todoTypes";
import { todo } from "node:test";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

const getAll = async (
	userId: string
): Promise<{ statusCode: number; content: Todo[] | string }> => {
	try {
		const todos = await prisma.todo.findMany({
			where: {
				userId,
			},
		});

		return { statusCode: 200, content: todos };
	} catch (error) {
		if (error instanceof Error) {
			return { statusCode: 400, content: error.message };
		}
		return { statusCode: 400, content: "Unknown error" };
	}
};

const getOne = async ({
	id,
	userId,
}: {
	id: string;
	userId: string;
}): Promise<{ statusCode: number; content: Todo | string }> => {
	try {
		const todo = await prisma.todo.findUnique({
			where: {
				id,
				userId,
			},
		});

		return { statusCode: 200, content: todo ?? "Todo not found" };
	} catch (error) {
		if (error instanceof Error) {
			return { statusCode: 400, content: error.message };
		}
		return { statusCode: 400, content: "Unknown error" };
	}
};

const create = async (todo: TodoCreate) => {
	try {
		const createdTodo = await prisma.todo.create({
			data: {
				userId: todo.userId,
				note: todo.note,
			},
		});
		return { statusCode: 200, content: createdTodo };
	} catch (error) {
		if (error instanceof Error) {
			return { statusCode: 400, content: error.message };
		}
		return { statusCode: 400, content: "Unknown error" };
	}
};

const update = async (todo: TodoUpdate) => {
	try {
		const updatedTodo = await prisma.todo.update({
			where: {
				id: todo.id,
				userId: todo.userId,
			},
			data: {
				note: todo.note,
				done: todo.done,
			},
		});

		return { statusCode: 200, content: updatedTodo };
	} catch (error) {
		if (error instanceof PrismaClientKnownRequestError) {
			if (error.code === "P2025") {
				return { statusCode: 400, content: "Todo not found" };
			}
			return { statusCode: 400, content: error.message };
		}

		if (error instanceof Error) {
			return { statusCode: 400, content: error.message };
		}
		return { statusCode: 400, content: "Unknown error" };
	}
};

export default { getAll, getOne, create, update };
