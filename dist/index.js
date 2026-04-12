"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.custom = exports.goals = void 0;
exports.createPlugin = createPlugin;
const cacheWorld_1 = require("./mineflayer-specific/world/cacheWorld");
const ThePathfinder_1 = require("./ThePathfinder");
const mineflayer_util_plugin_1 = __importDefault(require("@nxg-org/mineflayer-util-plugin"));
const mineflayer_physics_util_1 = __importStar(require("@nxg-org/mineflayer-physics-util"));
const PathingUtil_1 = require("./PathingUtil");
function createPlugin(opts) {
    return function (bot) {
        cacheWorld_1.BlockInfo.init(bot.registry);
        if (!bot.hasPlugin(mineflayer_util_plugin_1.default))
            bot.loadPlugin(mineflayer_util_plugin_1.default);
        if (!bot.hasPlugin(mineflayer_physics_util_1.default))
            bot.loadPlugin(mineflayer_physics_util_1.default);
        (0, mineflayer_physics_util_1.initSetup)(bot.registry);
        bot.pathfinder = new ThePathfinder_1.ThePathfinder(bot, opts);
        bot.pathingUtil = new PathingUtil_1.PathingUtil(bot);
    };
}
exports.goals = __importStar(require("./mineflayer-specific/goals"));
exports.custom = __importStar(require("./mineflayer-specific/custom"));
__exportStar(require("./mineflayer-specific/movements/bridge"), exports);
//# sourceMappingURL=index.js.map