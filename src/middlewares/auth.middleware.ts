import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';

import { SECRET_KEY } from 'src/jwt/auth';
export function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    
    
    req.userId = decoded.id;
    // res.locals.jwtPayload = decoded;
    // res.locals.user = res.locals.jwtPayload.id;
    next();
  } catch (err) {
  
    res.status(401).send('unauthorized');
  }
}
