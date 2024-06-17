import { Request } from 'express';
import { UserWithoutPassword } from './userTypes';

export interface CustomRequest<T = void> extends Request<object, object, T> {
  user?: UserWithoutPassword;
}
