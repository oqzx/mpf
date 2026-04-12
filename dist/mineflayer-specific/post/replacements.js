"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleJumpSprintReplacement = exports.ReplacementHandler = void 0;
const movements_1 = require("../movements");
class ReplacementHandler {
    constructor(orgMove, replacement) {
        this.orgMove = orgMove;
        this.replacement = replacement;
    }
    static createFromSingle(move, replacement) {
        return new ReplacementHandler(move, replacement);
    }
    sanitize() {
        return true;
    }
    getNeighbors(org) {
        throw new Error('Method not implemented.');
    }
}
exports.ReplacementHandler = ReplacementHandler;
class SimpleJumpSprintReplacement extends movements_1.Movement {
    canReplace(move) {
        const sameY = move.entryPos.y === move.exitPos.y;
        const distance = move.entryPos.distanceTo(move.exitPos);
        return sameY && distance > 6;
    }
    initialize(move) {
        this.startPosition = move.entryPos;
        this.endPosition = move.exitPos;
    }
    compute() {
        throw new Error('Method not implemented.');
    }
    makeResult(status, node) {
        return {
            calcTime: 0,
            context: this,
            cost: 0,
            generatedNodes: 0,
            path: [],
            status: 'noPath',
            visitedNodes: 0,
            movementProvider: this.movementProvider
        };
    }
}
exports.SimpleJumpSprintReplacement = SimpleJumpSprintReplacement;
//# sourceMappingURL=replacements.js.map