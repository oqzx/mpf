"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialPathProducer = void 0;
const algs_1 = require("../../mineflayer-specific/algs");
const movements_1 = require("../movements");
class PartialPathProducer {
    get maxPathLength() {
        return this.bot.pathfinder.pathfinderSettings.partialPathLength;
    }
    get lastAstarContext() {
        return this._lastContext;
    }
    constructor(start, goal, settings, bot, world, movements) {
        this.latestMoves = [];
        this.latestClosedNodeCount = 0;
        this.latestCost = 0;
        this.lastPath = [];
        this.gcInterval = 10;
        this.lastGc = 0;
        this.startTime = performance.now();
        this.lastStartTime = performance.now();
        this.consideredNodeCount = 0;
        this.latestMoveCount = 0;
        this.start = start;
        this.goal = goal;
        this.settings = settings;
        this.bot = bot;
        this.world = world;
        this.movements = movements;
    }
    getAstarContext() {
        return this._lastContext;
    }
    getCurrentPath() {
        return this.lastPath;
    }
    getSliceLen(orgLen) {
        return Math.min(orgLen - 1, Math.floor(orgLen * 0.9));
    }
    handleAstarContext(foundPathLen, maxPathLen = this.maxPathLength) {
        if (this._lastContext != null && foundPathLen <= maxPathLen) {
            return this._lastContext;
        }
        return this.generateAstarContext();
    }
    generateAstarContext() {
        const moveHandler = movements_1.MovementHandler.create(this.bot, this.world, this.movements, this.settings);
        moveHandler.loadGoal(this.goal);
        let start;
        if (this.latestMove != null) {
            start = this.latestMove;
        }
        else {
            start = this.start;
        }
        const ret = new algs_1.AStar(start, moveHandler, this.goal, -1, 40, -1, 0);
        return ret;
    }
    advance() {
        var _a, _b, _c, _d, _e, _f, _g;
        if (this._lastContext == null)
            this._lastContext = this.generateAstarContext();
        const result = this._lastContext.compute();
        let status = result.status;
        if (result.status === 'noPath') {
            this.latestMoves.pop();
            if (this.latestMoves.length === 0) {
                const astarContext = this._lastContext;
                delete this._lastContext;
                return {
                    result: Object.assign(Object.assign({}, result), { status, cost: this.latestCost, path: this.lastPath }),
                    astarContext
                };
            }
        }
        if (result.path.length > this.maxPathLength || result.status === 'success') {
            status = status === 'success' ? 'success' : 'partialSuccess';
            const val = this.getSliceLen(result.path.length);
            this.latestMove = result.path[val];
            const toTake = result.path.slice(0, val + 1);
            this.latestMoves.push(this.latestMove);
            this.lastPath = [...this.lastPath, ...toTake];
            const cost = toTake.reduce((acc, move) => acc + move.cost, 0);
            const nodecount = (_b = (_a = this._lastContext) === null || _a === void 0 ? void 0 : _a.nodeConsiderCount) !== null && _b !== void 0 ? _b : 0;
            const seensize = (_d = (_c = this._lastContext) === null || _c === void 0 ? void 0 : _c.closedDataSet.size) !== null && _d !== void 0 ? _d : 0;
            const movecount = (_f = (_e = this._lastContext) === null || _e === void 0 ? void 0 : _e.moveConsiderCount) !== null && _f !== void 0 ? _f : 0;
            this.latestCost += cost;
            this.consideredNodeCount += nodecount;
            this.latestClosedNodeCount += seensize;
            this.latestMoveCount += movecount;
            console.info('Partial Path cost increased by', cost, 'to', this.latestCost, 'total', (_g = this.latestMove) === null || _g === void 0 ? void 0 : _g.vec);
            const time1 = performance.now() - this.lastStartTime;
            console.log('\nthis iter:', time1);
            console.log('itered considered nodes', nodecount, 'nodes/s', (nodecount / time1) * 1000);
            console.log('itered seen size', seensize, 'nodes/s', (seensize / time1) * 1000);
            console.log('itered move considered', movecount, 'nodes/s', (movecount / time1) * 1000);
            this.lastStartTime = performance.now();
            const time = performance.now() - this.startTime;
            console.log('\ntotal', time, 'ms');
            console.log('total considered nodes', this.consideredNodeCount, time, (this.consideredNodeCount / time) * 1000, 'nodes/s');
            console.log('total seen size', this.latestClosedNodeCount, time, (this.latestClosedNodeCount / time) * 1000, 'nodes/s');
            console.log('total move considered', this.latestMoveCount, time, (this.latestMoveCount / time) * 1000, 'nodes/s');
        }
        const ret = {
            result: Object.assign(Object.assign({}, result), { status, cost: this.latestCost, path: this.lastPath }),
            astarContext: this._lastContext
        };
        this._lastContext = this.handleAstarContext(result.path.length);
        return ret;
    }
    mergePathspath(path1, path2) {
        let newPath = path1;
        for (let i = 0; i < path2.length; i++) {
            if (path1[i] === undefined) {
                newPath = newPath.concat(path2.slice(i));
                break;
            }
            if (path1[i].exitPos.distanceTo(path2[i].entryPos) > 0.5) {
                newPath = newPath.concat(path2.slice(i));
                break;
            }
        }
    }
}
exports.PartialPathProducer = PartialPathProducer;
//# sourceMappingURL=partialPathProducer.js.map