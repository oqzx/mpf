"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_BRIDGE_CONFIG = void 0;
exports.DEFAULT_BRIDGE_CONFIG = {
    mode: 'normal',
    elevatedBridgeThreshold: 20,
    globalSneakMs: [50, 100],
    equipDelayMs: [0, 40],
    placementDelayMs: [0, 0],
    stallTimeoutMs: 400,
    rotation: {
        lerpYaw: [0.35, 0.55],
        lerpPitch: [0.38, 0.58],
        maxTurnRadPerTick: 0.4
    },
    normal: {
        edgeDistance: 0.1,
        blocksToEagle: [0, 0],
        onlyOnGround: true,
        sprint: 'auto',
        pitch: 78,
        pitchJitter: 2,
        yawJitter: 3.5,
        placementPredictorThreshold: 0.5
    },
    godbridge: {
        ledgeModes: ['jump', 'sneak'],
        sneakMs: [50, 100],
        forceSneakBelowCount: 3,
        pitchStraight: 75.7,
        pitchDiagonal: 75.6,
        pitchJitter: 0.3,
        yawJitter: 0.5
    },
    breezily: {
        edgeDistance: [0.45, 0.5],
        pitchStraight: 80,
        pitchDiagonal: 75.6,
        pitchJitter: 0.3,
        yawJitter: 3.5
    }
};
//# sourceMappingURL=BridgeConfig.js.map