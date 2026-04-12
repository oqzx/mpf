"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GodBridgeMode = void 0;
const vec3_1 = require("vec3");
const BridgeUtils_1 = require("../BridgeUtils");
const BridgeModeBase_1 = require("./BridgeModeBase");
const INACTIVE_LEDGE = { action: 'none', until: 0 };
class GodBridgeMode extends BridgeModeBase_1.BridgeModeBase {
    constructor() {
        super(...arguments);
        this.sideTracker = new BridgeUtils_1.GodBridgeSideTracker();
        this.ledge = Object.assign({}, INACTIVE_LEDGE);
        this.pitchStraight = 0;
        this.pitchDiag = 0;
        this.yawJitter = 0;
    }
    onMoveStart(ctx) {
        this.sideTracker.reset();
        this.ledge = Object.assign({}, INACTIVE_LEDGE);
        this._refreshPitch();
        this._refreshYawJitter();
    }
    onTick(ctx) {
        const result = Object.assign({}, BridgeModeBase_1.DEFAULT_TICK_RESULT);
        const bot = this.bot;
        const now = ctx.nowMs;
        const movDeg = (0, BridgeUtils_1.getMovementDegrees)(bot);
        if (movDeg != null) {
            const movRad = movDeg * BridgeUtils_1.DEG2RAD;
            this.sideTracker.update(bot, this.world, movRad);
        }
        const moveDir = movDeg != null ? (0, BridgeUtils_1.dirFromYaw)(movDeg * BridgeUtils_1.DEG2RAD) : { dx: 0, dz: 0 };
        const atEdge = (0, BridgeUtils_1.isCloseToEdge)(bot, this.world, moveDir.dx, moveDir.dz, 0.12);
        if (atEdge && now >= this.ledge.until) {
            this._triggerLedge(ctx);
        }
        if (now < this.ledge.until) {
            switch (this.ledge.action) {
                case 'jump':
                    result.wantJump = true;
                    break;
                case 'sneak':
                    result.wantSneak = true;
                    break;
                case 'stopInput':
                    result.movementOverride = new vec3_1.Vec3(0, 0, 0);
                    break;
                case 'backwards':
                    result.movementOverride = new vec3_1.Vec3(-moveDir.dx, 0, -moveDir.dz);
                    break;
                default:
                    break;
            }
        }
        if (movDeg == null) {
            result.targetYaw = this._rotationNoInput(ctx);
            result.targetPitch = this.pitchStraight;
        }
        else {
            const snapped = (0, BridgeUtils_1.snapTo45Deg)(movDeg);
            const isStraight = snapped % 90 === 0;
            if (isStraight) {
                const snappedRad = snapped * BridgeUtils_1.DEG2RAD;
                const sideOffset = this.sideTracker.getYawOffset();
                result.targetYaw = snappedRad + sideOffset + this.yawJitter * BridgeUtils_1.DEG2RAD;
                result.targetPitch = this.pitchStraight;
            }
            else {
                result.targetYaw = movDeg * BridgeUtils_1.DEG2RAD + this.yawJitter * BridgeUtils_1.DEG2RAD;
                result.targetPitch = this.pitchDiag;
            }
        }
        return result;
    }
    onBlockPlaced(ctx) {
        this._refreshPitch();
        this._refreshYawJitter();
        this.ledge = Object.assign({}, INACTIVE_LEDGE);
    }
    onMoveEnd() {
        this.sideTracker.reset();
        this.ledge = Object.assign({}, INACTIVE_LEDGE);
    }
    _triggerLedge(ctx) {
        const cfg = this.config.godbridge;
        const now = ctx.nowMs;
        if (ctx.totalBlockCount < cfg.forceSneakBelowCount) {
            this.ledge = { action: 'sneak', until: now + (0, BridgeUtils_1.randRangeMs)(cfg.sneakMs) };
            return;
        }
        const modes = cfg.ledgeModes;
        if (modes.length === 0)
            return;
        const chosen = (0, BridgeUtils_1.randChoice)(modes);
        const durationMs = chosen === 'sneak' ? (0, BridgeUtils_1.randRangeMs)(cfg.sneakMs) : 50;
        this.ledge = { action: chosen, until: now + durationMs };
    }
    _rotationNoInput(ctx) {
        const pos = this.bot.entity.position;
        const exitPos = ctx.move.exitPos;
        const dx = exitPos.x - pos.x;
        const dz = exitPos.z - pos.z;
        return Math.atan2(-dx, -dz) + this.yawJitter * BridgeUtils_1.DEG2RAD;
    }
    _refreshPitch() {
        const cfg = this.config.godbridge;
        const jit = (0, BridgeUtils_1.randFloat)(-cfg.pitchJitter, cfg.pitchJitter);
        this.pitchStraight = (0, BridgeUtils_1.pitchFromDeg)(cfg.pitchStraight + jit);
        this.pitchDiag = (0, BridgeUtils_1.pitchFromDeg)(cfg.pitchDiagonal + (0, BridgeUtils_1.randFloat)(-cfg.pitchJitter, cfg.pitchJitter));
    }
    _refreshYawJitter() {
        this.yawJitter = (0, BridgeUtils_1.randFloat)(-this.config.godbridge.yawJitter, this.config.godbridge.yawJitter);
    }
}
exports.GodBridgeMode = GodBridgeMode;
//# sourceMappingURL=GodBridgeMode.js.map