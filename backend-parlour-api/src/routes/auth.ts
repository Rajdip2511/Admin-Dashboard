import { Router } from 'express';
import { register, login } from '../controllers/authController';
import { body } from 'express-validator';
import { authenticate, IAuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').not().isEmpty(),
    body('lastName').not().isEmpty(),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').not().isEmpty(),
  ],
  login
);

router.get('/me', authenticate, (req: IAuthRequest, res: Response) => {
  res.json(req.user);
});

export default router; 