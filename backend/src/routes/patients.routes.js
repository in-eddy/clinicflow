const router = require('express').Router();
const c = require('../controllers/patients.controller');
const validate = require('../middlewares/validate');
const { authenticate, requireRole } = require('../middlewares/auth');
const { patientSchema, listQuerySchema } = require('../validators/patients');

router.use(authenticate);
router.post('/', validate(patientSchema), c.create);
router.get('/', validate(listQuerySchema, 'query'), c.list);
router.get('/:id', c.getById);
router.put('/:id', validate(patientSchema), c.update);
router.delete('/:id', requireRole('admin'), c.remove);
module.exports = router;