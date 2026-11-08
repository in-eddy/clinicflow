const asyncHandler = require('../utils/asyncHandler');
const s = require('../services/patients.service');

exports.create = asyncHandler(async (req, res) => res.status(201).json(await s.create(req.body)));
exports.list = asyncHandler(async (req, res) => res.json(await s.list(req.query)));
exports.getById = asyncHandler(async (req, res) => res.json(await s.getById(req.params.id)));
exports.update = asyncHandler(async (req, res) => res.json(await s.update(req.params.id, req.body)));
exports.remove = asyncHandler(async (req, res) => { await s.remove(req.params.id); res.status(204).send(); });