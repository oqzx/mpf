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
exports.ParkourForwardExecutor = exports.StraightUpExecutor = exports.StraightDownExecutor = exports.NewForwardDropDownExecutor = exports.ForwardDropDownExecutor = exports.NewForwardJumpExecutor = exports.ForwardJumpExecutor = exports.ForwardExecutor = exports.NewForwardExecutor = exports.IdleMovementExecutor = void 0;
const exceptions_1 = require("../exceptions");
const cacheWorld_1 = require("../world/cacheWorld");
const interactionUtils_1 = require("./interactionUtils");
const mineflayer_util_plugin_1 = require("@nxg-org/mineflayer-util-plugin");
const movementExecutor_1 = require("./movementExecutor");
const movementUtils_1 = require("./movementUtils");
const mineflayer_physics_util_1 = require("@nxg-org/mineflayer-physics-util");
const utils_1 = require("../../utils");
class IdleMovementExecutor extends movementExecutor_1.MovementExecutor {
    provideMovements(start, storage) { }
    performInit(thisMove, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    performPerTick(thisMove, tickCount, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
}
exports.IdleMovementExecutor = IdleMovementExecutor;
class NewForwardExecutor extends movementExecutor_1.MovementExecutor {
    faceForward() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (this.doWaterLogic())
                return true;
            const eyePos = this.bot.entity.position.offset(0, this.bot.entity.height, 0);
            const placementVecs = this.toPlace().map((p) => mineflayer_util_plugin_1.AABB.fromBlock(p.vec));
            const near = placementVecs.some((p) => p.distanceToVec(eyePos) < interactionUtils_1.PlaceHandler.reach + 2);
            return ((_a = this.currentMove) === null || _a === void 0 ? void 0 : _a.toPlace.length) === 0 || !near;
        });
    }
    align(thisMove, tickCount, goal) {
        const _super = Object.create(null, {
            align: { get: () => super.align }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.doWaterLogic()) {
                yield _super.align.call(this, thisMove, tickCount, goal);
            }
            const faceForward = yield this.faceForward();
            let target;
            if (faceForward) {
                target = thisMove.entryPos.floored().translate(0.5, 0, 0.5);
            }
            else {
                const offset = this.bot.entity.position.minus(thisMove.exitPos).plus(this.bot.entity.position);
                target = offset;
            }
            yield this.landAlign(thisMove, tickCount, goal);
            return this.isInitAligned(thisMove, target);
        });
    }
    landAlign(thisMove, tickCount, goal) {
        return __awaiter(this, void 0, void 0, function* () {
            const faceForward = yield this.faceForward();
            const target = thisMove.entryPos.floored().translate(0.5, 0, 0.5);
            if (faceForward) {
                this.bot.setControlState('forward', true);
                if (this.bot.food <= 6)
                    this.bot.setControlState('sprint', false);
                else
                    this.bot.setControlState('sprint', true);
            }
            else {
                const offset = this.bot.entity.position.minus(target).plus(this.bot.entity.position);
                void this.lookAt(offset);
                this.bot.setControlState('forward', false);
                this.bot.setControlState('sprint', false);
                this.bot.setControlState('back', true);
            }
            return this.isInitAligned(thisMove, target);
        });
    }
    performInit(thisMove, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.bot.clearControlStates();
            const faceForward = yield this.faceForward();
            if (faceForward) {
                yield this.postInitAlignToPath(thisMove);
            }
            else {
                const offset = this.bot.entity.position.minus(thisMove.exitPos).plus(this.bot.entity.position);
                yield this.postInitAlignToPath(thisMove, { lookAt: offset });
            }
        });
    }
    doWaterLogic() {
        if (this.bot.entity.isInWater)
            return true;
        if (this.bot.entity.onGround)
            return false;
        const bl = this.getBlockInfo(this.bot.entity.position, 0, -0.6, 0);
        return bl.liquid;
    }
    canJump(thisMove, currentIndex, path) {
        if (this.doWaterLogic()) {
            if (this.bot.entity.position.y < thisMove.exitPos.y) {
                return true;
            }
            else {
                return false;
            }
        }
        if (!this.settings.allowJumpSprint)
            return false;
        if (!this.bot.entity.onGround)
            return false;
        if (this.toBreakLen() > 0 || this.toPlaceLen() > 0)
            return false;
        const xzVel = this.bot.entity.velocity.offset(0, -this.bot.entity.velocity.y, 0);
        if (xzVel.norm() < 0.14)
            return false;
        const ctx = mineflayer_physics_util_1.EPhysicsCtx.FROM_BOT(this.sim.ctx, this.bot);
        this.sim.simulateUntil((state, ticks) => (ticks > 0 && state.onGround) || state.isCollidedHorizontally, () => { }, (state) => {
            state.control.set('jump', true);
        }, ctx, this.world, 20);
        if (ctx.state.pos.y > thisMove.entryPos.y)
            return false;
        const nextPos = path[++currentIndex];
        let offset = 0.4;
        if (currentIndex < path.length) {
            if (nextPos.toPlace.length > 0 || nextPos.toBreak.length > 0)
                offset = 0.8;
            if (nextPos.exitPos.y > thisMove.entryPos.y) {
                offset = 0.8;
            }
            if (nextPos.exitPos.y - thisMove.entryPos.y > 2) {
                offset = 0.8;
            }
        }
        if (thisMove.entryPos.xzDistanceTo(ctx.state.pos) > thisMove.entryPos.xzDistanceTo(thisMove.exitPos) - offset) {
            return false;
        }
        if (ctx.state.isCollidedHorizontally)
            return false;
        return ctx.state.onGround;
    }
    performPerTick(thisMove, tickCount, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cI != null && !(yield this.cI.allowExternalInfluence(this.bot))) {
                return false;
            }
            else if (this.cI == null) {
                const test = yield this.interactNeeded(5);
                if (test != null) {
                    void this.performInteraction(test);
                    return false;
                }
            }
            if ((!this.bot.entity.onGround &&
                !this.bot.getControlState('jump') &&
                !this.doWaterLogic() &&
                this.canJump(thisMove, currentIndex, path)) ||
                this.bot.entity.position.y < Math.round(thisMove.entryPos.y) - 1) {
                throw new exceptions_1.CancelError('ForwardMove: not on ground');
            }
            const faceForward = yield this.faceForward();
            if (faceForward) {
                const jump = this.canJump(thisMove, currentIndex, path);
                this.bot.setControlState('jump', jump);
                void this.postInitAlignToPath(thisMove);
                return this.isComplete(thisMove);
            }
            else {
                const offset = this.bot.entity.position.minus(thisMove.exitPos).plus(this.bot.entity.position);
                void this.postInitAlignToPath(thisMove, { lookAt: offset });
                return this.isComplete(thisMove);
            }
        });
    }
}
exports.NewForwardExecutor = NewForwardExecutor;
class ForwardExecutor extends movementExecutor_1.MovementExecutor {
    faceForward() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const eyePos = this.bot.entity.position.offset(0, this.bot.entity.height, 0);
            const placementVecs = this.toPlace().map((p) => mineflayer_util_plugin_1.AABB.fromBlock(p.vec));
            const near = placementVecs.some((p) => p.distanceToVec(eyePos) < interactionUtils_1.PlaceHandler.reach + 2);
            return ((_a = this.currentMove) === null || _a === void 0 ? void 0 : _a.toPlace.length) === 0 && !near;
        });
    }
    align(thisMove, tickCount, goal) {
        return __awaiter(this, void 0, void 0, function* () {
            const faceForward = yield this.faceForward();
            const target = thisMove.entryPos.floored().translate(0.5, 0, 0.5);
            if (faceForward) {
                void this.postInitAlignToPath(thisMove, { lookAtYaw: target });
            }
            else {
                const offset = this.bot.entity.position.minus(target).plus(this.bot.entity.position);
                void this.postInitAlignToPath(thisMove, { lookAt: offset });
            }
            const off0 = thisMove.exitPos.minus(this.bot.entity.position);
            const off1 = thisMove.exitPos.minus(target);
            off0.translate(0, -off0.y, 0);
            off1.translate(0, -off1.y, 0);
            const similarDirection = off0.normalize().dot(off1.normalize()) > 0.95;
            const bb0 = mineflayer_util_plugin_1.AABBUtils.getEntityAABBRaw({ position: this.bot.entity.position, width: 0.6, height: 1.8 });
            const bb1bl = this.getBlockInfo(target, 0, -1, 0);
            const bb1 = bb1bl.getBBs();
            if (bb1.length === 0)
                bb1.push(mineflayer_util_plugin_1.AABB.fromBlock(bb1bl.position));
            const bb1physical = bb1bl.physical || bb1bl.liquid;
            const bb2bl = thisMove.moveType.getBlockInfo(thisMove.exitPos.floored(), 0, -1, 0);
            const bb2 = bb2bl.getBBs();
            if (bb2.length === 0)
                bb2.push(mineflayer_util_plugin_1.AABB.fromBlock(bb1bl.position));
            const bb2physical = bb2bl.physical || bb2bl.liquid;
            if ((bb1.some((b) => b.collides(bb0)) && bb1physical) || (bb2.some((b) => b.collides(bb0)) && bb2physical)) {
                if (similarDirection)
                    return true;
                else if (this.bot.entity.position.xzDistanceTo(target) < 0.2)
                    return this.isLookingAtYaw(target);
            }
            return false;
        });
    }
    performInit(thisMove, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.bot.clearControlStates();
            this.currentIndex = 0;
            const faceForward = yield this.faceForward();
            if (faceForward) {
                yield this.postInitAlignToPath(thisMove);
            }
            else {
                const offset = this.bot.entity.position.minus(thisMove.exitPos).plus(this.bot.entity.position);
                yield this.postInitAlignToPath(thisMove, { lookAt: offset, sprint: true });
            }
        });
    }
    identMove(thisMove, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            let lastMove = thisMove;
            let nextMove = path[++currentIndex];
            if (nextMove === undefined)
                return --currentIndex;
            const orgY = thisMove.entryPos.y;
            const width = 0.61;
            const bb = mineflayer_util_plugin_1.AABBUtils.getEntityAABBRaw({ position: this.bot.entity.position, width, height: 1.8 });
            const verts = bb.expand(0, -1, 0).toVertices();
            const verts1 = [
                this.bot.entity.position.offset(-width / 2, -0.6, -width / 2),
                this.bot.entity.position.offset(width / 2, -0.6, -width / 2),
                this.bot.entity.position.offset(width / 2, -0.6, width / 2),
                this.bot.entity.position.offset(-width / 2, -0.6, width / 2)
            ];
            const pos0 = this.bot.entity.position;
            while (lastMove.exitPos.y === orgY && nextMove.exitPos.y === orgY) {
                if (nextMove === undefined)
                    return --currentIndex;
                for (const vert of verts) {
                    const offset = vert.minus(this.bot.entity.position);
                    const test1 = nextMove.exitPos.offset(0, orgY - nextMove.exitPos.y, 0);
                    const test = test1.plus(offset);
                    const dist = lastMove.exitPos.distanceTo(this.bot.entity.position) + 1;
                    const raycast0 = (yield this.bot.world.raycast(vert, test.minus(vert).normalize().scale(0.5), dist * 2));
                    const valid0 = raycast0 == null || raycast0.position.distanceTo(pos0) > dist;
                    if (!valid0) {
                        return --currentIndex;
                    }
                }
                let counter = verts1.length;
                for (const vert of verts1) {
                    const offset = vert.minus(this.bot.entity.position);
                    const test1 = nextMove.exitPos.offset(0, orgY - nextMove.exitPos.y, 0);
                    const test = test1.plus(offset);
                    const dist = lastMove.exitPos.distanceTo(this.bot.entity.position) + 1;
                    const raycast0 = (yield this.bot.world.raycast(vert, test.minus(vert).normalize().scale(0.5), dist * 2, (block) => cacheWorld_1.BlockInfo.replaceables.has(block.type)));
                    const valid0 = raycast0 == null || raycast0.position.distanceTo(pos0) > dist;
                    if (!valid0)
                        counter--;
                }
                if (counter === 0)
                    return --currentIndex;
                if (++currentIndex >= path.length)
                    return --currentIndex;
                lastMove = nextMove;
                nextMove = path[currentIndex];
            }
            return --currentIndex;
        });
    }
    canJump(thisMove, currentIndex, path) {
        if (!this.settings.allowJumpSprint)
            return false;
        if (!this.bot.entity.onGround)
            return false;
        if (this.toBreakLen() > 0 || this.toPlaceLen() > 0)
            return false;
        const xzVel = this.bot.entity.velocity.offset(0, -this.bot.entity.velocity.y, 0);
        if (xzVel.norm() < 0.14)
            return false;
        const ctx = mineflayer_physics_util_1.EPhysicsCtx.FROM_BOT(this.sim.ctx, this.bot);
        this.sim.simulateUntil((state, ticks) => (ticks > 0 && state.onGround) || state.isCollidedHorizontally, () => { }, (state) => {
            state.control.set('jump', true);
        }, ctx, this.world, 20);
        if (ctx.state.pos.y > thisMove.entryPos.y)
            return false;
        const nextPos = path[++currentIndex];
        let offset = 0.3;
        if (currentIndex < path.length) {
            if (nextPos.toPlace.length > 0 || nextPos.toBreak.length > 0)
                offset = 0.8;
            if (nextPos.exitPos.y > thisMove.entryPos.y) {
                offset = 0.8;
            }
        }
        if (thisMove.entryPos.xzDistanceTo(ctx.state.pos) > thisMove.entryPos.xzDistanceTo(thisMove.exitPos) - offset) {
            return false;
        }
        if (ctx.state.isCollidedHorizontally)
            return false;
        return ctx.state.onGround;
    }
    performPerTick(thisMove, tickCount, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cI != null && !(yield this.cI.allowExternalInfluence(this.bot))) {
                return false;
            }
            else if (this.cI == null) {
                const test = yield this.interactNeeded(15);
                if (test != null) {
                    void this.performInteraction(test);
                    return false;
                }
            }
            if (!this.bot.entity.onGround &&
                this.bot.entity.position.y < thisMove.entryPos.y &&
                !this.bot.getControlState('jump')) {
                throw new exceptions_1.CancelError('ForwardMove: not on ground');
            }
            if (this.bot.entity.isCollidedHorizontally) {
            }
            const faceForward = yield this.faceForward();
            if (faceForward) {
                if (false) {
                    this.bot.setControlState('back', false);
                    this.bot.setControlState('sprint', true);
                    this.bot.setControlState('forward', true);
                    const idx = yield this.identMove(thisMove, currentIndex, path);
                    this.currentIndex = Math.max(idx, this.currentIndex);
                    const nextMove = path[this.currentIndex];
                    if (currentIndex !== this.currentIndex && nextMove !== undefined) {
                        void this.postInitAlignToPath(thisMove, nextMove);
                        if (this.isComplete(thisMove, nextMove))
                            return this.currentIndex - currentIndex;
                    }
                    else {
                        void this.postInitAlignToPath(thisMove);
                        return this.isComplete(thisMove);
                    }
                }
                else {
                    const jump = this.canJump(thisMove, currentIndex, path);
                    this.bot.setControlState('jump', jump);
                    void this.postInitAlignToPath(thisMove);
                    return this.isComplete(thisMove);
                }
            }
            else {
                const offset = this.bot.entity.position.minus(thisMove.exitPos).plus(this.bot.entity.position);
                void this.postInitAlignToPath(thisMove, { lookAt: offset });
                return this.isComplete(thisMove);
            }
            return false;
        });
    }
}
exports.ForwardExecutor = ForwardExecutor;
class ForwardJumpExecutor extends movementExecutor_1.MovementExecutor {
    constructor() {
        super(...arguments);
        this.shitter = new movementUtils_1.JumpCalculator(this.sim, this.bot, this.world, this.simCtx);
        this.flag = false;
    }
    isComplete(startMove, endMove) {
        return super.isComplete(startMove, endMove, { ticks: 0 });
    }
    align(thisMove, tickCount, goal) {
        const _super = Object.create(null, {
            align: { get: () => super.align }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.bot.entity.isInWater) {
                this.bot.setControlState('jump', this.bot.entity.position.y < thisMove.entryPos.y);
                return yield _super.align.call(this, thisMove, tickCount, goal);
            }
            return yield _super.align.call(this, thisMove, tickCount, goal);
        });
    }
    align1(thisMove, tickCount, goal) {
        const bb = mineflayer_util_plugin_1.AABBUtils.getEntityAABBRaw({ position: this.bot.entity.position, width: 0.6, height: 1.8 });
        if (this.flag) {
            void this.lookAt(thisMove.entryPos.floored().offset(0.5, 0, 0.5));
            this.bot.setControlState('forward', true);
            this.bot.setControlState('back', false);
            this.bot.setControlState('sprint', true);
            const bl = this.getBlockInfo(thisMove.entryPos.floored(), 0, -1, 0);
            const bigBBs = bl.getBBs().map((b) => b.extend(0, 10, 0));
            return bigBBs.some((b) => b.contains(bb)) && this.bot.entity.onGround;
        }
        else if (this.bot.entity.onGround) {
            if (thisMove.toPlace.length === 0) {
                this.jumpInfo = this.shitter.findJumpPoint(thisMove.exitPos);
                if (this.jumpInfo === null) {
                    this.flag = true;
                    return false;
                }
            }
            return true;
        }
        return false;
    }
    performTwoPlace(thisMove) {
        return __awaiter(this, void 0, void 0, function* () {
            let info = yield thisMove.toPlace[0].performInfo(this.bot, 0);
            if (info.raycasts.length === 0) {
                void this.postInitAlignToPath(thisMove, { lookAt: thisMove.entryPos });
                yield this.performInteraction(thisMove.toPlace[0]);
            }
            else {
                yield this.performInteraction(thisMove.toPlace[0], { info });
            }
            this.bot.setControlState('jump', true);
            yield this.postInitAlignToPath(thisMove, { lookAt: thisMove.entryPos });
            while (this.bot.entity.position.y - thisMove.exitPos.y < 0) {
                yield this.postInitAlignToPath(thisMove, { lookAt: thisMove.entryPos });
                yield this.bot.waitForTicks(1);
            }
            info = yield thisMove.toPlace[1].performInfo(this.bot);
            while (info.raycasts.length === 0) {
                yield this.postInitAlignToPath(thisMove, { lookAt: thisMove.entryPos });
                yield this.bot.waitForTicks(1);
                info = yield thisMove.toPlace[1].performInfo(this.bot);
            }
            yield this.performInteraction(thisMove.toPlace[1], { info });
            yield this.lookAt(thisMove.exitPos);
        });
    }
    performInit(thisMove, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.flag = false;
            this.bot.clearControlStates();
            if (thisMove.toBreak.length > 0) {
                yield this.bot.clearControlStates();
                for (const breakH of thisMove.toBreak) {
                    yield this.performInteraction(breakH);
                }
            }
            if (thisMove.toPlace.length === 2) {
                yield this.performTwoPlace(thisMove);
                return;
            }
            this.jumpInfo = this.shitter.findJumpPoint(thisMove.exitPos);
            if (this.jumpInfo === null) {
                this.bot.setControlState('forward', true);
                this.bot.setControlState('jump', true);
                this.bot.setControlState('sprint', true);
            }
            for (const place of thisMove.toPlace) {
                const info = yield place.performInfo(this.bot);
                if (info !== null)
                    yield this.performInteraction(place, { info });
            }
        });
    }
    performPerTick(thisMove, tickCount, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (this.cI != null && !(yield this.cI.allowExternalInfluence(this.bot))) {
                this.bot.clearControlStates();
                return false;
            }
            else if (this.cI == null) {
                const test = yield this.interactNeeded();
                if (test != null) {
                    void this.performInteraction(test);
                    return false;
                }
            }
            void this.postInitAlignToPath(thisMove);
            if (this.jumpInfo != null) {
                if (tickCount >= this.jumpInfo.backTick) {
                    this.bot.setControlState('forward', false);
                    this.bot.setControlState('back', true);
                }
                if (tickCount >= this.jumpInfo.sprintTick) {
                    this.bot.setControlState('sprint', true);
                    this.bot.setControlState('forward', true);
                }
                else {
                    this.bot.setControlState('sprint', false);
                    this.bot.setControlState('forward', false);
                }
                if (tickCount >= this.jumpInfo.jumpTick) {
                    this.bot.setControlState('jump', this.bot.entity.position.y - thisMove.entryPos.y < 0.8);
                }
                else {
                    this.bot.setControlState('jump', false);
                }
            }
            else {
            }
            if (this.bot.entity.position.y - thisMove.exitPos.y < -1.25)
                throw new exceptions_1.CancelError('ForwardJumpMove: too low (1)');
            if (tickCount > ((_b = (_a = this.jumpInfo) === null || _a === void 0 ? void 0 : _a.jumpTick) !== null && _b !== void 0 ? _b : 0) && this.bot.entity.onGround) {
                this.bot.setControlState('jump', false);
                this.bot.setControlState('sprint', true);
                if (this.bot.entity.position.y - thisMove.exitPos.y < -0.25) {
                    throw new exceptions_1.CancelError(`ForwardJumpMove: too low (2) ${this.bot.entity.position.y} ${thisMove.exitPos.y}`);
                }
            }
            return this.isComplete(thisMove);
        });
    }
}
exports.ForwardJumpExecutor = ForwardJumpExecutor;
class NewForwardJumpExecutor extends ForwardJumpExecutor {
    performPerTick(thisMove, tickCount, currentIndex, path) {
        const _super = Object.create(null, {
            performPerTick: { get: () => super.performPerTick }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.bot.entity.isInWater) {
                this.bot.setControlState('jump', this.bot.entity.position.y < thisMove.exitPos.y);
                void this.postInitAlignToPath(thisMove);
                return this.isComplete(thisMove);
            }
            else {
                return yield _super.performPerTick.call(this, thisMove, tickCount, currentIndex, path);
            }
        });
    }
}
exports.NewForwardJumpExecutor = NewForwardJumpExecutor;
class ForwardDropDownExecutor extends movementExecutor_1.MovementExecutor {
    align(thisMove, tickCount, goal) {
        const _super = Object.create(null, {
            align: { get: () => super.align }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.bot.entity.isInWater) {
                return yield _super.align.call(this, thisMove, tickCount, goal);
            }
            return yield _super.align.call(this, thisMove, tickCount, goal);
        });
    }
    performInit(thisMove, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentIndex = currentIndex;
            yield this.postInitAlignToPath(thisMove);
        });
    }
    identMove(thisMove, currentIndex, path) {
        let lastMove = thisMove;
        let nextMove = path[++currentIndex];
        if (nextMove === undefined)
            return --currentIndex;
        const pos = this.bot.entity.position;
        while (lastMove.entryPos.xzDistanceTo(pos) > lastMove.entryPos.xzDistanceTo(lastMove.exitPos) &&
            lastMove.entryPos.y > nextMove.exitPos.y &&
            nextMove.moveType.toPlaceLen() === 0) {
            if (++currentIndex >= path.length)
                return --currentIndex;
            lastMove = nextMove;
            nextMove = path[currentIndex];
        }
        if (lastMove.entryPos.y === nextMove.exitPos.y)
            currentIndex++;
        return --currentIndex;
    }
    performPerTick(thisMove, tickCount, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cI != null && !(yield this.cI.allowExternalInfluence(this.bot, 0))) {
                this.bot.clearControlStates();
                return false;
            }
            else if (this.cI == null) {
                const test = yield this.interactNeeded();
                if (test != null) {
                    void this.performInteraction(test);
                    return false;
                }
            }
            if (false) {
                const idx = this.identMove(thisMove, currentIndex, path);
                this.currentIndex = Math.max(idx, this.currentIndex);
                const nextMove = path[this.currentIndex];
                if (currentIndex !== this.currentIndex && nextMove !== undefined) {
                    void this.postInitAlignToPath(thisMove, nextMove);
                    if (this.isComplete(thisMove, nextMove))
                        return this.currentIndex - currentIndex;
                }
                else {
                    void this.postInitAlignToPath(thisMove, thisMove);
                    if (this.isComplete(thisMove, thisMove))
                        return true;
                }
            }
            else {
                if (currentIndex < path.length)
                    void this.postInitAlignToPath(thisMove);
                else
                    void this.postInitAlignToPath(thisMove);
                if (this.isComplete(thisMove))
                    return true;
            }
            return false;
        });
    }
    getLandingBlock(node, dir) {
        let blockLand = this.getBlockInfo(node, dir.x, -2, dir.z);
        while (blockLand.position.y > this.bot.game.minY) {
            if (blockLand.liquid && blockLand.walkthrough)
                return blockLand;
            if (blockLand.physical) {
                if (node.y - blockLand.position.y <= this.settings.maxDropDown)
                    return this.getBlockInfo(blockLand.position, 0, 1, 0);
                return null;
            }
            if (!blockLand.walkthrough)
                return null;
            blockLand = this.getBlockInfo(blockLand.position, 0, -1, 0);
        }
        return null;
    }
}
exports.ForwardDropDownExecutor = ForwardDropDownExecutor;
class NewForwardDropDownExecutor extends ForwardDropDownExecutor {
    performPerTick(thisMove, tickCount, currentIndex, path) {
        const _super = Object.create(null, {
            performPerTick: { get: () => super.performPerTick }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.bot.entity.isInWater) {
                this.bot.setControlState('jump', this.bot.entity.position.y < thisMove.exitPos.y);
                return this.isComplete(thisMove);
            }
            else {
                return yield _super.performPerTick.call(this, thisMove, tickCount, currentIndex, path);
            }
        });
    }
}
exports.NewForwardDropDownExecutor = NewForwardDropDownExecutor;
class StraightDownExecutor extends movementExecutor_1.MovementExecutor {
    align(thisMove) {
        this.bot.clearControlStates();
        const xzVel = this.bot.entity.velocity.offset(0, -this.bot.entity.velocity.y, 0);
        if (this.bot.entity.position.xzDistanceTo(thisMove.exitPos) < 0.2 && xzVel.norm() < 0.1) {
            return true;
        }
        void this.lookAt(thisMove.exitPos);
        if (xzVel.normalize().dot(this.bot.util.getViewDir()) <= 0 || this.bot.entity.position.distanceTo(thisMove.exitPos) > 0.5) {
            this.bot.setControlState('forward', true);
            this.bot.setControlState('sprint', true);
            this.bot.setControlState('sneak', false);
        }
        else {
            this.bot.setControlState('forward', true);
            this.bot.setControlState('sprint', false);
            this.bot.setControlState('sneak', true);
        }
        return false;
    }
    performInit(thisMove, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const breakH of thisMove.toBreak) {
                yield this.performInteraction(breakH);
            }
        });
    }
    performPerTick(thisMove, tickCount, currentIndex, path) {
        if (this.bot.entity.isInWater) {
            return tickCount > 0 && this.bot.entity.position.y <= thisMove.exitPos.y;
        }
        if (this.bot.entity.position.y < thisMove.exitPos.y)
            throw new exceptions_1.CancelError('StraightDown: too low');
        return tickCount > 0 && this.bot.entity.onGround && this.bot.entity.position.y === thisMove.exitPos.y;
    }
}
exports.StraightDownExecutor = StraightDownExecutor;
class StraightUpExecutor extends movementExecutor_1.MovementExecutor {
    isAlreadyCompleted(thisMove, tickCount, goal) {
        return this.bot.entity.position.y >= thisMove.exitPos.y;
    }
    align(thisMove) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.bot.entity.onGround || this.bot.entity.isInWater) {
                this.bot.setControlState('jump', true);
                const target = thisMove.exitPos.floored().translate(0.5, 0, 0.5);
                void this.postInitAlignToPath(thisMove, { lookAt: target });
                const off0 = thisMove.exitPos.minus(this.bot.entity.position);
                const off1 = thisMove.exitPos.minus(target);
                off0.translate(0, -off0.y, 0);
                off1.translate(0, -off1.y, 0);
                const similarDirection = off0.normalize().dot(off1.normalize()) > 0.95;
                const bb0 = mineflayer_util_plugin_1.AABBUtils.getEntityAABBRaw({ position: this.bot.entity.position, width: 0.6, height: 1.8 });
                let bb1;
                let bb2;
                let bb1Good;
                let bb2Good;
                if (this.bot.entity.isInWater) {
                    const bb1bl = this.getBlockInfo(thisMove.entryPos, 0, 0, 0);
                    bb1 = [mineflayer_util_plugin_1.AABB.fromBlockPos(thisMove.entryPos)];
                    bb1Good = bb1bl.liquid;
                    const bb2bl = this.getBlockInfo(target, 0, 0, 0);
                    bb2 = [mineflayer_util_plugin_1.AABB.fromBlock(bb2bl.position)];
                    bb2Good = bb2bl.walkthrough || bb2bl.liquid;
                }
                else {
                    const bb1bl = this.getBlockInfo(target, 0, -1, 0);
                    bb1 = bb1bl.getBBs();
                    if (bb1.length === 0)
                        bb1.push(mineflayer_util_plugin_1.AABB.fromBlock(bb1bl.position));
                    bb1Good = bb1bl.physical;
                    const bb2bl = thisMove.moveType.getBlockInfo(thisMove.exitPos.floored(), 0, -1, 0);
                    bb2 = bb2bl.getBBs();
                    if (bb2.length === 0)
                        bb2.push(mineflayer_util_plugin_1.AABB.fromBlock(bb1bl.position));
                    bb2Good = bb2bl.physical;
                }
                if ((bb1.some((b) => b.collides(bb0)) && bb1Good) || (bb2.some((b) => b.collides(bb0)) && bb2Good)) {
                    if (similarDirection)
                        return true;
                    else if (this.bot.entity.position.xzDistanceTo(target) < 0.2)
                        return true;
                }
                return false;
            }
            else {
                return yield this.align1(thisMove);
            }
        });
    }
    align1(thisMove) {
        return __awaiter(this, void 0, void 0, function* () {
            const target = thisMove.entryPos.floored().offset(0.5, 0, 0.5);
            this.bot.clearControlStates();
            void this.lookAt(target);
            const bb0 = mineflayer_util_plugin_1.AABBUtils.getEntityAABBRaw({ position: this.bot.entity.position, width: 0.6, height: 1.8 });
            const bb1bl = this.getBlockInfo(target, 0, -1, 0);
            const bb1 = bb1bl.getBBs();
            if (bb1.length === 0)
                bb1.push(mineflayer_util_plugin_1.AABB.fromBlock(bb1bl.position));
            bb1.forEach((b) => b.extend(0, 10, 0));
            const xzVel = this.bot.entity.velocity.offset(0, -this.bot.entity.velocity.y, 0);
            if (bb1.some((b) => b.contains(bb0))) {
                return this.isLookingAt(target);
            }
            if (xzVel.normalize().dot(this.bot.util.getViewDir()) <= -0.2 || this.bot.entity.position.distanceTo(target) > 0.5) {
                this.bot.setControlState('forward', true);
                this.bot.setControlState('sprint', true);
                this.bot.setControlState('sneak', false);
            }
            else {
                this.bot.setControlState('forward', true);
                this.bot.setControlState('sprint', false);
                this.bot.setControlState('sneak', true);
            }
            return false;
        });
    }
    performInit(thisMove, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (thisMove.toBreak.length > 0) {
                for (const breakH of thisMove.toBreak) {
                    yield this.lookAt(breakH.vec.offset(0.5, 0, 0.5));
                    yield this.performInteraction(breakH);
                }
            }
            if (thisMove.toPlace.length > 1)
                throw new exceptions_1.CancelError('StraightUp: toPlace.length > 1');
            for (const place of thisMove.toPlace) {
                yield this.lookAt(place.vec.offset(0.5, 0, 0.5));
                this.bot.setControlState('jump', true);
                void this.performInteraction(place);
            }
        });
    }
    performPerTick(thisMove, tickCount, currentIndex, path) {
        if (this.bot.entity.position.y < thisMove.entryPos.y)
            throw new exceptions_1.CancelError('StraightUp: too low');
        void this.align(thisMove);
        this.bot.setControlState('jump', this.bot.entity.position.y < thisMove.exitPos.y);
        if (this.bot.entity.isInWater) {
            return tickCount > 0 && this.bot.entity.position.y >= thisMove.exitPos.y;
        }
        return tickCount > 0 && this.bot.entity.onGround && this.bot.entity.position.y >= thisMove.exitPos.y;
    }
}
exports.StraightUpExecutor = StraightUpExecutor;
class ParkourForwardExecutor extends movementExecutor_1.MovementExecutor {
    constructor() {
        super(...arguments);
        this.shitterTwo = new movementUtils_1.ParkourJumpHelper(this.bot, this.world);
        this.reachedBackup = false;
        this.executing = false;
        this.stepAmt = 1;
    }
    isComplete(startMove, endMove, opts = {}) {
        return super.isComplete(startMove, endMove, opts);
    }
    cheatCode() {
        return __awaiter(this, arguments, void 0, function* (ticks = this.stepAmt) {
            let counter = 0;
            yield new Promise((resolve, reject) => {
                let leave = false;
                const listener = () => {
                    if (counter++ > ticks) {
                        this.bot.off('physicsTick', listener);
                        counter--;
                        resolve(false);
                    }
                    if (leave) {
                        this.bot.off('physicsTick', listener);
                        counter--;
                        resolve(true);
                    }
                    if ((0, movementUtils_1.leavingBlockLevel)(this.bot, this.world, 1)) {
                        leave = true;
                    }
                };
                this.bot.entity.onGround = true;
                this.bot.on('physicsTick', listener);
            });
            return counter;
        });
    }
    align(thisMove, tickCount, goal) {
        return __awaiter(this, void 0, void 0, function* () {
            this.executing = false;
            const target = thisMove.exitPos.offset(0, -1, 0);
            const targetEyeVec = this.shitterTwo.findGoalVertex(mineflayer_util_plugin_1.AABB.fromBlockPos(target));
            const test2 = this.shitterTwo.simFallOffEdge(target);
            if (test2) {
                this.executing = true;
                this.bot.setControlState('sprint', true);
                this.bot.setControlState('forward', true);
                this.bot.setControlState('jump', false);
                void this.lookAtPathPos(target);
                return true;
            }
            const bbs = (0, movementUtils_1.getUnderlyingBBs)(this.world, this.bot.entity.position, 0.6);
            if (bbs.length === 0) {
                bbs.push(mineflayer_util_plugin_1.AABB.fromBlockPos(thisMove.entryPos.offset(0, -1, 0)));
            }
            const test0 = this.shitterTwo.simForwardMove(target);
            const test1 = this.shitterTwo.simJumpFromEdge(bbs, target);
            if (this.bot.entity.onGround) {
                if (test0) {
                    this.bot.setControlState('sprint', true);
                    this.bot.setControlState('forward', true);
                    this.bot.setControlState('jump', true);
                    this.bot.setControlState('sneak', false);
                    this.bot.setControlState('jump', false);
                    void this.lookAt(targetEyeVec);
                    this.executing = true;
                    return true;
                }
                if (test1) {
                    this.bot.setControlState('sprint', true);
                    this.bot.setControlState('forward', true);
                    void this.lookAt(targetEyeVec);
                    return false;
                }
            }
            const bb = mineflayer_util_plugin_1.AABBUtils.getPlayerAABB({ position: this.bot.entity.position, width: 0.3, height: 1.8 }).extend(0, -0.252, 0);
            const ctx = mineflayer_physics_util_1.EPhysicsCtx.FROM_BOT(this.bot.physicsUtil.engine, this.bot);
            const xzVel = this.bot.entity.velocity.offset(0, -this.bot.entity.velocity.y, 0);
            if (xzVel.norm() < 0.03) {
                (0, movementUtils_1.stateLookAt)(ctx.state, targetEyeVec);
                ctx.state.control.set('forward', true);
                ctx.state.control.set('sprint', true);
            }
            const goingToFall = (0, movementUtils_1.leavingBlockLevel)(this.bot, this.world, this.stepAmt, ctx);
            if (!goingToFall && this.backUpTarget != null && bb.containsVec(this.backUpTarget)) {
                this.reachedBackup = true;
                yield this.lookAtPathPos(targetEyeVec);
                this.bot.setControlState('forward', true);
                this.bot.setControlState('sprint', true);
            }
            else if (this.bot.entity.onGround && goingToFall && this.backUpTarget == null) {
                this.stepAmt = 1;
                this.reachedBackup = false;
                this.backUpTarget = this.shitterTwo.findBackupVertex(bbs, target);
                const oldY = this.bot.entity.position.y;
                yield this.cheatCode(2);
                const currentY = this.bot.entity.position.y;
                this.bot.entity.onGround = true;
                this.bot.entity.position.y = oldY;
                const res = this.shitterTwo.simForwardMove(target);
                if (res) {
                    this.bot.setControlState('forward', true);
                    this.bot.setControlState('sprint', true);
                    this.bot.setControlState('jump', true);
                    this.executing = true;
                    return true;
                }
                else {
                    this.bot.entity.position.y = currentY;
                    yield this.lookAt(this.backUpTarget);
                    this.bot.setControlState('forward', true);
                    this.bot.setControlState('sprint', true);
                }
            }
            else if (goingToFall && this.backUpTarget != null && this.reachedBackup) {
                const oldY = this.bot.entity.position.y;
                yield this.cheatCode();
                const currentY = this.bot.entity.position.y;
                (0, utils_1.printBotControls)(this.bot);
                this.bot.entity.onGround = true;
                this.bot.entity.position.y = oldY;
                const res = this.shitterTwo.simForwardMove(target);
                if (res) {
                    this.bot.setControlState('forward', true);
                    this.bot.setControlState('sprint', true);
                    this.bot.setControlState('jump', true);
                    this.executing = true;
                    return true;
                }
                else {
                    this.bot.entity.position.y = currentY;
                    yield this.lookAtPathPos(this.backUpTarget);
                    this.bot.clearControlStates();
                    this.bot.setControlState('forward', true);
                    this.bot.setControlState('sneak', true);
                    yield this.bot.waitForTicks(1);
                    this.stepAmt = 1;
                    delete this.backUpTarget;
                    this.reachedBackup = false;
                    throw new exceptions_1.CancelError('ParkourExecutor: will not make this jump!');
                }
            }
            else if (!this.reachedBackup && this.backUpTarget != null) {
                const dist = this.bot.entity.position.xzDistanceTo(this.backUpTarget);
                void this.lookAtPathPos(this.backUpTarget);
                this.bot.setControlState('forward', true);
                this.bot.setControlState('sprint', dist > 0);
            }
            else {
                this.bot.clearControlStates();
                void this.lookAtPathPos(targetEyeVec);
                this.bot.setControlState('forward', true);
                this.bot.setControlState('sprint', true);
            }
            return false;
        });
    }
    performInit(thisMove, currentIndex, path) {
        return __awaiter(this, void 0, void 0, function* () {
            delete this.backUpTarget;
            this.reachedBackup = false;
        });
    }
    performPerTick(thisMove, tickCount, currentIndex, path) {
        const targetEyeVec = this.shitterTwo.findGoalVertex(mineflayer_util_plugin_1.AABB.fromBlockPos(thisMove.exitPos));
        if (this.executing) {
            this.bot.setControlState('jump', false);
            void this.postInitAlignToPath(thisMove, { lookAtYaw: targetEyeVec });
            return this.isComplete(thisMove);
        }
        const target = thisMove.exitPos.offset(0, -1, 0);
        const bbs = (0, movementUtils_1.getUnderlyingBBs)(this.world, this.bot.entity.position, 0.6);
        if (bbs.length === 0) {
            bbs.push(mineflayer_util_plugin_1.AABB.fromBlockPos(thisMove.entryPos));
        }
        void this.postInitAlignToPath(thisMove, { lookAtYaw: targetEyeVec });
        const test = this.shitterTwo.simForwardMove(target);
        const test1 = this.shitterTwo.simJumpFromEdge(bbs, target);
        if (test) {
            this.bot.setControlState('sprint', true);
            this.bot.setControlState('forward', true);
            this.bot.setControlState('jump', true);
            this.executing = true;
        }
        else if (test1) {
            this.bot.setControlState('sprint', true);
            this.bot.setControlState('forward', true);
        }
        else {
        }
        return false;
    }
}
exports.ParkourForwardExecutor = ParkourForwardExecutor;
//# sourceMappingURL=movementExecutors.js.map