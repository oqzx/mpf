"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeExecutor = void 0;
const vec3_1 = require("vec3");
const movementExecutor_1 = require("../movementExecutor");
const interactionUtils_1 = require("../interactionUtils");
const cacheWorld_1 = require("../../world/cacheWorld");
const exceptions_1 = require("../../exceptions");
const BridgeUtils_1 = require("./BridgeUtils");
const BridgeConfig_1 = require("./BridgeConfig");
const NormalMode_1 = require("./modes/NormalMode");
const GodBridgeMode_1 = require("./modes/GodBridgeMode");
const BreezilyMode_1 = require("./modes/BreezilyMode");
const PathSplicer_1 = require("./PathSplicer");
class BridgeExecutor extends movementExecutor_1.MovementExecutor {
    constructor(bot, world, settings = {}, cfg = {}) {
        super(bot, world, settings);
        this.lineTracker = new BridgeUtils_1.OptimalLineTracker();
        this.placedThisMove = 0;
        this.placementCooldownUntilMs = 0;
        this.nextPlacementDelayMs = 0;
        this.elevated = false;
        this.elevatedJumpCooldownUntilMs = 0;
        this.splicedEndIndex = 0;
        this.stallStartMs = 0;
        this._lerpYaw = 0.4;
        this._lerpPitch = 0.45;
        this.bridgeConfig = Object.assign(Object.assign(Object.assign({}, BridgeConfig_1.DEFAULT_BRIDGE_CONFIG), cfg), { rotation: Object.assign(Object.assign({}, BridgeConfig_1.DEFAULT_BRIDGE_CONFIG.rotation), cfg.rotation), normal: Object.assign(Object.assign({}, BridgeConfig_1.DEFAULT_BRIDGE_CONFIG.normal), cfg.normal), godbridge: Object.assign(Object.assign({}, BridgeConfig_1.DEFAULT_BRIDGE_CONFIG.godbridge), cfg.godbridge), breezily: Object.assign(Object.assign({}, BridgeConfig_1.DEFAULT_BRIDGE_CONFIG.breezily), cfg.breezily) });
        switch (this.bridgeConfig.mode) {
            case 'godbridge':
                this.mode = new GodBridgeMode_1.GodBridgeMode(bot, world, this.bridgeConfig);
                break;
            case 'breezily':
                this.mode = new BreezilyMode_1.BreezilyMode(bot, world, this.bridgeConfig);
                break;
            default:
                this.mode = new NormalMode_1.NormalMode(bot, world, this.bridgeConfig);
        }
    }
    static withConfig(cfg = {}) {
        return class BridgeExecutorConfigured extends BridgeExecutor {
            constructor(bot, world, settings) {
                super(bot, world, settings, cfg);
            }
        };
    }
    align(thisMove, tickCount, goal) {
        const _super = Object.create(null, {
            align: { get: () => super.align }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const pos = this.bot.entity.position;
            if (this._isInWater()) {
                yield _super.align.call(this, thisMove, tickCount, goal);
                this.bot.setControlState('jump', pos.y < thisMove.entryPos.y);
                return this.isInitAligned(thisMove, thisMove.entryPos.floored().offset(0.5, 0, 0.5));
            }
            if (!this.bot.entity.onGround && pos.y > thisMove.entryPos.y + 0.1)
                return false;
            // Must drive movement — lookAtPathPos alone leaves the bot frozen after execComplete
            void this.postInitAlignToPath(thisMove);
            return this.isInitAligned(thisMove, thisMove.entryPos.floored().offset(0.5, 0, 0.5));
        });
    }
    performInit(thisMove, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.bot.clearControlStates();
            this.placedThisMove = 0;
            this.placementCooldownUntilMs = 0;
            this.stallStartMs = 0;
            this.nextPlacementDelayMs = (0, BridgeUtils_1.randRangeMs)(this.bridgeConfig.placementDelayMs);
            this._refreshLerp();
            this.lineTracker.reset();
            if (this._isInWater()) {
                yield this.postInitAlignToPath(thisMove);
                return;
            }
            this.elevated = this._shouldElevate();
            this.elevatedJumpCooldownUntilMs = 0;
            this.splicedEndIndex = PathSplicer_1.PathSplicer.computeSpliceEnd(this.bot, this.world, currentIndex, path);
            const ctx = this._makeCtx(thisMove, currentIndex, path);
            this.mode.onMoveStart(ctx);
            yield this.lookAtPathPos(thisMove.exitPos);
        });
    }
    performPerTick(thisMove, tickCount, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const bot = this.bot;
            const pos = bot.entity.position;
            const now = Date.now();
            if (this._isInWater()) {
                if (pos.y < thisMove.exitPos.y)
                    bot.setControlState('jump', true);
                void this.postInitAlignToPath(thisMove);
                if (this.isComplete(thisMove)) {
                    this.mode.onMoveEnd();
                    return true;
                }
                return false;
            }
            if (!bot.entity.onGround && pos.y < Math.round(thisMove.entryPos.y) - 1) {
                throw new exceptions_1.CancelError('BridgeExecutor: fell off path');
            }
            const xzSpeed = Math.sqrt(Math.pow(bot.entity.velocity.x, 2) + Math.pow(bot.entity.velocity.z, 2));
            const collidedH = bot.entity.isCollidedHorizontally;
            if (!bot.entity.onGround && (collidedH || xzSpeed < 0.01)) {
                if (this.stallStartMs === 0)
                    this.stallStartMs = now;
                if (now - this.stallStartMs > this.bridgeConfig.stallTimeoutMs) {
                    throw new exceptions_1.CancelError('BridgeExecutor: stalled horizontally');
                }
            }
            else {
                this.stallStartMs = 0;
            }
            const ctx = this._makeCtx(thisMove, currentIndex, path);
            const modeResult = this.mode.onTick(ctx);
            this._applyRotation(thisMove, modeResult.targetYaw, modeResult.targetPitch);
            if (modeResult.allowPlace && now >= this.placementCooldownUntilMs) {
                const placed = yield this._attemptPlacement(path, currentIndex);
                if (placed) {
                    this.placedThisMove++;
                    this.placementCooldownUntilMs = now + this.nextPlacementDelayMs;
                    this.nextPlacementDelayMs = (0, BridgeUtils_1.randRangeMs)(this.bridgeConfig.placementDelayMs);
                    const updatedCtx = this._makeCtx(thisMove, currentIndex, path);
                    this.mode.onBlockPlaced(updatedCtx);
                    this._refreshLerp();
                    this.lineTracker.trackPlacement(new vec3_1.Vec3(thisMove.x, thisMove.y - 1, thisMove.z));
                }
            }
            yield this._attemptBreak(thisMove);
            this._applyMovement(thisMove, modeResult, now);
            const targetMove = (_a = path[this.splicedEndIndex]) !== null && _a !== void 0 ? _a : thisMove;
            if (this._isExecutionComplete(thisMove, targetMove, path, currentIndex)) {
                const delta = this.splicedEndIndex - currentIndex;
                this.mode.onMoveEnd();
                return delta > 0 ? delta : true;
            }
            return false;
        });
    }
    _refreshLerp() {
        const [minY, maxY] = this.bridgeConfig.rotation.lerpYaw;
        const [minP, maxP] = this.bridgeConfig.rotation.lerpPitch;
        this._lerpYaw = (0, BridgeUtils_1.randFloat)(minY, maxY);
        this._lerpPitch = (0, BridgeUtils_1.randFloat)(minP, maxP);
    }
    _isExecutionComplete(thisMove, targetMove, path, currentIndex) {
        if (this.toBreakLen() > 0)
            return false;
        for (let i = currentIndex; i <= this.splicedEndIndex; i++) {
            const m = path[i];
            if (m == null)
                break;
            for (const place of m.toPlace) {
                if (!place.done)
                    return false;
            }
        }
        return this.isComplete(thisMove, targetMove);
    }
    _isInWater() {
        if (this.bot.entity.isInWater)
            return true;
        if (this.bot.entity.onGround)
            return false;
        return this.getBlockInfo(this.bot.entity.position, 0, -0.6, 0).liquid;
    }
    _shouldElevate() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
        const goal = (_a = this.bot.pathfinder) === null || _a === void 0 ? void 0 : _a.goal;
        if (goal == null)
            return false;
        const x = (_b = goal.x) !== null && _b !== void 0 ? _b : (_d = (_c = goal.entity) === null || _c === void 0 ? void 0 : _c.position) === null || _d === void 0 ? void 0 : _d.x;
        const z = (_e = goal.z) !== null && _e !== void 0 ? _e : (_g = (_f = goal.entity) === null || _f === void 0 ? void 0 : _f.position) === null || _g === void 0 ? void 0 : _g.z;
        if (x == null || z == null)
            return false;
        const pos = this.bot.entity.position;
        const xzDist = Math.sqrt(Math.pow((pos.x - x), 2) + Math.pow((pos.z - z), 2));
        if (xzDist <= this.bridgeConfig.elevatedBridgeThreshold)
            return false;
        // Only elevate-jump when the goal is meaningfully higher. Flat bridges must never jump.
        const goalY = (_h = goal.y) !== null && _h !== void 0 ? _h : (_k = (_j = (_i = goal.entity) === null || _i === void 0 ? void 0 : _i.position) === null || _j === void 0 ? void 0 : _j.y) !== null && _k !== void 0 ? _k : null;
        if (goalY == null)
            return false;
        return goalY - pos.y > 1;
    }
    _applyRotation(move, targetYaw, targetPitch) {
        const yaw = targetYaw !== null && targetYaw !== void 0 ? targetYaw : this._defaultYaw(move);
        const pitch = targetPitch !== null && targetPitch !== void 0 ? targetPitch : this._defaultPitch();
        const currentYaw = this.bot.entity.yaw;
        const currentPitch = this.bot.entity.pitch;
        let dyaw = (0, BridgeUtils_1.shortestYawDelta)(currentYaw, yaw);
        const maxTurn = this.bridgeConfig.rotation.maxTurnRadPerTick;
        if (Math.abs(dyaw) > maxTurn) {
            dyaw = Math.sign(dyaw) * maxTurn;
        }
        const rawStep = dyaw * this._lerpYaw;
        const step = Math.abs(rawStep) < BridgeExecutor.MIN_YAW_DELTA_RAD
            ? Math.sign(rawStep !== 0 ? rawStep : 1) * BridgeExecutor.MIN_YAW_DELTA_RAD
            : rawStep;
        this.bot.entity.yaw = currentYaw + step + (0, BridgeUtils_1.randFloat)(-0.005, 0.005);
        this.bot.entity.pitch = currentPitch + (pitch - currentPitch) * this._lerpPitch;
    }
    _defaultYaw(move) {
        const pos = this.bot.entity.position;
        return Math.atan2(-(move.exitPos.x - pos.x), -(move.exitPos.z - pos.z));
    }
    _defaultPitch() {
        return -(70 * (Math.PI / 180));
    }
    _attemptPlacement(path, startIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = startIndex; i <= this.splicedEndIndex; i++) {
                const m = path[i];
                if (m == null)
                    break;
                for (const place of m.toPlace) {
                    if (place.done)
                        continue;
                    if (place.isPerforming)
                        continue;
                    if (!(place instanceof interactionUtils_1.PlaceHandler))
                        continue;
                    if (!place.needToPerform(this.bot))
                        continue;
                    const item = place.getItem(this.bot);
                    if (item == null)
                        continue;
                    void place._perform(this.bot, item, {}).catch(() => { });
                    return true;
                }
            }
            return false;
        });
    }
    _attemptBreak(move) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const breakHandler of move.toBreak) {
                if (breakHandler.done)
                    continue;
                if (breakHandler.isPerforming)
                    continue;
                if (!(breakHandler instanceof interactionUtils_1.BreakHandler))
                    continue;
                if (!breakHandler.needToPerform(this.bot))
                    continue;
                const block = breakHandler.getBlock(this.world);
                const item = block != null ? breakHandler.getItem(this.bot, block) : null;
                void breakHandler._perform(this.bot, item, {}).catch(() => { });
                return;
            }
        });
    }
    _applyMovement(move, modeResult, nowMs) {
        const bot = this.bot;
        const needsElevatedJump = this.elevated &&
            nowMs >= this.elevatedJumpCooldownUntilMs &&
            bot.entity.onGround;
        const finalJump = modeResult.wantJump || needsElevatedJump;
        const finalSneak = modeResult.wantSneak && !finalJump;
        if (needsElevatedJump) {
            this.elevatedJumpCooldownUntilMs = nowMs + (0, BridgeUtils_1.randFloat)(400, 550);
        }
        bot.setControlState('sneak', finalSneak);
        bot.setControlState('jump', finalJump);
        if (modeResult.movementOverride != null) {
            const ov = modeResult.movementOverride;
            if (ov.norm() < 0.01) {
                bot.setControlState('forward', false);
                bot.setControlState('back', false);
                bot.setControlState('left', false);
                bot.setControlState('right', false);
                bot.setControlState('sprint', false);
            }
            else {
                this._applyDirectionalVector(ov);
                this._applySprintState(finalSneak);
            }
        }
        else {
            void this.postInitAlignToPath(move, { sprint: !finalSneak });
            if (this.bridgeConfig.mode !== 'normal') {
                bot.setControlState('sprint', !finalSneak);
            }
        }
    }
    _applySprintState(finalSneak) {
        const bot = this.bot;
        const cfg = this.bridgeConfig;
        if (cfg.mode !== 'normal') {
            bot.setControlState('sprint', !finalSneak);
            return;
        }
        const sprintMode = cfg.normal.sprint;
        if (sprintMode === 'always') {
            bot.setControlState('sprint', !finalSneak);
        }
        else if (sprintMode === 'auto') {
            const vel = bot.entity.velocity;
            const xzSpeed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
            bot.setControlState('sprint', !finalSneak && xzSpeed > 0.08);
        }
        else {
            bot.setControlState('sprint', false);
        }
    }
    _applyDirectionalVector(vec) {
        const bot = this.bot;
        const yaw = bot.entity.yaw;
        const cosYaw = Math.cos(yaw);
        const sinYaw = Math.sin(yaw);
        const fwdDot = -sinYaw * vec.x - cosYaw * vec.z;
        const rightDot = -cosYaw * vec.x + sinYaw * vec.z;
        bot.setControlState('forward', fwdDot > 0.3);
        bot.setControlState('back', fwdDot < -0.3);
        bot.setControlState('right', rightDot > 0.3);
        bot.setControlState('left', rightDot < -0.3);
    }
    _makeCtx(move, currentIndex, path) {
        return {
            move,
            nowMs: Date.now(),
            path,
            pathIndex: currentIndex,
            lineTracker: this.lineTracker,
            placedThisMove: this.placedThisMove,
            totalBlockCount: this._countBlocks()
        };
    }
    _countBlocks() {
        let count = 0;
        for (let i = 0; i < 9; i++) {
            const slot = this.bot.inventory.slots[36 + i];
            if (slot != null && slot.count > 0 && cacheWorld_1.BlockInfo.scaffoldingBlockItems.has(slot.type)) {
                count += slot.count;
            }
        }
        return count;
    }
}
exports.BridgeExecutor = BridgeExecutor;
BridgeExecutor.MIN_YAW_DELTA_RAD = 0.0003;
//# sourceMappingURL=BridgeExecutor.js.map