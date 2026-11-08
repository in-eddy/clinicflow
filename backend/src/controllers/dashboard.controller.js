const asyncHandler = require('../utils/asyncHandler');
exports.stats = asyncHandler(async (req, res) => res.json(await require('../services/dashboard.service').stats()));