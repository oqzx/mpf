import { BridgeModeBase, ModeTickResult, TickContext } from './BridgeModeBase';
export declare class GodBridgeMode extends BridgeModeBase {
    private readonly sideTracker;
    private ledge;
    private pitchStraight;
    private pitchDiag;
    private yawJitter;
    onMoveStart(ctx: TickContext): void;
    onTick(ctx: TickContext): ModeTickResult;
    onBlockPlaced(ctx: TickContext): void;
    onMoveEnd(): void;
    private _triggerLedge;
    private _rotationNoInput;
    private _refreshPitch;
    private _refreshYawJitter;
}
