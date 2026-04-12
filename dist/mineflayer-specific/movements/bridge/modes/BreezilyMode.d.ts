import { BridgeModeBase, ModeTickResult, TickContext } from './BridgeModeBase';
export declare class BreezilyMode extends BridgeModeBase {
    private lastSideways;
    private lastAirTimeMs;
    private currentEdgeDist;
    private pitchStraight;
    private pitchDiag;
    private pitchNoInput;
    private currentYawBias;
    onMoveStart(ctx: TickContext): void;
    onTick(ctx: TickContext): ModeTickResult;
    onBlockPlaced(ctx: TickContext): void;
    onMoveEnd(): void;
    private _nextEdgeDist;
    private _nextYawBias;
    private _refreshPitch;
    private _rotationNoInput;
}
