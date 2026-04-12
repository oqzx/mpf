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
exports.Task = exports.getScaffoldCount = exports.debug = void 0;
exports.printBotControls = printBotControls;
exports.closestPointOnLineSegment = closestPointOnLineSegment;
exports.getNormalizedPos = getNormalizedPos;
exports.onceWithCleanup = onceWithCleanup;
exports.getViewDir = getViewDir;
const vec3_1 = require("vec3");
const cacheWorld_1 = require("./mineflayer-specific/world/cacheWorld");
function printBotControls(bot) {
}
const debug = (bot, ...args) => {
    if (bot != null) {
        bot.chat(args.join(' '));
    }
    console.trace(...args);
};
exports.debug = debug;
const getScaffoldCount = (bot) => {
    if (!cacheWorld_1.BlockInfo.initialized)
        throw new Error('BlockInfo not initialized');
    const amt = bot.inventory.items().reduce((acc, item) => (cacheWorld_1.BlockInfo.scaffoldingBlockItems.has(item.type) ? item.count + acc : acc), 0);
    if (bot.game.gameMode === 'creative') {
        return amt > 0 ? Infinity : 0;
    }
    return amt;
};
exports.getScaffoldCount = getScaffoldCount;
function closestPointOnLineSegment(point, segmentStart, segmentEnd) {
    const segmentLength = segmentEnd.minus(segmentStart).norm();
    if (segmentLength === 0) {
        return segmentStart;
    }
    const t = point.minus(segmentStart).dot(segmentEnd.minus(segmentStart)) / Math.pow(segmentLength, 2);
    if (t < 0) {
        return segmentStart;
    }
    if (t > 1) {
        return segmentEnd;
    }
    return segmentStart.plus(segmentEnd.minus(segmentStart).scaled(t));
}
function getNormalizedPos(bot, startPos) {
    if (!cacheWorld_1.BlockInfo.initialized)
        throw new Error('BlockInfo not initialized');
    const pos = startPos !== null && startPos !== void 0 ? startPos : bot.entity.position.clone();
    const block = bot.pathfinder.world.getBlockInfo(pos);
    if (cacheWorld_1.BlockInfo.carpets.has(block.type)) {
        return pos.floor();
    }
    return pos;
}
function onceWithCleanup(emitter_1, event_1) {
    return __awaiter(this, arguments, void 0, function* (emitter, event, options = {}) {
        return yield new Promise((resolve, reject) => {
            var _a;
            const timeout = (_a = options.timeout) !== null && _a !== void 0 ? _a : 10000;
            let checkCondition;
            if (options.checkCondition != null)
                checkCondition = options.checkCondition;
            else
                checkCondition = () => true;
            const timeoutId = setTimeout(() => {
                emitter.removeListener(event, listener);
                reject(new Error(`Timeout waiting for ${event}`));
            }, timeout);
            const listener = (data) => {
                if (checkCondition(data)) {
                    clearTimeout(timeoutId);
                    emitter.removeListener(event, listener);
                    resolve(data);
                }
            };
            emitter.on(event, listener);
        });
    });
}
class Task {
    constructor() {
        this.done = false;
        this.canceled = false;
        this.promise = new Promise((resolve, reject) => {
            this.cancel = (err) => {
                if (!this.done) {
                    this.done = true;
                    this.canceled = true;
                    reject(err);
                }
            };
            this.finish = (result) => {
                if (!this.done) {
                    this.done = true;
                    resolve(result);
                }
            };
        });
    }
    static doneTask() {
        const task = new Task();
        task.done = true;
        task.promise = Promise.resolve();
        task.cancel = () => { };
        task.finish = () => { };
        return task;
    }
}
exports.Task = Task;
function getViewDir(info) {
    return new vec3_1.Vec3(-Math.sin(info.yaw) * Math.cos(info.pitch), Math.sin(info.pitch), -Math.cos(info.yaw) * Math.cos(info.pitch));
}
//# sourceMappingURL=utils.js.map