import type { Request } from 'express';

export interface AuthenticatedUser {
  userId: number;
  email: string;
}

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};
