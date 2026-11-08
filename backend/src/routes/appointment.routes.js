const router = require('express').Router();
const c = require('../controllers/appointments.controller');
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { createSchema, statusSchema, listSchema } = require('../validators/appointments');

router.use(authenticate);
router.post('/', validate(createSchema), c.create);
router.get('/', validate(listSchema, 'query'), c.list);
router.patch('/:id/status', validate(statusSchema), c.updateStatus);
module.exports = router;