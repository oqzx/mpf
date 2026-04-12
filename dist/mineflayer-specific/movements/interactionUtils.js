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
exports.BreakHandler = exports.PlaceHandler = exports.InteractHandler = void 0;
const vec3_1 = require("vec3");
const cacheWorld_1 = require("../world/cacheWorld");
const mineflayer_physics_util_1 = require("@nxg-org/mineflayer-physics-util");
const mineflayer_util_plugin_1 = require("@nxg-org/mineflayer-util-plugin");
const exceptions_1 = require("../exceptions");
const utils_1 = require("../../utils");
class InteractHandler {
    get settings() {
        return this.move.settings;
    }
    get vec() {
        return new vec3_1.Vec3(this.x, this.y, this.z);
    }
    get bb() {
        return mineflayer_util_plugin_1.AABB.fromBlock(this.vec);
    }
    constructor(x, y, z, type, offhand = false) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
        this.offhand = offhand;
        this.performing = false;
        this.cancelled = false;
        this._done = false;
        this._internalLock = true;
        this.blockInfo = this.toBlockInfo();
    }
    get isPerforming() {
        return this.performing;
    }
    get done() {
        return this._done;
    }
    get allowExit() {
        return !this._internalLock;
    }
    loadMove(move) {
        this.move = move;
    }
    _abort(bot) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.performing && !this.cancelled) {
                yield this.abort(bot);
                this.performing = false;
                this.cancelled = true;
            }
        });
    }
    _perform(bot_1, item_1) {
        return __awaiter(this, arguments, void 0, function* (bot, item, opts = {}) {
            if (this.performing)
                throw new Error('Already performing');
            this.performing = true;
            this._internalLock = true;
            this.task = new utils_1.Task();
            const ret = yield this.perform(bot, item, opts).catch((err) => {
                var _a;
                this._internalLock = false;
                this._done = true;
                this.performing = false;
                if (((_a = this.task) === null || _a === void 0 ? void 0 : _a.canceled) != null)
                    return;
                throw new exceptions_1.CancelError(`Failed to perform ${this.constructor.name}`, err);
            });
            this._internalLock = false;
            this._done = true;
            this.performing = false;
            return ret;
        });
    }
    getCurrentItem(bot) {
        if (this.offhand)
            return bot.inventory.slots[bot.getEquipmentDestSlot('off-hand')];
        return bot.inventory.slots[bot.getEquipmentDestSlot('hand')];
    }
    equipItem(bot, item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (item === null) {
                yield bot.unequip(this.offhand ? 'off-hand' : 'hand');
            }
            else if (this.offhand) {
                yield bot.equip(item, 'off-hand');
            }
            else {
                yield bot.equip(item, 'hand');
            }
            bot.updateHeldItem();
            yield bot.waitForTicks(2);
        });
    }
    allowExternalInfluence(bot_1) {
        return __awaiter(this, arguments, void 0, function* (bot, ticks = 1, sneak = false) {
            if (!this.performing)
                return true;
            if (!this._internalLock)
                return true;
            const res = yield this.performInfo(bot, ticks);
            if (res.ticks < Infinity)
                return true;
            const ectx = new mineflayer_physics_util_1.EntityPhysics(bot.registry);
            const state = mineflayer_physics_util_1.EPhysicsCtx.FROM_BOT(ectx, bot);
            const flag0 = bot.entity.onGround;
            for (let i = 0; i < ticks; i++) {
                ectx.simulate(state, bot.pathfinder.world);
            }
            if (flag0)
                if (state.position.y < bot.entity.position.y)
                    return false;
            if (state.state.pos.y < bot.entity.position.y)
                return false;
            return this.bb.distanceToVec(state.state.pos) < PlaceHandler.reach;
        });
    }
}
exports.InteractHandler = InteractHandler;
class PlaceHandler extends InteractHandler {
    static fromVec(vec, type, offhand = false) {
        return new PlaceHandler(vec.x, vec.y, vec.z, type, offhand);
    }
    static identTypeFromItem(item) {
        if (item.name.includes('water'))
            return 'water';
        return 'solid';
    }
    toBlockInfo() {
        switch (this.type) {
            case 'solid':
                return cacheWorld_1.BlockInfo.SOLID(this.vec);
            case 'water':
                return cacheWorld_1.BlockInfo.WATER(this.vec);
            case 'replaceable':
                return cacheWorld_1.BlockInfo.REPLACEABLE(this.vec);
            default:
                throw new Error('Invalid type');
        }
    }
    getItem(bot) {
        var _a, _b;
        switch (this.type) {
            case 'water': {
                return (_a = bot.inventory.items().find((item) => item.name === 'water_bucket')) !== null && _a !== void 0 ? _a : null;
            }
            case 'solid': {
                return (_b = bot.inventory.items().find((item) => cacheWorld_1.BlockInfo.scaffoldingBlockItems.has(item.type))) !== null && _b !== void 0 ? _b : null;
            }
            case 'replaceable': {
                throw new Error('Not implemented');
            }
            default:
                throw new Error('Not implemented');
        }
    }
    getNearbyBlocks(world) {
        return [
            world.getBlockInfo(this.vec.offset(0, 1, 0)),
            world.getBlockInfo(this.vec.offset(0, -1, 0)),
            world.getBlockInfo(this.vec.offset(0, 0, -1)),
            world.getBlockInfo(this.vec.offset(0, 0, 1)),
            world.getBlockInfo(this.vec.offset(-1, 0, 0)),
            world.getBlockInfo(this.vec.offset(1, 0, 0))
        ];
    }
    faceToVec(face) {
        switch (face) {
            case mineflayer_util_plugin_1.BlockFace.BOTTOM:
                return new vec3_1.Vec3(0, -1, 0);
            case mineflayer_util_plugin_1.BlockFace.TOP:
                return new vec3_1.Vec3(0, 1, 0);
            case mineflayer_util_plugin_1.BlockFace.NORTH:
                return new vec3_1.Vec3(0, 0, -1);
            case mineflayer_util_plugin_1.BlockFace.SOUTH:
                return new vec3_1.Vec3(0, 0, 1);
            case mineflayer_util_plugin_1.BlockFace.WEST:
                return new vec3_1.Vec3(-1, 0, 0);
            case mineflayer_util_plugin_1.BlockFace.EAST:
                return new vec3_1.Vec3(1, 0, 0);
            default:
                throw new Error('Invalid face');
        }
    }
    needToPerform(bot) {
        const blockInfo = bot.pathfinder.world.getBlockInfo(this.vec);
        if (blockInfo.isInvalid)
            return true;
        switch (this.type) {
            case 'water': {
                return !(blockInfo.liquid && cacheWorld_1.BlockInfo.waters.has(blockInfo.type));
            }
            case 'solid': {
                return !blockInfo.physical;
            }
            case 'replaceable': {
                return !(blockInfo.replaceable);
            }
        }
        return true;
    }
    performInfo(bot_1) {
        return __awaiter(this, arguments, void 0, function* (bot, ticks = 15, scale = 0.5) {
            switch (this.type) {
                case 'water': {
                    throw new Error('Not implemented');
                }
                case 'solid': {
                    const works = [];
                    let startTick = 0;
                    let shiftTick = Infinity;
                    let i = 0;
                    for (; i <= ticks; i++) {
                        const ectx = mineflayer_physics_util_1.EPhysicsCtx.FROM_BOT(bot.physicsUtil.engine, bot);
                        const state = ectx.state;
                        state.control.set('sneak', shiftTick < Infinity);
                        for (let j = 0; j < i; j++) {
                            bot.physicsUtil.engine.simulate(ectx, bot.world);
                        }
                        const eyePos = state.pos.offset(0, 1.62, 0);
                        const bb1 = mineflayer_util_plugin_1.AABBUtils.getEntityAABBRaw({ position: state.pos, width: 0.6, height: 1.8 });
                        const dx = state.pos.x - (this.vec.x + 0.5);
                        const dy = state.pos.y + bot.entity.height - (this.vec.y + 0.5);
                        const dz = state.pos.z - (this.vec.z + 0.5);
                        const visibleFaces = {
                            y: Math.sign(Math.abs(dy) >= 0 ? dy : 0),
                            x: Math.sign(Math.abs(dx) >= 0 ? dx : 0),
                            z: Math.sign(Math.abs(dz) >= 0 ? dz : 0)
                        };
                        const verts = Object.entries(visibleFaces).flatMap(([k, v]) => {
                            return [
                                this.vec.offset(0.5 + (k === 'x' ? visibleFaces[k] * 0.49 : 0), 0.5 + (k === 'y' ? visibleFaces[k] * 0.49 : 0), 0.5 + (k === 'z' ? visibleFaces[k] * 0.49 : 0))
                            ];
                        });
                        let good = 0;
                        for (const vert of verts) {
                            const rayRes = (yield bot.world.raycast(eyePos, vert.minus(eyePos).normalize().scale(scale), PlaceHandler.reach / scale));
                            if (rayRes === null)
                                continue;
                            const pos = rayRes.position.plus(this.faceToVec(rayRes.face));
                            if (pos.equals(this.vec)) {
                                if (bb1.containsVec(rayRes.intersect))
                                    continue;
                                if (mineflayer_util_plugin_1.AABB.fromBlock(pos).intersects(bb1)) {
                                    if (shiftTick === Infinity) {
                                        shiftTick = i;
                                        i--;
                                    }
                                    continue;
                                }
                                good++;
                                if (startTick === 0)
                                    startTick = i;
                                works.push(rayRes);
                            }
                        }
                        if (works.length !== 0) {
                            if (good === 0)
                                return { ticks: Math.floor((i + startTick) / 2), tickAllowance: i - startTick, shiftTick, raycasts: works };
                        }
                    }
                    return { ticks: Infinity, tickAllowance: Infinity, shiftTick: Infinity, raycasts: works };
                }
                case 'replaceable': {
                    throw new Error('Not implemented');
                }
                default: {
                    throw new Error('Not implemented');
                }
            }
        });
    }
    perform(bot_1, item_1) {
        return __awaiter(this, arguments, void 0, function* (bot, item, opts = {}) {
            var _a, _b;
            const curInfo = { yaw: bot.entity.yaw, pitch: bot.entity.pitch };
            if (item === null)
                throw new Error('Invalid item');
            switch (this.type) {
                case 'water': {
                    if (item.name !== 'water_bucket')
                        throw new Error('Invalid item');
                    if (this.getCurrentItem(bot) !== item)
                        yield this.equipItem(bot, item);
                    yield bot.lookAt(this.vec, this.settings.forceLook);
                    bot.activateItem(this.offhand);
                    break;
                }
                case 'solid': {
                    if (this.getCurrentItem(bot) !== item)
                        yield this.equipItem(bot, item);
                    const predictBlock = (_a = opts.predictBlock) !== null && _a !== void 0 ? _a : true;
                    let works;
                    if (opts.info === undefined) {
                        works = yield this.performInfo(bot);
                    }
                    else
                        works = opts.info;
                    while (works.raycasts.length === 0) {
                        yield bot.waitForTicks(1);
                        works = yield this.performInfo(bot);
                    }
                    const stateEyePos = bot.entity.position.offset(0, 1.62, 0);
                    const lookDir = bot.util.getViewDir();
                    works.raycasts.sort((a, b) => b.intersect.minus(stateEyePos).dot(lookDir) - a.intersect.minus(stateEyePos).dot(lookDir));
                    const rayRes = works.raycasts[0];
                    if (rayRes === undefined)
                        throw new Error('Invalid block');
                    const pos = rayRes.position.plus(this.faceToVec(rayRes.face));
                    const posBl = mineflayer_util_plugin_1.AABB.fromBlock(pos);
                    let i = 0;
                    for (; i < works.ticks; i++) {
                        if (i === works.shiftTick)
                            bot.setControlState('sneak', true);
                        const ectx = mineflayer_physics_util_1.EPhysicsCtx.FROM_BOT(bot.physicsUtil.engine, bot);
                        const state = ectx.state;
                        bot.physicsUtil.engine.simulate(ectx, bot.world);
                        const sPos = state.pos.offset(0, 1.62, 0);
                        const testCheck = (yield bot.world.raycast(sPos, rayRes.intersect.minus(sPos).normalize().scale(0.5), PlaceHandler.reach * 2));
                        if (testCheck === null)
                            break;
                        const pos1 = testCheck.position.plus(this.faceToVec(testCheck.face));
                        const pos1Bl = mineflayer_util_plugin_1.AABB.fromBlock(pos1);
                        if (testCheck.position.equals(rayRes.position) && testCheck.face === rayRes.face && !state.getBB().intersects(pos1Bl)) {
                            if (i < works.ticks - 1 && works.ticks !== 0) {
                                yield bot.waitForTicks(1);
                            }
                            break;
                        }
                        yield bot.waitForTicks(1);
                    }
                    const botBB = mineflayer_util_plugin_1.AABBUtils.getEntityAABBRaw({ position: bot.entity.position, width: 0.6, height: 1.8 });
                    if (!this.move.isLookingAt(rayRes.intersect)) {
                        yield this.move.lookAt(rayRes.intersect);
                        yield bot.lookAt(rayRes.intersect, this.settings.forceLook);
                    }
                    const invalidPlacement = botBB.intersects(posBl);
                    if (invalidPlacement) {
                        yield bot.lookAt(rayRes.intersect, this.settings.forceLook);
                        throw new exceptions_1.CancelError('Invalid placement');
                    }
                    let finished = false;
                    let sneaking = false;
                    const direction = this.faceToVec(rayRes.face);
                    this._placeTask = bot._placeBlockWithOptions(rayRes, direction, { forceLook: 'ignore', swingArm: 'right' });
                    if (predictBlock) {
                        bot.world.setBlock(rayRes.position.plus(direction), cacheWorld_1.BlockInfo.PBlock.fromStateId(cacheWorld_1.BlockInfo.substituteBlockStateId, 0));
                    }
                    this._internalLock = false;
                    setTimeout(() => {
                        if (finished)
                            return;
                        sneaking = true;
                        bot.setControlState('sneak', true);
                    }, Math.max(30 - bot._client.latency, 0));
                    yield this._placeTask;
                    finished = true;
                    if (sneaking)
                        bot.setControlState('sneak', false);
                    if (works.shiftTick !== Infinity)
                        bot.setControlState('sneak', false);
                    (_b = this.task) === null || _b === void 0 ? void 0 : _b.finish();
                    break;
                }
                case 'replaceable':
                default: {
                    throw new Error('Not implemented');
                }
            }
            if (opts.returnToPos !== undefined) {
                yield bot.lookAt(opts.returnToPos, this.settings.forceLook);
            }
            else if (opts.returnToStart != null && opts.returnToStart) {
                yield bot.look(curInfo.yaw, curInfo.pitch, this.settings.forceLook);
            }
            this._done = true;
            this.performing = false;
            delete this._placeTask;
        });
    }
    abort(bot) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((this.task != null) && !this.task.done) {
                this.task.finish();
                this.task.canceled = true;
            }
            if (this._placeTask != null) {
                switch (this.type) {
                    case 'water': {
                        break;
                    }
                    case 'solid': {
                        break;
                    }
                    case 'replaceable': {
                        break;
                    }
                }
                yield this._placeTask.catch(() => { });
            }
        });
    }
}
exports.PlaceHandler = PlaceHandler;
PlaceHandler.reach = 4;
class BreakHandler extends InteractHandler {
    static fromVec(vec, type, offhand = false) {
        return new BreakHandler(vec.x, vec.y, vec.z, type, offhand);
    }
    toBlockInfo() {
        return cacheWorld_1.BlockInfo.AIR(this.vec);
    }
    getBlock(world) {
        return world.getBlock(this.vec);
    }
    getItem(bot, block) {
        var _a;
        switch (this.type) {
            case 'water': {
                return (_a = bot.inventory.items().find((item) => item.name === 'bucket')) !== null && _a !== void 0 ? _a : null;
            }
            case 'solid': {
                return bot.pathingUtil.bestHarvestingTool(block);
            }
            case 'replaceable': {
                throw new Error('Not implemented');
            }
            default:
                throw new Error('Not implemented');
        }
    }
    needToPerform(bot) {
        var _a;
        const blockInfo = bot.pathfinder.world.getBlockInfo(this.vec);
        if (blockInfo.isInvalid)
            return true;
        if (((_a = blockInfo.block) === null || _a === void 0 ? void 0 : _a.boundingBox) === 'empty' && !cacheWorld_1.BlockInfo.liquids.has(blockInfo.type))
            return false;
        return true;
    }
    performInfo(bot_1) {
        return __awaiter(this, arguments, void 0, function* (bot, ticks = 15) {
            const bb = mineflayer_util_plugin_1.AABB.fromBlock(this.vec);
            return bb.distanceToVec(bot.entity.position.offset(0, 1.62, 0)) < BreakHandler.reach + 5
                ? { ticks: 0, tickAllowance: 0, shiftTick: 0, raycasts: [] }
                : { ticks: Infinity, tickAllowance: Infinity, shiftTick: Infinity, raycasts: [] };
        });
    }
    perform(bot_1) {
        return __awaiter(this, arguments, void 0, function* (bot, item = null, opts = {}) {
            var _a;
            const curInfo = { yaw: bot.entity.yaw, pitch: bot.entity.pitch };
            switch (this.type) {
                case 'water': {
                    if (item === null)
                        throw new Error('No item');
                    if (item.name !== 'bucket')
                        throw new Error('Invalid item');
                    if (this.getCurrentItem(bot) !== item)
                        yield this.equipItem(bot, item);
                    yield bot.lookAt(this.vec, this.settings.forceLook);
                    bot.activateItem(this.offhand);
                    break;
                }
                case 'solid': {
                    if (item === null) {
                        if (this.getCurrentItem(bot) !== null)
                            yield bot.unequip(this.offhand ? 'off-hand' : 'hand');
                    }
                    else if (this.getCurrentItem(bot) !== item)
                        yield this.equipItem(bot, item);
                    const block = yield bot.world.getBlock(this.vec);
                    if (block == null)
                        throw new Error('Invalid block');
                    yield bot.lookAt(this.vec, this.settings.forceLook);
                    this._breakTask = bot.dig(block, 'ignore', 'raycast');
                    yield this._breakTask;
                    if (this.task != null)
                        this.task.finish();
                    break;
                }
                case 'replaceable': {
                    throw new Error('Not implemented');
                }
                default: {
                    throw new Error('Not implemented');
                }
            }
            if (opts.returnToPos !== undefined) {
                yield bot.lookAt(opts.returnToPos, this.settings.forceLook);
            }
            else {
                const look = (_a = opts.returnToStart) !== null && _a !== void 0 ? _a : false;
                if (look)
                    yield bot.look(curInfo.yaw, curInfo.pitch, this.settings.forceLook);
            }
            delete this._breakTask;
        });
    }
    abort(bot) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((this.task != null) && !this.task.done) {
                this.task.finish();
                this.task.canceled = true;
            }
            if (this._breakTask != null) {
                switch (this.type) {
                    case 'water': {
                        break;
                    }
                    case 'solid': {
                        bot.stopDigging();
                        break;
                    }
                    case 'replaceable': {
                        break;
                    }
                }
                yield this._breakTask.catch(() => { });
            }
        });
    }
}
exports.BreakHandler = BreakHandler;
BreakHandler.reach = 4;
//# sourceMappingURL=interactionUtils.js.map