import { Bot } from 'mineflayer';
import { Vec3 } from 'vec3';
import { World } from '../../world/worldInterface';
export declare const DEG2RAD: number;
export declare const RAD2DEG: number;
export declare function randFloat(min: number, max: number): number;
export declare function randInt(min: number, max: number): number;
export declare function randRangeMs(range: [number, number]): number;
export declare function randChoice<T>(arr: T[]): T;
export declare function wrapRadians(r: number): number;
export declare function wrapDegrees(d: number): number;
export declare function shortestYawDelta(from: number, to: number): number;
export declare function yawFromDir(dx: number, dz: number): number;
export declare function pitchFromDeg(degrees: number): number;
export declare function snapTo8Dirs(yaw: number): number;
export declare function snapTo45Deg(deg: number): number;
export declare function dirFromYaw(yaw: number): {
    dx: number;
    dz: number;
};
export declare function getMovementDegrees(bot: Bot): number | null;
export declare function getHorizontalMoveDir(bot: Bot): Vec3;
export declare function isCloseToEdge(bot: Bot, world: World, dirX: number, dirZ: number, distance?: number): boolean;
export declare function isFractionallyNearEdge(bot: Bot, dirX: number, dirZ: number, margin?: number): boolean;
interface Line3D {
    origin: Vec3;
    direction: Vec3;
}
export declare class OptimalLineTracker {
    private readonly MAX_HISTORY;
    private lastPlaced;
    private lastStoodOn;
    trackPlacement(blockPos: Vec3): void;
    getOptimalLine(bot: Bot, world: World): Line3D | null;
    getCorrectionDir(bot: Bot, line: Line3D, threshold?: number): Vec3;
    reset(): void;
    private _findStoodOnBlock;
    private _fitLineFromHistory;
    private _nearestPointOnLine;
}
export declare class GodBridgeSideTracker {
    private isOnRightSide;
    private currentJitter;
    private readonly jitterRange;
    constructor(jitterRangeDeg?: number);
    update(bot: Bot, world: World, movingYaw: number): void;
    getYawOffset(): number;
    reset(): void;
    private _rollJitter;
}
export declare class PlacementPredictor {
    private readonly MAX;
    private offsets;
    record(playerPos: Vec3, edgePos: Vec3): void;
    average(): Vec3 | null;
    reset(): void;
}
export {};
