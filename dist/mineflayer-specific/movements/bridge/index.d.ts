export { BridgeExecutor } from './BridgeExecutor';
export { PathSplicer } from './PathSplicer';
export { BridgeConfig, BridgeMode, RotationConfig, NormalModeOptions, GodBridgeModeOptions, BreezilyModeOptions, DEFAULT_BRIDGE_CONFIG } from './BridgeConfig';
export { OptimalLineTracker, GodBridgeSideTracker, PlacementPredictor, isCloseToEdge, isFractionallyNearEdge, getMovementDegrees, getHorizontalMoveDir, shortestYawDelta, randFloat, randRangeMs, randChoice } from './BridgeUtils';
import { BridgeConfig } from './BridgeConfig';
import { MovementSetup } from '../';
export declare function makeBridgeSetup(cfg?: Partial<BridgeConfig>): MovementSetup;
