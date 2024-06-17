import { Response, Router } from 'express';
import todosService from '../services/todosService';
import { CustomRequest } from '../@types/curstom';
import { TodoCreate, TodoUpdate } from '../@types/todoTypes';

const router = Router();

router.get('/', async (req: CustomRequest, res: Response) => {
  const user = req.user;
  const todos = await todosService.getAll(user?.id as string);
  res.status(todos.statusCode).json(todos.content);
});

router.get('/:id', async (req: CustomRequest, res: Response) => {
  const userId = req.user?.id as string;
  const { id } = req.params as { id: string };
  const todo = await todosService.getOne({ id, userId });
  res.status(todo.statusCode).json(todo.content);
});

router.post('/', async (req: CustomRequest<TodoCreate>, res: Response) => {
  const userId = req.user?.id as string;
  const { note } = req.body;
  const createdTodo = await todosService.create({ note, userId });
  res.status(createdTodo.statusCode).json(createdTodo.content);
});

router.put(
  '/:id',
  async (req: CustomRequest<Partial<TodoUpdate>>, res: Response) => {
    const userId = req.user?.id as string;
    const { id } = req.params as { id: string };
    const todo = req.body;
    const updatedTodo = await todosService.update({ id, userId, ...todo });
    res.status(updatedTodo.statusCode).json(updatedTodo.content);
  }
);

export default router;
