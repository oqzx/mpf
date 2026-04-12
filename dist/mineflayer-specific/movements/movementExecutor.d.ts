import { Bot } from 'mineflayer';
import { Vec3 } from 'vec3';
import { Move } from '../move';
import * as goals from '../goals';
import { World } from '../world/worldInterface';
import { BreakHandler, InteractHandler, InteractOpts, PlaceHandler } from './interactionUtils';
import { AbortError, ResetError } from '../exceptions';
import { Movement, MovementOptions } from './movement';
import { BaseSimulator, Controller, EPhysicsCtx, EntityPhysics, PlayerState, SimulationGoal } from '@nxg-org/mineflayer-physics-util';
interface AbortOpts {
    reason?: ResetError | AbortError;
    timeout?: number;
}
export interface CompleteOpts {
    ticks?: number;
    entry?: boolean;
}
export declare abstract class MovementExecutor extends Movement {
    protected sim: BaseSimulator<PlayerState>;
    protected simCtx: EPhysicsCtx<PlayerState>;
    protected engine: EntityPhysics;
    get cI(): InteractHandler | undefined;
    aborted: boolean;
    resetReason?: AbortOpts['reason'];
    private task;
    constructor(bot: Bot, world: World, settings?: Partial<MovementOptions>);
    reset(): void;
    abort(move?: Move, settings?: AbortOpts): Promise<void>;
    private holdUntilAborted;
    perform(thisMove: Move, currentIndex: number, path: Move[]): Promise<void>;
    _performInit(thisMove: Move, currentIndex: number, path: Move[]): Promise<void>;
    _performPerTick(thisMove: Move, tickCount: number, currentIndex: number, path: Move[]): Promise<boolean | number>;
    _align(thisMove: Move, tickCount: number, goal: goals.Goal): Promise<boolean>;
    abstract performInit(thisMove: Move, currentIndex: number, path: Move[]): void | Promise<void>;
    abstract performPerTick(thisMove: Move, tickCount: number, currentIndex: number, path: Move[]): boolean | number | Promise<boolean | number>;
    align(thisMove: Move, tickCount?: number, goal?: goals.Goal, lookTarget?: Vec3): boolean | Promise<boolean>;
    isAlreadyCompleted(thisMove: Move, tickCount: number, goal: goals.Goal): boolean;
    protected isComplete(startMove: Move, endMove?: Move, opts?: CompleteOpts): boolean;
    isInitAligned(thisMove: Move, target?: Vec3): boolean;
    safeToCancel(startMove: Move, endMove?: Move): boolean;
    interactNeeded(ticks?: number): Promise<PlaceHandler | BreakHandler | undefined>;
    performInteraction(interaction: PlaceHandler | BreakHandler, opts?: InteractOpts): Promise<void>;
    protected performPlace(place: PlaceHandler, opts?: InteractOpts): Promise<void>;
    protected performBreak(breakTarget: BreakHandler, opts?: InteractOpts): Promise<void>;
    lookAtPathPos(vec3: Vec3, force?: boolean): Promise<void>;
    lookAt(vec3: Vec3, force?: boolean): Promise<void>;
    isLookingAt(vec3: Vec3, limit?: number): boolean;
    isLookingAtYaw(vec3: Vec3, limit?: number): boolean;
    protected resetState(): PlayerState;
    protected simUntil(...args: Parameters<BaseSimulator<PlayerState>['simulateUntil']>): ReturnType<BaseSimulator<PlayerState>['simulateUntil']>;
    protected simUntilGrounded(controller: Controller, maxTicks?: number): PlayerState;
    protected simJump({ goal, controller }?: {
        goal?: SimulationGoal;
        controller?: Controller;
    }, maxTicks?: number): PlayerState;
    protected postInitAlignToPath(startMove: Move, opts?: {
        handleBack?: boolean;
        lookAt?: Vec3;
        lookAtYaw?: Vec3;
        sprint?: boolean;
    }): Promise<void>;
    protected postInitAlignToPath(startMove: Move, endMove?: Move, opts?: {
        handleBack?: boolean;
        lookAt?: Vec3;
        lookAtYaw?: Vec3;
        sprint?: boolean;
    }): Promise<void>;
}
export {};
