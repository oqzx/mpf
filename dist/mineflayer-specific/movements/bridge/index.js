"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randChoice = exports.randRangeMs = exports.randFloat = exports.shortestYawDelta = exports.getHorizontalMoveDir = exports.getMovementDegrees = exports.isFractionallyNearEdge = exports.isCloseToEdge = exports.PlacementPredictor = exports.GodBridgeSideTracker = exports.OptimalLineTracker = exports.DEFAULT_BRIDGE_CONFIG = exports.PathSplicer = exports.BridgeExecutor = void 0;
exports.makeBridgeSetup = makeBridgeSetup;
var BridgeExecutor_1 = require("./BridgeExecutor");
Object.defineProperty(exports, "BridgeExecutor", { enumerable: true, get: function () { return BridgeExecutor_1.BridgeExecutor; } });
var PathSplicer_1 = require("./PathSplicer");
Object.defineProperty(exports, "PathSplicer", { enumerable: true, get: function () { return PathSplicer_1.PathSplicer; } });
var BridgeConfig_1 = require("./BridgeConfig");
Object.defineProperty(exports, "DEFAULT_BRIDGE_CONFIG", { enumerable: true, get: function () { return BridgeConfig_1.DEFAULT_BRIDGE_CONFIG; } });
var BridgeUtils_1 = require("./BridgeUtils");
Object.defineProperty(exports, "OptimalLineTracker", { enumerable: true, get: function () { return BridgeUtils_1.OptimalLineTracker; } });
Object.defineProperty(exports, "GodBridgeSideTracker", { enumerable: true, get: function () { return BridgeUtils_1.GodBridgeSideTracker; } });
Object.defineProperty(exports, "PlacementPredictor", { enumerable: true, get: function () { return BridgeUtils_1.PlacementPredictor; } });
Object.defineProperty(exports, "isCloseToEdge", { enumerable: true, get: function () { return BridgeUtils_1.isCloseToEdge; } });
Object.defineProperty(exports, "isFractionallyNearEdge", { enumerable: true, get: function () { return BridgeUtils_1.isFractionallyNearEdge; } });
Object.defineProperty(exports, "getMovementDegrees", { enumerable: true, get: function () { return BridgeUtils_1.getMovementDegrees; } });
Object.defineProperty(exports, "getHorizontalMoveDir", { enumerable: true, get: function () { return BridgeUtils_1.getHorizontalMoveDir; } });
Object.defineProperty(exports, "shortestYawDelta", { enumerable: true, get: function () { return BridgeUtils_1.shortestYawDelta; } });
Object.defineProperty(exports, "randFloat", { enumerable: true, get: function () { return BridgeUtils_1.randFloat; } });
Object.defineProperty(exports, "randRangeMs", { enumerable: true, get: function () { return BridgeUtils_1.randRangeMs; } });
Object.defineProperty(exports, "randChoice", { enumerable: true, get: function () { return BridgeUtils_1.randChoice; } });
const BridgeExecutor_2 = require("./BridgeExecutor");
const movementProviders_1 = require("../movementProviders");
function makeBridgeSetup(cfg = {}) {
    const ExecutorClass = BridgeExecutor_2.BridgeExecutor.withConfig(cfg);
    return new Map([
        [movementProviders_1.Forward, ExecutorClass],
        [movementProviders_1.Diagonal, ExecutorClass]
    ]);
}
//# sourceMappingURL=index.js.map