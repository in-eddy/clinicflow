const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/auth.service');

exports.login = asyncHandler(async (req, res) => res.json(await service.login(req.body)));
exports.me = asyncHandler(async (req, res) => res.json(await service.me(req.user.id)));