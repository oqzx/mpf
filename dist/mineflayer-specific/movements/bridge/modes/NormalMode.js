"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NormalMode = void 0;
const vec3_1 = require("vec3");
const BridgeUtils_1 = require("../BridgeUtils");
const BridgeModeBase_1 = require("./BridgeModeBase");
class NormalMode extends BridgeModeBase_1.BridgeModeBase {
    constructor() {
        super(...arguments);
        this.sideTracker = new BridgeUtils_1.GodBridgeSideTracker();
        this.placementPredictor = new BridgeUtils_1.PlacementPredictor();
        this.placedBlocks = 0;
        this.blocksToEagleThreshold = 0;
        this.sneakUntilMs = 0;
        this.currentPitch = 0;
        this.currentYawBias = 0;
    }
    onMoveStart(ctx) {
        this.sideTracker.reset();
        this.placementPredictor.reset();
        this.placedBlocks = 0;
        this.blocksToEagleThreshold = this._nextEagleThreshold();
        this.sneakUntilMs = 0;
        this.currentPitch = this._nextPitch();
        this.currentYawBias = this._nextYawBias();
    }
    onTick(ctx) {
        const result = Object.assign({}, BridgeModeBase_1.DEFAULT_TICK_RESULT);
        const cfg = this.config.normal;
        const bot = this.bot;
        const now = ctx.nowMs;
        const movingYaw = this._exitPosYaw(ctx);
        const facingYaw = movingYaw + Math.PI;
        const { dx: backX, dz: backZ } = (0, BridgeUtils_1.dirFromYaw)(movingYaw);
        const rightX = backZ;
        const rightZ = -backX;
        const onGround = bot.entity.onGround;
        const shouldCheckEdge = onGround || !cfg.onlyOnGround;
        if (shouldCheckEdge && this.placedBlocks === 0) {
            if ((0, BridgeUtils_1.isCloseToEdge)(bot, this.world, backX, backZ, cfg.edgeDistance)) {
                result.wantSneak = true;
            }
        }
        if (now < this.sneakUntilMs) {
            result.wantSneak = true;
        }
        // No sideTracker strafe in NormalMode — it causes circular drift on straight/diagonal bridges
        let movX = backX;
        let movZ = backZ;
        const line = ctx.lineTracker.getOptimalLine(bot, this.world);
        if (line != null) {
            const corr = ctx.lineTracker.getCorrectionDir(bot, line);
            if (corr.norm() > 0.001) {
                movX += corr.x * 0.25;
                movZ += corr.z * 0.25;
            }
        }
        const movLen = Math.sqrt(movX * movX + movZ * movZ);
        result.movementOverride = new vec3_1.Vec3(movX / movLen, 0, movZ / movLen);
        result.targetYaw = facingYaw;
        result.targetPitch = this.currentPitch;
        result.allowPlace = this._shouldAllowPlace(ctx, backX, backZ);
        return result;
    }
    onBlockPlaced(ctx) {
        const bot = this.bot;
        const movingYaw = this._exitPosYaw(ctx);
        const facingYaw = movingYaw + Math.PI;
        const { dx: backX, dz: backZ } = (0, BridgeUtils_1.dirFromYaw)(movingYaw);
        const edgePos = this._computeEdgePos(bot.entity.position, backX, backZ);
        this.placementPredictor.record(bot.entity.position, edgePos);
        this.placedBlocks++;
        this.currentPitch = this._nextPitch();
        this.currentYawBias = this._nextYawBias();
        if (this.placedBlocks > this.blocksToEagleThreshold) {
            this.placedBlocks = 0;
            this.blocksToEagleThreshold = this._nextEagleThreshold();
        }
        const sneakDuration = (0, BridgeUtils_1.randRangeMs)(this.config.globalSneakMs);
        this.sneakUntilMs = Math.max(this.sneakUntilMs, ctx.nowMs + sneakDuration);
    }
    onMoveEnd() {
        this.sideTracker.reset();
        this.placementPredictor.reset();
        this.placedBlocks = 0;
        this.sneakUntilMs = 0;
        this.currentYawBias = 0;
    }
    _shouldAllowPlace(ctx, backX, backZ) {
        const avg = this.placementPredictor.average();
        if (avg === null)
            return true;
        const bot = this.bot;
        const edgePos = this._computeEdgePos(bot.entity.position, backX, backZ);
        const currentOffset = bot.entity.position.minus(edgePos);
        const dx = currentOffset.x - avg.x;
        const dz = currentOffset.z - avg.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        return dist <= this.config.normal.placementPredictorThreshold;
    }
    _computeEdgePos(pos, backX, backZ) {
        return new vec3_1.Vec3(Math.floor(pos.x) + 0.5 - backX * 0.5, pos.y, Math.floor(pos.z) + 0.5 - backZ * 0.5);
    }
    _exitPosYaw(ctx) {
        const pos = this.bot.entity.position;
        const dx = ctx.move.exitPos.x - pos.x;
        const dz = ctx.move.exitPos.z - pos.z;
        return Math.atan2(-dx, -dz) + this.currentYawBias;
    }
    _nextEagleThreshold() {
        const [min, max] = this.config.normal.blocksToEagle;
        return min + Math.floor(Math.random() * (max - min + 1));
    }
    _nextPitch() {
        const baseDeg = this.config.normal.pitch;
        const jitter = this.config.normal.pitchJitter;
        return (0, BridgeUtils_1.pitchFromDeg)(baseDeg + (0, BridgeUtils_1.randFloat)(-jitter, jitter));
    }
    _nextYawBias() {
        const jitter = this.config.normal.yawJitter;
        return (0, BridgeUtils_1.randFloat)(-jitter, jitter) * BridgeUtils_1.DEG2RAD;
    }
}
exports.NormalMode = NormalMode;
//# sourceMappingURL=NormalMode.js.map