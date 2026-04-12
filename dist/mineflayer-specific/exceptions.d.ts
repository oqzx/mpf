import { ResetReason } from '../types';
export declare class CancelError extends Error {
    constructor(...args: any[]);
}
export declare class AbortError extends Error {
    constructor(...args: any[]);
}
export declare class ResetError extends Error {
    readonly reason: ResetReason;
    constructor(reason: ResetReason, ...args: any[]);
}
