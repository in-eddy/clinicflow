const asyncHandler = require('../utils/asyncHandler');
const s = require('../services/appointments.service');

exports.create = asyncHandler(async (req, res) => res.status(201).json(await s.create(req.body, req.user.id)));
exports.list = asyncHandler(async (req, res) => res.json(await s.list(req.query)));
exports.updateStatus = asyncHandler(async (req, res) => res.json(await s.updateStatus(req.params.id, req.body.status)));
