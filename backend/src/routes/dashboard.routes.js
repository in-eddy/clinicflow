const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
router.get('/stats', authenticate, require('../controllers/dashboard.controller').stats);
module.exports = router;