import { NextFunction, Request, Response } from 'express';

type AsyncRouteHandler<R extends Request = Request> = (req: R, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler<R extends Request = Request>(handler: AsyncRouteHandler<R>) {
  return (req: R, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}
