"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetError = exports.AbortError = exports.CancelError = void 0;
class CancelError extends Error {
    constructor(...args) {
        super('Movement canceled: ' + args.join(' '));
    }
}
exports.CancelError = CancelError;
class AbortError extends Error {
    constructor(...args) {
        super('Movement aborted: ' + args.join(' '));
    }
}
exports.AbortError = AbortError;
class ResetError extends Error {
    constructor(reason, ...args) {
        super('Movement timed out: ' + args.join(' '));
        this.reason = reason;
    }
}
exports.ResetError = ResetError;
//# sourceMappingURL=exceptions.js.map