export type BridgeMode = 'normal' | 'godbridge' | 'breezily';
export interface RotationConfig {
    lerpYaw: [number, number];
    lerpPitch: [number, number];
    maxTurnRadPerTick: number;
}
export interface NormalModeOptions {
    edgeDistance: number;
    blocksToEagle: [number, number];
    onlyOnGround: boolean;
    sprint: 'always' | 'never' | 'auto';
    pitch: number;
    pitchJitter: number;
    yawJitter: number;
    placementPredictorThreshold: number;
}
export interface GodBridgeModeOptions {
    ledgeModes: Array<'jump' | 'sneak' | 'stopInput' | 'backwards'>;
    sneakMs: [number, number];
    forceSneakBelowCount: number;
    pitchStraight: number;
    pitchDiagonal: number;
    pitchJitter: number;
    yawJitter: number;
}
export interface BreezilyModeOptions {
    edgeDistance: [number, number];
    pitchStraight: number;
    pitchDiagonal: number;
    pitchJitter: number;
    yawJitter: number;
}
export interface BridgeConfig {
    mode: BridgeMode;
    elevatedBridgeThreshold: number;
    globalSneakMs: [number, number];
    equipDelayMs: [number, number];
    placementDelayMs: [number, number];
    stallTimeoutMs: number;
    rotation: RotationConfig;
    normal: NormalModeOptions;
    godbridge: GodBridgeModeOptions;
    breezily: BreezilyModeOptions;
}
export declare const DEFAULT_BRIDGE_CONFIG: BridgeConfig;
