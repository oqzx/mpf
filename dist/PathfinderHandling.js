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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathfinderHandler = void 0;
const goals = __importStar(require("./mineflayer-specific/goals"));
const move_1 = require("./mineflayer-specific/move");
const cacheWorld_1 = require("./mineflayer-specific/world/cacheWorld");
const exceptions_1 = require("./mineflayer-specific/exceptions");
const movements_1 = require("./mineflayer-specific/movements");
const movementProviders_1 = require("./mineflayer-specific/movements/movementProviders");
const movementExecutors_1 = require("./mineflayer-specific/movements/movementExecutors");
const optimizers_1 = require("./mineflayer-specific/post/optimizers");
const post_1 = require("./mineflayer-specific/post");
const pathProducers_1 = require("./mineflayer-specific/pathProducers");
const mineflayer_util_plugin_1 = require("@nxg-org/mineflayer-util-plugin");
const algorithms_1 = require("./abstract/algorithms");
const utils_1 = require("./utils");
const DEFAULT_PATHFINDER_OPTS = {
    partialPathProducer: false,
    partialPathLength: 50
};
const DEFAULT_PROVIDER_EXECUTORS = [
    [movementProviders_1.Forward, movementExecutors_1.NewForwardExecutor],
    [movementProviders_1.ForwardJump, movementExecutors_1.NewForwardJumpExecutor],
    [movementProviders_1.ForwardDropDown, movementExecutors_1.ForwardDropDownExecutor],
    [movementProviders_1.Diagonal, movementExecutors_1.NewForwardExecutor],
    [movementProviders_1.StraightDown, movementExecutors_1.StraightDownExecutor],
    [movementProviders_1.StraightUp, movementExecutors_1.StraightUpExecutor],
    [movementProviders_1.ParkourForward, movementExecutors_1.ParkourForwardExecutor]
];
DEFAULT_PROVIDER_EXECUTORS.reverse();
const DEFAULT_OPTIMIZERS = [
    [movementProviders_1.Forward, optimizers_1.LandStraightAheadOpt],
    [movementProviders_1.Diagonal, optimizers_1.LandStraightAheadOpt],
    [movementProviders_1.ForwardDropDown, optimizers_1.DropDownOpt],
    [movementProviders_1.ForwardJump, optimizers_1.ForwardJumpUpOpt]
];
const DEFAULT_SETUP = new Map(DEFAULT_PROVIDER_EXECUTORS);
const DEFAULT_OPTIMIZATION = new Map(DEFAULT_OPTIMIZERS);
class PathfinderHandler {
    get currentAStar() {
        var _a;
        return (_a = this._currentProducer) === null || _a === void 0 ? void 0 : _a.getAstarContext();
    }
    get currentProducer() {
        return this._currentProducer;
    }
    get isPathing() {
        return this.executeTask.done;
    }
    constructor(bot, opts = {}) {
        var _a, _b, _c, _d, _e;
        this.bot = bot;
        this.currentIndex = 0;
        this.executeTask = mineflayer_util_plugin_1.Task.createDoneTask();
        this.abortCalculation = false;
        this.userAborted = false;
        this.reconstructPath = algorithms_1.reconstructPath;
        this.world = (_a = opts.world) !== null && _a !== void 0 ? _a : new cacheWorld_1.CacheSyncWorld(bot, bot.world);
        const moveSettings = (_b = opts.moveSettings) !== null && _b !== void 0 ? _b : movements_1.DEFAULT_MOVEMENT_OPTS;
        const pathfinderSettings = (_c = opts.pathfinderSettings) !== null && _c !== void 0 ? _c : DEFAULT_PATHFINDER_OPTS;
        const optimizers = (_d = opts.optimizers) !== null && _d !== void 0 ? _d : DEFAULT_OPTIMIZATION;
        const moveSetup = (_e = opts.movements) !== null && _e !== void 0 ? _e : DEFAULT_SETUP;
        this.world = new cacheWorld_1.CacheSyncWorld(bot, this.bot.world);
        const moves = new Map();
        for (const [providerType, ExecutorType] of moveSetup) {
            moves.set(providerType, new ExecutorType(bot, this.world, moveSettings));
        }
        const opts2 = new Map();
        for (const [providerType, ExecutorType] of optimizers) {
            opts2.set(providerType, new ExecutorType(bot, this.world));
        }
        this.movements = moves;
        this.optimizers = opts2;
        this.defaultMoveSettings = moveSettings;
        this.pathfinderSettings = pathfinderSettings;
        this.astar = null;
        this.setupListeners();
    }
    setExecutor(provider, Executor) {
        if (Executor instanceof movements_1.MovementExecutor) {
            this.movements.set(provider, Executor);
        }
        else {
            this.movements.set(provider, new Executor(this.bot, this.world, this.defaultMoveSettings));
        }
    }
    setOptimizer(provider, Optimizer) {
        if (Optimizer instanceof post_1.MovementOptimizer) {
            this.optimizers.set(provider, Optimizer);
        }
        else {
            this.optimizers.set(provider, new Optimizer(this.bot, this.world));
        }
    }
    setMoveOptions(settings) {
        this.defaultMoveSettings = Object.assign({}, movements_1.DEFAULT_MOVEMENT_OPTS, settings);
        for (const [, executor] of this.movements) {
            executor.settings = this.defaultMoveSettings;
        }
    }
    setOptions(settings) {
        this.pathfinderSettings = Object.assign({}, DEFAULT_PATHFINDER_OPTS, settings);
    }
    dropMovment(provider) {
        this.movements.delete(provider);
    }
    dropAllMovements() {
        this.movements.clear();
    }
    cancel() {
        return __awaiter(this, void 0, void 0, function* () {
            this.userAborted = true;
            yield this.interrupt(1000, true);
        });
    }
    interrupt() {
        return __awaiter(this, arguments, void 0, function* (timeout = 1000, cancelCalculation = true, reasonStr) {
            if (this._currentProducer == null)
                return console.log('no producer');
            this.abortCalculation = cancelCalculation;
            if (this.currentExecutor == null)
                return console.log('no executor');
            if (this.currentMove == null)
                throw new Error('No current move, but there is a current executor.');
            let reason;
            if (reasonStr != null) {
                switch (reasonStr) {
                    case 'blockUpdate':
                        reason = new exceptions_1.ResetError('blockUpdate');
                        break;
                    case 'chunkLoad':
                        reason = new exceptions_1.ResetError('chunkLoad');
                        break;
                    case 'goalUpdated':
                        reason = new exceptions_1.ResetError('goalUpdated');
                        break;
                }
            }
            this.resetReason = reasonStr;
            yield this.currentExecutor.abort(this.currentMove, { timeout, reason });
        });
    }
    reset(reason_1) {
        return __awaiter(this, arguments, void 0, function* (reason, cancelTimeout = 1000) {
            this.bot.emit('resetPath', reason);
            yield this.interrupt(cancelTimeout, true, reason);
        });
    }
    setupListeners() {
        this.bot.on('blockUpdate', (oldblock, newBlock) => {
            if (oldblock == null || newBlock == null)
                return;
            if (this.curPath == null)
                return;
            if (this.updateMatchesWanted(newBlock))
                return;
            if (this.isPositionNearPath(oldblock.position) && oldblock.type !== newBlock.type) {
                void this.reset('blockUpdate');
            }
        });
        this.bot.on('chunkColumnLoad', (chunk) => {
            const astarContext = this.currentAStar;
            if (astarContext == null)
                return;
            const cx = chunk.x >> 4;
            const cz = chunk.z >> 4;
            if (astarContext.visitedChunks.has(`${cx - 1},${cz}`) ||
                astarContext.visitedChunks.has(`${cx},${cz - 1}`) ||
                astarContext.visitedChunks.has(`${cx + 1},${cz}`) ||
                astarContext.visitedChunks.has(`${cx},${cz + 1}`)) {
                void this.reset('chunkLoad');
            }
        });
    }
    updateMatchesWanted(block, path = this.curPath) {
        if (block == null || path == null)
            return false;
        const pos = block.position.floored();
        for (let i = this.currentIndex; i < path.length; i++) {
            const move = path[i];
            for (const place of move.toPlace) {
                if (place.vec.equals(pos)) {
                    switch (place.type) {
                        case 'solid':
                            return block.boundingBox === 'block';
                        case 'water':
                            return cacheWorld_1.BlockInfo.waters.has(block.type);
                        case 'replaceable':
                            return cacheWorld_1.BlockInfo.replaceables.has(block.type);
                    }
                }
            }
            for (const br of move.toBreak) {
                if (br.vec.equals(pos)) {
                    return block.boundingBox === 'empty' && !cacheWorld_1.BlockInfo.liquids.has(block.type);
                }
            }
        }
        return false;
    }
    isPositionNearPath(pos, path = this.curPath) {
        if (pos == null || path == null)
            return false;
        for (const move of path) {
            let comparisonPoint = null;
            comparisonPoint = (0, utils_1.closestPointOnLineSegment)(pos, move.entryPos, move.exitPos);
            const dx = Math.abs(comparisonPoint.x - pos.x - 0.5);
            const dy = Math.abs(comparisonPoint.y - pos.y - 0.5);
            const dz = Math.abs(comparisonPoint.z - pos.z - 0.5);
            if (dx <= 1 && dy <= 2 && dz <= 1) {
                return true;
            }
        }
        return false;
    }
    registerAll(goal, opts) {
        const boundEvent = goal._hasChanged.bind(goal);
        const boundValid = goal.isValid.bind(goal);
        const fuckEvent = [];
        const fuckValid = [];
        const newOnHasUpdate = () => {
            if (opts.onHasUpdate != null)
                opts.onHasUpdate();
            if (opts.forAll != null)
                opts.forAll();
            for (const [key, val] of fuckEvent) {
                this.bot.off(key, val);
            }
            for (const [key, val] of fuckValid) {
                this.bot.off(key, val);
            }
        };
        const newOnInvalid = () => {
            if (opts.onInvalid != null)
                opts.onInvalid();
            if (opts.forAll != null)
                opts.forAll();
            for (const [key, val] of fuckValid) {
                this.bot.off(key, val);
            }
            for (const [key, val] of fuckEvent) {
                this.bot.off(key, val);
            }
        };
        const cleanup = () => {
            if (opts.onCleanup != null)
                opts.onCleanup();
            if (opts.forAll != null)
                opts.forAll();
            for (const [key, val] of fuckValid) {
                this.bot.off(key, val);
            }
            for (const [key, val] of fuckEvent) {
                this.bot.off(key, val);
            }
        };
        for (const key of goal._eventKeys) {
            const listener = (...args) => {
                if (this.userAborted)
                    return cleanup();
                if (boundEvent(key, ...args))
                    newOnHasUpdate();
            };
            this.bot.on(key, listener);
            fuckEvent.push([key, listener]);
        }
        for (const key of goal._validKeys) {
            const listener1 = (...args) => {
                if (this.userAborted)
                    return cleanup();
                if (boundValid(key, ...args))
                    newOnInvalid();
            };
            this.bot.on(key, listener1);
            fuckValid.push([key, listener1]);
        }
        goal.cleanup = cleanup;
        return cleanup;
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    getPathTo(goal, settings = this.defaultMoveSettings) {
        return this.getPathFromTo(this.bot.entity.position, this.bot.entity.velocity, goal, settings);
    }
    getPathFromTo(startPos_1, startVel_1, goal_1) {
        return __asyncGenerator(this, arguments, function* getPathFromTo_1(startPos, startVel, goal, settings = this.defaultMoveSettings) {
            this.abortCalculation = false;
            delete this.resetReason;
            this.currentMove = move_1.Move.startMove(new movementProviders_1.IdleMovement(this.bot, this.world), startPos.clone(), startVel.clone(), (0, utils_1.getScaffoldCount)(this.bot));
            this.currentExecutor = new movementExecutors_1.IdleMovementExecutor(this.bot, this.world, this.defaultMoveSettings);
            this.bot.pathingUtil.refresh();
            if (this.pathfinderSettings.partialPathProducer) {
                this._currentProducer = new pathProducers_1.PartialPathProducer(this.currentMove, goal, settings, this.bot, this.world, this.movements);
            }
            else {
                this._currentProducer = new pathProducers_1.ContinuousPathProducer(this.currentMove, goal, settings, this.bot, this.world, this.movements);
            }
            let ticked = false;
            const listener = () => {
                ticked = true;
            };
            const cleanup = () => {
                this.bot.off('physicsTick', listener);
            };
            let result, astarContext;
            do {
                const res = this._currentProducer.advance();
                result = res.result;
                astarContext = res.astarContext;
                if (result.status === 'success') {
                    cleanup();
                    this.bot.emit('pathGenerated', result);
                    movements_1.MovementHandler.count = 0;
                    movements_1.MovementHandler.totCount = 0;
                    yield yield __await({ result, astarContext });
                    return yield __await({ result, astarContext });
                }
                if (this.abortCalculation) {
                    cleanup();
                    result.status = 'canceled';
                    yield yield __await({ result, astarContext });
                    return yield __await({ result, astarContext });
                }
                yield yield __await({ result, astarContext });
                if (!ticked) {
                    yield __await(this.bot.waitForTicks(1));
                }
                ticked = false;
            } while (result.status === 'partial' || result.status === 'partialSuccess');
            cleanup();
            return yield __await({
                result,
                astarContext
            });
        });
    }
    getPathFromToRaw(startPos, startVel, goal) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            try {
                for (var _d = true, _e = __asyncValues(this.getPathFromTo(startPos, startVel, goal)), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const res = _c;
                    if (res.result.status !== 'success') {
                        if (res.result.status === 'noPath' || res.result.status === 'timeout')
                            return null;
                    }
                    else {
                        return res.result;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return null;
        });
    }
    postProcess(pathInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const optimizer = new post_1.Optimizer(this.bot, this.world, this.optimizers);
            optimizer.loadPath(pathInfo.path);
            const res = yield optimizer.compute();
            const ret = Object.assign({}, pathInfo);
            ret.path = res;
            return ret;
        });
    }
    cleanupBot() {
        return __awaiter(this, void 0, void 0, function* () {
            this.bot.clearControlStates();
            for (const [, executor] of this.movements) {
                executor.reset();
            }
        });
    }
    cleanupClient() {
        this.abortCalculation = false;
        this.userAborted = false;
        delete this.resetReason;
        delete this.currentGotoGoal;
        delete this.curPath;
        delete this.currentMove;
        delete this.currentExecutor;
    }
    cleanupAll(goal, lastMove) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (goal instanceof goals.GoalDynamic && goal.dynamic) {
                (_a = goal.cleanup) === null || _a === void 0 ? void 0 : _a.call(goal);
            }
            yield this.cleanupBot();
            if (lastMove != null && !this.abortCalculation)
                yield goal.onFinish(lastMove);
            yield this.cleanupBot();
            (_c = (_b = this.world).cleanup) === null || _c === void 0 ? void 0 : _c.call(_b);
            if (this.userAborted)
                this.bot.emit('goalAborted', goal);
            else
                this.bot.emit('goalFinished', goal);
            this.abortCalculation = false;
            this.userAborted = false;
            this.executeTask.finish();
            this.cleanupClient();
        });
    }
}
exports.PathfinderHandler = PathfinderHandler;
class Perform {
    constructor(bot, handler, goal) {
        this.bot = bot;
        this.handler = handler;
        this.goal = goal;
        this.currentIndex = 0;
        this.curPath = [];
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.currentIndex < this.curPath.length) {
                const move = this.curPath[this.currentIndex];
                const executor = this.handler.movements.get(move.moveType.constructor);
                if (executor == null)
                    throw new Error('No executor for move type.');
                try {
                    yield executor.perform(move, this.currentIndex, this.curPath);
                }
                catch (err) {
                    if (err instanceof exceptions_1.AbortError) {
                        return;
                    }
                    else if (err instanceof exceptions_1.ResetError) {
                        return;
                    }
                    else if (err instanceof exceptions_1.CancelError) {
                        void this.identRecover();
                        return;
                    }
                    else {
                        throw err;
                    }
                }
            }
        });
    }
    identRecover() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    updatePerformPath(newPath) {
        if (this.curPath == null)
            return;
        if (newPath.length < this.curPath.length)
            throw new Error('new path is shorter than current path');
        for (let i = this.curPath.length - 1; i >= 0; i--) {
            const move = this.curPath[i];
            if (!move.entryPos.equals(newPath[0].entryPos))
                continue;
            if (i > this.currentIndex) {
                this.curPath = this.curPath.slice(0, i + 1).concat(newPath.slice(1));
            }
            else if (i === this.currentIndex) {
                if (this.curPath[i].exitPos.equals(newPath[0].entryPos))
                    this.curPath = this.curPath.slice(0, i).concat(newPath);
                else
                    throw new Error('overlap is not clean');
            }
            else if (i < this.currentIndex)
                throw new Error('overlap is not clean');
        }
    }
}
//# sourceMappingURL=PathfinderHandling.js.map