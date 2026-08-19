import { Request, Response, NextFunction } from 'express';

export function validateId(resourceName: string, allowZero: boolean = true) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const numId = Number(id);

    if (id === undefined || id === '' || isNaN(numId) || id.includes('.') || !Number.isInteger(numId) || numId < 0 || (!allowZero && numId === 0)) {
      res.status(400).json({ error: `Invalid ${resourceName} ID` });
      return;
    }

    next();
  };
}
