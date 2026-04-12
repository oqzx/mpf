"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BreezilyMode = void 0;
const vec3_1 = require("vec3");
const BridgeUtils_1 = require("../BridgeUtils");
const BridgeModeBase_1 = require("./BridgeModeBase");
var CardinalDeg;
(function (CardinalDeg) {
    CardinalDeg[CardinalDeg["SOUTH"] = 0] = "SOUTH";
    CardinalDeg[CardinalDeg["WEST"] = 90] = "WEST";
    CardinalDeg[CardinalDeg["NORTH"] = 180] = "NORTH";
    CardinalDeg[CardinalDeg["EAST"] = 270] = "EAST";
})(CardinalDeg || (CardinalDeg = {}));
const BREEZILY_AIR_WINDOW_MS = 500;
class BreezilyMode extends BridgeModeBase_1.BridgeModeBase {
    constructor() {
        super(...arguments);
        this.lastSideways = 0;
        this.lastAirTimeMs = 0;
        this.currentEdgeDist = 0.45;
        this.pitchStraight = 0;
        this.pitchDiag = 0;
        this.pitchNoInput = 0;
        this.currentYawBias = 0;
    }
    onMoveStart(ctx) {
        this.lastSideways = 0;
        this.lastAirTimeMs = 0;
        this.currentEdgeDist = this._nextEdgeDist();
        this.currentYawBias = this._nextYawBias();
        this._refreshPitch();
    }
    onTick(ctx) {
        const result = Object.assign({}, BridgeModeBase_1.DEFAULT_TICK_RESULT);
        const bot = this.bot;
        const now = ctx.nowMs;
        if (!bot.entity.onGround) {
            this.lastAirTimeMs = now;
        }
        const movDeg = (0, BridgeUtils_1.getMovementDegrees)(bot);
        if (movDeg == null) {
            result.targetYaw = this._rotationNoInput(ctx);
            result.targetPitch = this.pitchNoInput;
            return result;
        }
        const snapped = (0, BridgeUtils_1.snapTo45Deg)(movDeg);
        const isStraight = snapped % 90 === 0;
        result.targetYaw = movDeg * BridgeUtils_1.DEG2RAD + this.currentYawBias;
        result.targetPitch = isStraight ? this.pitchStraight : this.pitchDiag;
        const fwdPressed = bot.getControlState('forward');
        const sneaking = bot.getControlState('sneak');
        if (!fwdPressed || sneaking)
            return result;
        const msSinceAir = now - this.lastAirTimeMs;
        if (this.lastAirTimeMs === 0 || msSinceAir > BREEZILY_AIR_WINDOW_MS)
            return result;
        const pos = bot.entity.position;
        const fx = pos.x - Math.floor(pos.x);
        const fz = pos.z - Math.floor(pos.z);
        const margin = this.currentEdgeDist;
        const ma = 1 - margin;
        let newSideways = 0;
        const cardinalDeg = Math.round((0, BridgeUtils_1.wrapDegrees)(movDeg) / 90) * 90;
        switch (cardinalDeg % 360) {
            case 0:
                if (fx > ma)
                    newSideways = 1;
                else if (fx < margin)
                    newSideways = -1;
                break;
            case 180:
                if (fx > ma)
                    newSideways = -1;
                else if (fx < margin)
                    newSideways = 1;
                break;
            case 270:
                if (fz > ma)
                    newSideways = -1;
                else if (fz < margin)
                    newSideways = 1;
                break;
            case 90:
                if (fz > ma)
                    newSideways = 1;
                else if (fz < margin)
                    newSideways = -1;
                break;
            default:
                break;
        }
        if (newSideways !== 0 && newSideways !== this.lastSideways) {
            this.lastSideways = newSideways;
            this.currentEdgeDist = this._nextEdgeDist();
        }
        if (this.lastSideways !== 0) {
            const movRad = movDeg * BridgeUtils_1.DEG2RAD;
            const { dx: fdx, dz: fdz } = (0, BridgeUtils_1.dirFromYaw)(movRad);
            const perpX = -fdz * this.lastSideways;
            const perpZ = fdx * this.lastSideways;
            const combX = fdx + perpX * 0.6;
            const combZ = fdz + perpZ * 0.6;
            const len = Math.sqrt(combX * combX + combZ * combZ);
            result.movementOverride = new vec3_1.Vec3(combX / len, 0, combZ / len);
        }
        return result;
    }
    onBlockPlaced(ctx) {
        this.currentYawBias = this._nextYawBias();
        this._refreshPitch();
    }
    onMoveEnd() {
        this.lastSideways = 0;
        this.lastAirTimeMs = 0;
        this.currentYawBias = 0;
    }
    _nextEdgeDist() {
        const [min, max] = this.config.breezily.edgeDistance;
        return (0, BridgeUtils_1.randFloat)(min, max);
    }
    _nextYawBias() {
        const jitter = this.config.breezily.yawJitter;
        return (0, BridgeUtils_1.randFloat)(-jitter, jitter) * BridgeUtils_1.DEG2RAD;
    }
    _refreshPitch() {
        const cfg = this.config.breezily;
        const jit = () => (0, BridgeUtils_1.randFloat)(-cfg.pitchJitter, cfg.pitchJitter);
        this.pitchStraight = (0, BridgeUtils_1.pitchFromDeg)(cfg.pitchStraight + jit());
        this.pitchDiag = (0, BridgeUtils_1.pitchFromDeg)(cfg.pitchDiagonal + jit());
        this.pitchNoInput = (0, BridgeUtils_1.pitchFromDeg)(75 + jit());
    }
    _rotationNoInput(ctx) {
        const exitPos = ctx.move.exitPos;
        const pos = this.bot.entity.position;
        const dx = exitPos.x - pos.x;
        const dz = exitPos.z - pos.z;
        return Math.atan2(-dx, -dz) + this.currentYawBias;
    }
}
exports.BreezilyMode = BreezilyMode;
//# sourceMappingURL=BreezilyMode.js.map