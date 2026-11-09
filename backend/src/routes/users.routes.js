const router = require('express').Router();
const c = require('../controllers/users.controller');
const validate = require('../middlewares/validate');
const { authenticate, requireRole } = require('../middlewares/auth');
const { createUserSchema } = require('../validators/users');

// Toutes les routes /api/users sont réservées à l'admin
router.use(authenticate, requireRole('admin'));
router.post('/', validate(createUserSchema), c.create);
router.get('/', c.list);
router.delete('/:id', c.remove);
module.exports = router;
