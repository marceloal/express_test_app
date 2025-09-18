import { Router } from 'express';

import { authenticate } from '../middleware/authMiddleware';

const profileRouter = Router();

profileRouter.get('/', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default profileRouter;
