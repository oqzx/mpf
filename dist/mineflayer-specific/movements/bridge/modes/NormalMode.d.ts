import { BridgeModeBase, ModeTickResult, TickContext } from './BridgeModeBase';
export declare class NormalMode extends BridgeModeBase {
    private readonly sideTracker;
    private readonly placementPredictor;
    private placedBlocks;
    private blocksToEagleThreshold;
    private sneakUntilMs;
    private currentPitch;
    private currentYawBias;
    onMoveStart(ctx: TickContext): void;
    onTick(ctx: TickContext): ModeTickResult;
    onBlockPlaced(ctx: TickContext): void;
    onMoveEnd(): void;
    private _shouldAllowPlace;
    private _computeEdgePos;
    private _exitPosYaw;
    private _nextEagleThreshold;
    private _nextPitch;
    private _nextYawBias;
}
