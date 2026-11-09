const asyncHandler = require('../utils/asyncHandler');
const s = require('../services/users.service');

exports.create = asyncHandler(async (req, res) => res.status(201).json(await s.create(req.body)));
exports.list = asyncHandler(async (req, res) => res.json(await s.list()));
exports.remove = asyncHandler(async (req, res) => { await s.remove(req.params.id, req.user.id); res.status(204).send(); });
