import { Vec3 } from 'vec3';
import * as goals from '../goals';
import { Move } from '../move';
import { BlockInfo } from '../world/cacheWorld';
import { CompleteOpts, MovementExecutor } from './movementExecutor';
import { JumpCalculator } from './movementUtils';
export declare class IdleMovementExecutor extends MovementExecutor {
    provideMovements(start: Move, storage: Move[]): void;
    performInit(thisMove: Move, currentIndex: number, path: Move[]): Promise<void>;
    performPerTick(thisMove: Move, tickCount: number, currentIndex: number, path: Move[]): Promise<boolean>;
}
export declare class NewForwardExecutor extends MovementExecutor {
    private faceForward;
    align(thisMove: Move, tickCount: number, goal: goals.Goal): Promise<boolean>;
    landAlign(thisMove: Move, tickCount: number, goal: goals.Goal): Promise<boolean>;
    performInit(thisMove: Move, currentIndex: number, path: Move[]): Promise<void>;
    private doWaterLogic;
    private canJump;
    performPerTick(thisMove: Move, tickCount: number, currentIndex: number, path: Move[]): Promise<boolean | number>;
}
export declare class ForwardExecutor extends MovementExecutor {
    private currentIndex;
    private faceForward;
    align(thisMove: Move, tickCount: number, goal: goals.Goal): Promise<boolean>;
    performInit(thisMove: Move, currentIndex: number, path: Move[]): Promise<void>;
    private identMove;
    private canJump;
    performPerTick(thisMove: Move, tickCount: number, currentIndex: number, path: Move[]): Promise<boolean | number>;
}
export declare class ForwardJumpExecutor extends MovementExecutor {
    jumpInfo: ReturnType<JumpCalculator['findJumpPoint']>;
    private readonly shitter;
    private flag;
    protected isComplete(startMove: Move, endMove?: Move): boolean;
    align(thisMove: Move, tickCount: number, goal: goals.Goal): Promise<boolean>;
    align1(thisMove: Move, tickCount: number, goal: goals.Goal): boolean;
    private performTwoPlace;
    performInit(thisMove: Move, currentIndex: number, path: Move[]): Promise<void>;
    performPerTick(thisMove: Move, tickCount: number, currentIndex: number, path: Move[]): Promise<boolean>;
}
export declare class NewForwardJumpExecutor extends ForwardJumpExecutor {
    performPerTick(thisMove: Move, tickCount: number, currentIndex: number, path: Move[]): Promise<boolean>;
}
export declare class ForwardDropDownExecutor extends MovementExecutor {
    private currentIndex;
    align(thisMove: Move, tickCount: number, goal: goals.Goal): Promise<boolean>;
    performInit(thisMove: Move, currentIndex: number, path: Move[]): Promise<void>;
    private identMove;
    performPerTick(thisMove: Move, tickCount: number, currentIndex: number, path: Move[]): Promise<boolean | number>;
    getLandingBlock(node: Move, dir: Vec3): BlockInfo | null;
}
export declare class NewForwardDropDownExecutor extends ForwardDropDownExecutor {
    performPerTick(thisMove: Move, tickCount: number, currentIndex: number, path: Move[]): Promise<boolean | number>;
}
export declare class StraightDownExecutor extends MovementExecutor {
    align(thisMove: Move): boolean;
    performInit(thisMove: Move, currentIndex: number, path: Move[]): Promise<void>;
    performPerTick(thisMove: Move, tickCount: number, currentIndex: number, path: Move[]): boolean | Promise<boolean>;
}
export declare class StraightUpExecutor extends MovementExecutor {
    isAlreadyCompleted(thisMove: Move, tickCount: number, goal: goals.Goal): boolean;
    align(thisMove: Move): Promise<boolean>;
    align1(thisMove: Move): Promise<boolean>;
    performInit(thisMove: Move, currentIndex: number, path: Move[]): Promise<void>;
    performPerTick(thisMove: Move, tickCount: number, currentIndex: number, path: Move[]): boolean | Promise<boolean>;
}
export declare class ParkourForwardExecutor extends MovementExecutor {
    private readonly shitterTwo;
    private backUpTarget?;
    private reachedBackup;
    private executing;
    private stepAmt;
    protected isComplete(startMove: Move, endMove?: Move, opts?: CompleteOpts): boolean;
    private cheatCode;
    align(thisMove: Move, tickCount: number, goal: goals.Goal): Promise<boolean>;
    performInit(thisMove: Move, currentIndex: number, path: Move[]): Promise<void>;
    performPerTick(thisMove: Move, tickCount: number, currentIndex: number, path: Move[]): boolean | Promise<boolean>;
}
