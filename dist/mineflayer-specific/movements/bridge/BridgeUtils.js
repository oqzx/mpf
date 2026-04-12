"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacementPredictor = exports.GodBridgeSideTracker = exports.OptimalLineTracker = exports.RAD2DEG = exports.DEG2RAD = void 0;
exports.randFloat = randFloat;
exports.randInt = randInt;
exports.randRangeMs = randRangeMs;
exports.randChoice = randChoice;
exports.wrapRadians = wrapRadians;
exports.wrapDegrees = wrapDegrees;
exports.shortestYawDelta = shortestYawDelta;
exports.yawFromDir = yawFromDir;
exports.pitchFromDeg = pitchFromDeg;
exports.snapTo8Dirs = snapTo8Dirs;
exports.snapTo45Deg = snapTo45Deg;
exports.dirFromYaw = dirFromYaw;
exports.getMovementDegrees = getMovementDegrees;
exports.getHorizontalMoveDir = getHorizontalMoveDir;
exports.isCloseToEdge = isCloseToEdge;
exports.isFractionallyNearEdge = isFractionallyNearEdge;
const vec3_1 = require("vec3");
exports.DEG2RAD = Math.PI / 180;
exports.RAD2DEG = 180 / Math.PI;
function randFloat(min, max) {
    return min + Math.random() * (max - min);
}
function randInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
}
function randRangeMs(range) {
    return randFloat(range[0], range[1]);
}
function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
function wrapRadians(r) {
    const t = r % (2 * Math.PI);
    return t < 0 ? t + 2 * Math.PI : t;
}
function wrapDegrees(d) {
    const t = d % 360;
    return t < 0 ? t + 360 : t;
}
function shortestYawDelta(from, to) {
    return ((to - from) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
}
function yawFromDir(dx, dz) {
    return Math.atan2(-dx, -dz);
}
function pitchFromDeg(degrees) {
    return -(degrees * exports.DEG2RAD);
}
function snapTo8Dirs(yaw) {
    const wrapped = wrapRadians(yaw);
    const sector = Math.round(wrapped / (Math.PI / 4));
    return wrapRadians(sector * (Math.PI / 4));
}
function snapTo45Deg(deg) {
    return Math.round(deg / 45) * 45;
}
function dirFromYaw(yaw) {
    return {
        dx: -Math.sin(yaw),
        dz: -Math.cos(yaw)
    };
}
function getMovementDegrees(bot) {
    const fwd = bot.getControlState('forward');
    const back = bot.getControlState('back');
    const left = bot.getControlState('left');
    const right = bot.getControlState('right');
    if (!fwd && !back && !left && !right)
        return null;
    const botYawDeg = wrapDegrees(bot.entity.yaw * exports.RAD2DEG);
    let inputAngle = 0;
    if (fwd && !back)
        inputAngle = 0;
    else if (back && !fwd)
        inputAngle = 180;
    else if (left && !right)
        inputAngle = -90;
    else if (right && !left)
        inputAngle = 90;
    else if (fwd && left)
        inputAngle = -45;
    else if (fwd && right)
        inputAngle = 45;
    else if (back && left)
        inputAngle = -135;
    else if (back && right)
        inputAngle = 135;
    return wrapDegrees(botYawDeg + inputAngle);
}
function getHorizontalMoveDir(bot) {
    const vel = bot.entity.velocity;
    const xzSpeed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
    if (xzSpeed > 0.02) {
        return new vec3_1.Vec3(vel.x / xzSpeed, 0, vel.z / xzSpeed);
    }
    const { dx, dz } = dirFromYaw(bot.entity.yaw);
    return new vec3_1.Vec3(dx, 0, dz);
}
function isCloseToEdge(bot, world, dirX, dirZ, distance = 0.1) {
    const pos = bot.entity.position;
    const len = Math.sqrt(dirX * dirX + dirZ * dirZ);
    if (len < 0.001)
        return false;
    const ndx = dirX / len;
    const ndz = dirZ / len;
    const perpX = -ndz;
    const perpZ = ndx;
    for (const off of [-0.25, 0, 0.25]) {
        const cx = pos.x + ndx * distance + perpX * off;
        const cz = pos.z + ndz * distance + perpZ * off;
        const below = world.getBlockInfo(new vec3_1.Vec3(Math.floor(cx), Math.floor(pos.y) - 1, Math.floor(cz)));
        if (!below.physical && !below.liquid)
            return true;
    }
    return false;
}
function isFractionallyNearEdge(bot, dirX, dirZ, margin = 0.45) {
    const pos = bot.entity.position;
    const fx = pos.x - Math.floor(pos.x);
    const fz = pos.z - Math.floor(pos.z);
    const len = Math.sqrt(dirX * dirX + dirZ * dirZ);
    if (len < 0.001)
        return false;
    const ndx = dirX / len;
    const ndz = dirZ / len;
    if (Math.abs(ndx) > 0.5) {
        const edgeFrac = ndx > 0 ? 1 - margin : margin;
        return ndx > 0 ? fx > edgeFrac : fx < edgeFrac;
    }
    else {
        const edgeFrac = ndz > 0 ? 1 - margin : margin;
        return ndz > 0 ? fz > edgeFrac : fz < edgeFrac;
    }
}
class OptimalLineTracker {
    constructor() {
        this.MAX_HISTORY = 4;
        this.lastPlaced = [];
        this.lastStoodOn = null;
    }
    trackPlacement(blockPos) {
        const last = this.lastPlaced[this.lastPlaced.length - 1];
        if (last != null && last.equals(blockPos))
            return;
        this.lastPlaced.push(blockPos.clone());
        while (this.lastPlaced.length > this.MAX_HISTORY)
            this.lastPlaced.shift();
    }
    getOptimalLine(bot, world) {
        const moveDir = getHorizontalMoveDir(bot);
        const snapped = snapTo8Dirs(Math.atan2(moveDir.x, moveDir.z));
        const direction = new vec3_1.Vec3(-Math.sin(snapped), 0, -Math.cos(snapped));
        const baseBlock = this._findStoodOnBlock(bot, world);
        if (baseBlock == null)
            return null;
        const historyLine = this._fitLineFromHistory();
        const origin = (historyLine != null && historyLine.direction.dot(direction) > 0.5)
            ? historyLine.origin
            : baseBlock.offset(0.5, 0, 0.5);
        return { origin: new vec3_1.Vec3(origin.x, bot.entity.position.y, origin.z), direction };
    }
    getCorrectionDir(bot, line, threshold = 0.15) {
        const pos = bot.entity.position;
        const nearest = this._nearestPointOnLine(pos, line);
        const delta = new vec3_1.Vec3(nearest.x - pos.x, 0, nearest.z - pos.z);
        if (delta.norm() < threshold)
            return new vec3_1.Vec3(0, 0, 0);
        return delta.normalize();
    }
    reset() {
        this.lastPlaced = [];
        this.lastStoodOn = null;
    }
    _findStoodOnBlock(bot, world) {
        var _a;
        const pos = bot.entity.position;
        const candidates = [];
        for (const ox of [0, 0.301, -0.301]) {
            for (const oz of [0, 0.301, -0.301]) {
                const bp = new vec3_1.Vec3(Math.floor(pos.x + ox), Math.floor(pos.y) - 1, Math.floor(pos.z + oz));
                if (!world.getBlockInfo(bp).physical)
                    continue;
                const lastPlaced = this.lastPlaced[this.lastPlaced.length - 1];
                if (lastPlaced != null && bp.equals(lastPlaced))
                    return bp;
                candidates.push(bp);
            }
        }
        if (this.lastStoodOn != null && candidates.some(c => c.equals(this.lastStoodOn))) {
            return this.lastStoodOn;
        }
        const first = (_a = candidates[0]) !== null && _a !== void 0 ? _a : null;
        this.lastStoodOn = first;
        return first;
    }
    _fitLineFromHistory() {
        if (this.lastPlaced.length < 2)
            return null;
        const a = this.lastPlaced[this.lastPlaced.length - 2];
        const b = this.lastPlaced[this.lastPlaced.length - 1];
        const diff = new vec3_1.Vec3(b.x - a.x, 0, b.z - a.z);
        if (diff.norm() < 0.01)
            return null;
        return {
            origin: new vec3_1.Vec3((a.x + b.x) / 2 + 0.5, 0, (a.z + b.z) / 2 + 0.5),
            direction: diff.normalize()
        };
    }
    _nearestPointOnLine(pos, line) {
        const toPoint = new vec3_1.Vec3(pos.x - line.origin.x, 0, pos.z - line.origin.z);
        const t = toPoint.dot(line.direction);
        return new vec3_1.Vec3(line.origin.x + line.direction.x * t, pos.y, line.origin.z + line.direction.z * t);
    }
}
exports.OptimalLineTracker = OptimalLineTracker;
class GodBridgeSideTracker {
    constructor(jitterRangeDeg = 3.5) {
        this.isOnRightSide = false;
        this.currentJitter = 0;
        this.jitterRange = jitterRangeDeg * exports.DEG2RAD;
        this._rollJitter();
    }
    update(bot, world, movingYaw) {
        var _a, _b;
        if (!bot.entity.onGround)
            return;
        const pos = bot.entity.position;
        const movDx = -Math.sin(movingYaw);
        const movDz = -Math.cos(movingYaw);
        const crossX = Math.floor(pos.x + movDx * 0.5) !== Math.floor(pos.x);
        const crossZ = Math.floor(pos.z + movDz * 0.5) !== Math.floor(pos.z);
        let newSide = crossX || crossZ;
        const belowAir = ((_a = world.getBlockInfo(new vec3_1.Vec3(Math.floor(pos.x), Math.floor(pos.y) - 1, Math.floor(pos.z)))) === null || _a === void 0 ? void 0 : _a.physical) === false;
        const aheadPos = new vec3_1.Vec3(Math.floor(pos.x + movDx), Math.floor(pos.y) - 1, Math.floor(pos.z + movDz));
        const aheadAir = ((_b = world.getBlockInfo(aheadPos)) === null || _b === void 0 ? void 0 : _b.physical) === false;
        if (belowAir && aheadAir)
            newSide = !newSide;
        if (newSide !== this.isOnRightSide) {
            this.isOnRightSide = newSide;
            this._rollJitter();
        }
    }
    getYawOffset() {
        return (this.isOnRightSide ? Math.PI / 4 : -Math.PI / 4) + this.currentJitter;
    }
    reset() {
        this.isOnRightSide = false;
        this._rollJitter();
    }
    _rollJitter() {
        this.currentJitter = randFloat(-this.jitterRange, this.jitterRange);
    }
}
exports.GodBridgeSideTracker = GodBridgeSideTracker;
class PlacementPredictor {
    constructor() {
        this.MAX = 6;
        this.offsets = [];
    }
    record(playerPos, edgePos) {
        const off = new vec3_1.Vec3(playerPos.x - edgePos.x, 0, playerPos.z - edgePos.z);
        this.offsets.push(off);
        while (this.offsets.length > this.MAX)
            this.offsets.shift();
    }
    average() {
        if (this.offsets.length < 2)
            return null;
        const sum = this.offsets.reduce((acc, v) => new vec3_1.Vec3(acc.x + v.x, 0, acc.z + v.z), new vec3_1.Vec3(0, 0, 0));
        return new vec3_1.Vec3(sum.x / this.offsets.length, 0, sum.z / this.offsets.length);
    }
    reset() {
        this.offsets = [];
    }
}
exports.PlacementPredictor = PlacementPredictor;
//# sourceMappingURL=BridgeUtils.js.map