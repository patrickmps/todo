import { User } from "@prisma/client";

type UserWithoutPassword = Omit<User, "passwordHash">;

type UserWithCountTodos = User & { _count: { todos: number } };

type UserCreate = Omit<User, "id" | "_count" | "passwordHash"> & {
	password: string;
};

export { UserWithoutPassword, UserCreate, UserWithCountTodos };
