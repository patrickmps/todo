import { Todo } from "@prisma/client";

type TodoCreate = Pick<Todo, "note" | "userId">;
type TodoUpdate = Omit<Todo, "createdAt" | "uodatedAt">;

export { TodoCreate, TodoUpdate };
