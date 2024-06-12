type User = {
	id: string;
	email: string;
	name: string | null;
	passwordHash: string;
};

type UserWithoutPassword = Omit<User, "passwordHash">;

type UserWithCountTodos = User & { _count: { todos: number } };

type UserCreate = Omit<User, "id" | "_count" | "passwordHash"> & {
	password: string;
};

export { User, UserWithoutPassword, UserCreate };
