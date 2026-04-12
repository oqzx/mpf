export { BridgeExecutor } from './BridgeExecutor'
export { PathSplicer } from './PathSplicer'
export type {
  BridgeConfig,
  BridgeMode,
  RotationConfig,
  NormalModeOptions,
  GodBridgeModeOptions,
  BreezilyModeOptions,
} from './BridgeConfig'
export { DEFAULT_BRIDGE_CONFIG } from './BridgeConfig'
export {
  OptimalLineTracker,
  GodBridgeSideTracker,
  PlacementPredictor,
  isCloseToEdge,
  isFractionallyNearEdge,
  getMovementDegrees,
  getHorizontalMoveDir,
  shortestYawDelta,
  randFloat, randRangeMs, randChoice
} from './BridgeUtils'

import { BridgeConfig } from './BridgeConfig'
import { BridgeExecutor } from './BridgeExecutor'
import { Forward, Diagonal } from '../movementProviders'
import { BuildableMoveExecutor, MovementSetup } from '../'

export function makeBridgeSetup (cfg: Partial<BridgeConfig> = {}): MovementSetup {
  const ExecutorClass: BuildableMoveExecutor = BridgeExecutor.withConfig(cfg)
  return new Map<typeof Forward | typeof Diagonal, BuildableMoveExecutor>([
    [Forward, ExecutorClass],
    [Diagonal, ExecutorClass]
  ])
}
