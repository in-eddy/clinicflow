const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { loginSchema } = require('../validators/auth');

router.post('/login', validate(loginSchema), ctrl.login);
router.get('/me', authenticate, ctrl.me);
module.exports = router;