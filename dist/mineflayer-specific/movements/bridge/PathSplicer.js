"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathSplicer = void 0;
const vec3_1 = require("vec3");
class PathSplicer {
    static computeSpliceEnd(bot, world, startIndex, path, maxLook = 8) {
        if (startIndex >= path.length)
            return startIndex;
        const anchor = path[startIndex];
        const orgY = anchor.exitPos.y;
        const ctor = anchor.moveType.constructor;
        const refDir = PathSplicer._xzDir(anchor.entryPos, anchor.exitPos);
        let best = startIndex;
        for (let i = startIndex + 1; i <= Math.min(startIndex + maxLook, path.length - 1); i++) {
            const next = path[i];
            if (Math.abs(next.exitPos.y - orgY) > 0.01)
                break;
            if (Math.abs(next.entryPos.y - orgY) > 0.01)
                break;
            if (next.moveType.constructor !== ctor)
                break;
            const nextDir = PathSplicer._xzDir(next.entryPos, next.exitPos);
            if (nextDir.norm() > 0.001 && refDir.norm() > 0.001) {
                if (nextDir.normalize().dot(refDir.normalize()) < 0.85)
                    break;
            }
            if (next.toBreak.length > 0)
                break;
            if (!PathSplicer._hasSupportAt(world, path, startIndex, i))
                break;
            best = i;
        }
        return best;
    }
    static _xzDir(from, to) {
        return new vec3_1.Vec3(to.x - from.x, 0, to.z - from.z);
    }
    static _hasSupportAt(world, path, startIndex, idx) {
        const exitPos = path[idx].exitPos;
        const supportPos = new vec3_1.Vec3(Math.floor(exitPos.x), Math.floor(exitPos.y) - 1, Math.floor(exitPos.z));
        if (world.getBlockInfo(supportPos).physical)
            return true;
        for (let j = startIndex; j <= idx; j++) {
            for (const place of path[j].toPlace) {
                if (Math.floor(place.x) === supportPos.x &&
                    Math.floor(place.y) === supportPos.y &&
                    Math.floor(place.z) === supportPos.z) {
                    return true;
                }
            }
        }
        return false;
    }
}
exports.PathSplicer = PathSplicer;
//# sourceMappingURL=PathSplicer.js.map