"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/health.ts
const express_1 = require("express");
const healthController_1 = require("../controllers/healthController");
const router = (0, express_1.Router)();
router.post('/blood-pressure', healthController_1.authMiddleware, healthController_1.createBloodPressure);
router.post('/glucose', healthController_1.authMiddleware, healthController_1.createGlucose);
exports.default = router;
//# sourceMappingURL=health.js.map