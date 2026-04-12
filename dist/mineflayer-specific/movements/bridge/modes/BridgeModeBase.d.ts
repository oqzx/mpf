import { Bot } from 'mineflayer';
import { Vec3 } from 'vec3';
import { Move } from '../../../move';
import { World } from '../../../world/worldInterface';
import { OptimalLineTracker } from '../BridgeUtils';
import { BridgeConfig } from '../BridgeConfig';
export interface TickContext {
    move: Move;
    nowMs: number;
    path: Move[];
    pathIndex: number;
    lineTracker: OptimalLineTracker;
    placedThisMove: number;
    totalBlockCount: number;
}
export interface ModeTickResult {
    wantSneak: boolean;
    wantJump: boolean;
    movementOverride: Vec3 | null;
    targetYaw: number | null;
    targetPitch: number | null;
    allowPlace: boolean;
}
export declare const DEFAULT_TICK_RESULT: ModeTickResult;
export declare abstract class BridgeModeBase {
    protected readonly bot: Bot;
    protected readonly world: World;
    protected readonly config: BridgeConfig;
    constructor(bot: Bot, world: World, config: BridgeConfig);
    abstract onMoveStart(ctx: TickContext): void;
    abstract onTick(ctx: TickContext): ModeTickResult;
    abstract onBlockPlaced(ctx: TickContext): void;
    abstract onMoveEnd(): void;
}
