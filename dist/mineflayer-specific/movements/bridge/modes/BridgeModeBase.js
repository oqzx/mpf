"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeModeBase = exports.DEFAULT_TICK_RESULT = void 0;
exports.DEFAULT_TICK_RESULT = {
    wantSneak: false,
    wantJump: false,
    movementOverride: null,
    targetYaw: null,
    targetPitch: null,
    allowPlace: true
};
class BridgeModeBase {
    constructor(bot, world, config) {
        this.bot = bot;
        this.world = world;
        this.config = config;
    }
}
exports.BridgeModeBase = BridgeModeBase;
//# sourceMappingURL=BridgeModeBase.js.map