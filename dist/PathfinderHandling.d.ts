import { Bot } from 'mineflayer';
import { AStar as AAStar } from './abstract/algorithms/astar';
import { AStar, Path, PathProducer } from './mineflayer-specific/algs';
import * as goals from './mineflayer-specific/goals';
import { Vec3 } from 'vec3';
import { Move } from './mineflayer-specific/move';
import { CacheSyncWorld } from './mineflayer-specific/world/cacheWorld';
import { BuildableMoveExecutor, BuildableMoveProvider, MovementOptions, MovementSetup, ExecutorMap, MovementExecutor } from './mineflayer-specific/movements';
import { BuildableOptimizer, OptimizationSetup, MovementOptimizer, OptimizationMap } from './mineflayer-specific/post';
import { Block, ResetReason } from './types';
import { reconstructPath } from './abstract/algorithms';
import { World } from './mineflayer-specific/world/worldInterface';
export interface PathfinderOptions {
    partialPathProducer: boolean;
    partialPathLength: number;
}
type PathInfo = Path;
type PathGenerator = AsyncGenerator<PathGeneratorResult, PathGeneratorResult | null, unknown>;
interface PathGeneratorResult {
    result: PathInfo;
    astarContext: AAStar<Move>;
}
interface HandlerOpts {
    world?: CacheSyncWorld;
    movements?: MovementSetup;
    optimizers?: OptimizationSetup;
    moveSettings?: MovementOptions;
    pathfinderSettings?: PathfinderOptions;
}
export declare class PathfinderHandler {
    private readonly bot;
    astar: AStar | null;
    world: World;
    movements: ExecutorMap;
    optimizers: OptimizationMap;
    defaultMoveSettings: MovementOptions;
    pathfinderSettings: PathfinderOptions;
    private readonly currentIndex;
    private readonly executeTask;
    private readonly wantedGoal?;
    abortCalculation: boolean;
    private userAborted;
    private currentGotoGoal?;
    private curPath?;
    private currentMove?;
    private currentExecutor?;
    private resetReason?;
    private _currentProducer?;
    get currentAStar(): AStar | undefined;
    get currentProducer(): PathProducer | undefined;
    get isPathing(): boolean;
    reconstructPath: typeof reconstructPath;
    constructor(bot: Bot, opts?: HandlerOpts);
    setExecutor(provider: BuildableMoveProvider, Executor: BuildableMoveExecutor | MovementExecutor): void;
    setOptimizer(provider: BuildableMoveProvider, Optimizer: BuildableOptimizer | MovementOptimizer): void;
    setMoveOptions(settings: Partial<MovementOptions>): void;
    setOptions(settings: Partial<PathfinderOptions>): void;
    dropMovment(provider: BuildableMoveProvider): void;
    dropAllMovements(): void;
    cancel(): Promise<void>;
    interrupt(timeout?: number, cancelCalculation?: boolean, reasonStr?: ResetReason): Promise<void>;
    reset(reason: ResetReason, cancelTimeout?: number): Promise<void>;
    setupListeners(): void;
    updateMatchesWanted(block: Block | null, path?: Move[] | undefined): boolean;
    isPositionNearPath(pos: Vec3 | undefined, path?: Move[] | undefined): boolean;
    private registerAll;
    perform(): Promise<void>;
    getPathTo(goal: goals.Goal, settings?: MovementOptions): PathGenerator;
    getPathFromTo(startPos: Vec3, startVel: Vec3, goal: goals.Goal, settings?: MovementOptions): PathGenerator;
    getPathFromToRaw(startPos: Vec3, startVel: Vec3, goal: goals.Goal): Promise<PathInfo | null>;
    private postProcess;
    cleanupBot(): Promise<void>;
    cleanupClient(): void;
    cleanupAll(goal: goals.Goal, lastMove?: MovementExecutor): Promise<void>;
}
export {};
