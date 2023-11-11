import { NextFunction, Request, Response } from 'express';
import { getNewFlats } from '../services/notify.service';

export async function findNewFlats(req: Request, res: Response, next: NextFunction) {
  try {
    const flats = await getNewFlats();
    res.json(flats);
  } catch (error) {
    next(error);
  }
}
