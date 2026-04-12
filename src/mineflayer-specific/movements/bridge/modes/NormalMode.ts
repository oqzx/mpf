import { Vec3 } from 'vec3'
import {
  isCloseToEdge,
  pitchFromDeg,
  randFloat,
  randRangeMs,
  dirFromYaw,
  snapTo8Dirs,
  GodBridgeSideTracker,
  PlacementPredictor,
  DEG2RAD
} from '../BridgeUtils'
import { BridgeModeBase, ModeTickResult, TickContext, DEFAULT_TICK_RESULT } from './BridgeModeBase'

export class NormalMode extends BridgeModeBase {
  private readonly sideTracker = new GodBridgeSideTracker()
  private readonly placementPredictor = new PlacementPredictor()

  private placedBlocks = 0
  private blocksToEagleThreshold = 0
  private sneakUntilMs = 0
  private currentPitch = 0
  private currentYawBias = 0

  onMoveStart (ctx: TickContext): void {
    this.sideTracker.reset()
    this.placementPredictor.reset()
    this.placedBlocks = 0
    this.blocksToEagleThreshold = this._nextEagleThreshold()
    this.sneakUntilMs = 0
    this.currentPitch = this._nextPitch()
    this.currentYawBias = this._nextYawBias()
  }

  onTick (ctx: TickContext): ModeTickResult {
    const result: ModeTickResult = { ...DEFAULT_TICK_RESULT }
    const cfg = this.config.normal
    const bot = this.bot
    const now = ctx.nowMs

    // movingYaw = toward exit (actual direction of travel)
    // facingYaw = away from exit (bot faces backward while bridging)
    const movingYaw = this._exitPosYaw(ctx)
    const facingYaw = movingYaw + Math.PI

    const { dx: backX, dz: backZ } = dirFromYaw(movingYaw)
    const rightX = backZ
    const rightZ = -backX

    const onGround = bot.entity.onGround
    const shouldCheckEdge = onGround || !cfg.onlyOnGround

    if (shouldCheckEdge && this.placedBlocks === 0) {
      if (isCloseToEdge(bot, this.world, backX, backZ, cfg.edgeDistance)) {
        result.wantSneak = true
      }
    }

    if (now < this.sneakUntilMs) {
      result.wantSneak = true
    }

    // No sideTracker correction in NormalMode — the GodBridgeSideTracker strafing
    // causes circular drift on straight/diagonal bridges. Just move directly toward exit.
    let movX = backX
    let movZ = backZ

    const line = ctx.lineTracker.getOptimalLine(bot, this.world)
    if (line != null) {
      const corr = ctx.lineTracker.getCorrectionDir(bot, line)
      if (corr.norm() > 0.001) {
        // Keep enough lateral correction so movement resolves to true S+A/D input
        // instead of pure backwards.
        movX += corr.x * 0.5
        movZ += corr.z * 0.5
      }
    }

    const movLen = Math.sqrt(movX * movX + movZ * movZ)
    result.movementOverride = new Vec3(movX / movLen, 0, movZ / movLen)

    result.targetYaw = facingYaw
    result.targetPitch = this.currentPitch

    result.allowPlace = this._shouldAllowPlace(ctx, backX, backZ)

    return result
  }

  onBlockPlaced (ctx: TickContext): void {
    const bot = this.bot
    const movingYaw = this._exitPosYaw(ctx)
    const facingYaw = movingYaw + Math.PI
    const { dx: backX, dz: backZ } = dirFromYaw(movingYaw)
    const edgePos = this._computeEdgePos(bot.entity.position, backX, backZ)
    this.placementPredictor.record(bot.entity.position, edgePos)

    this.placedBlocks++
    this.currentPitch = this._nextPitch()
    this.currentYawBias = this._nextYawBias()

    const reachedEagleWindow = this.blocksToEagleThreshold > 0 && this.placedBlocks >= this.blocksToEagleThreshold
    if (reachedEagleWindow) {
      this.placedBlocks = 0
      this.blocksToEagleThreshold = this._nextEagleThreshold()
      const sneakDuration = randRangeMs(this.config.globalSneakMs)
      this.sneakUntilMs = Math.max(this.sneakUntilMs, ctx.nowMs + sneakDuration)
    }
  }

  onMoveEnd (): void {
    this.sideTracker.reset()
    this.placementPredictor.reset()
    this.placedBlocks = 0
    this.sneakUntilMs = 0
    this.currentYawBias = 0
  }

  private _shouldAllowPlace (ctx: TickContext, backX: number, backZ: number): boolean {
    const avg = this.placementPredictor.average()
    if (avg === null) return true

    const bot = this.bot
    const edgePos = this._computeEdgePos(bot.entity.position, backX, backZ)
    const currentOffset = bot.entity.position.minus(edgePos)
    const dx = currentOffset.x - avg.x
    const dz = currentOffset.z - avg.z
    const dist = Math.sqrt(dx * dx + dz * dz)

    return dist <= this.config.normal.placementPredictorThreshold
  }

  private _computeEdgePos (pos: Vec3, backX: number, backZ: number): Vec3 {
    return new Vec3(
      Math.floor(pos.x) + 0.5 - backX * 0.5,
      pos.y,
      Math.floor(pos.z) + 0.5 - backZ * 0.5
    )
  }

  private _exitPosYaw (ctx: TickContext): number {
    const pos = this.bot.entity.position
    const toExitX = ctx.move.exitPos.x - pos.x
    const toExitZ = ctx.move.exitPos.z - pos.z
    const dist = Math.sqrt(toExitX * toExitX + toExitZ * toExitZ)

    const segX = ctx.move.exitPos.x - ctx.move.entryPos.x
    const segZ = ctx.move.exitPos.z - ctx.move.entryPos.z

    const baseYaw = dist > 0.08
      ? Math.atan2(-toExitX, -toExitZ)
      : Math.atan2(-segX, -segZ)

    return snapTo8Dirs(baseYaw) + this.currentYawBias
  }

  private _nextEagleThreshold (): number {
    const [min, max] = this.config.normal.blocksToEagle
    return min + Math.floor(Math.random() * (max - min + 1))
  }

  private _nextPitch (): number {
    const baseDeg = this.config.normal.pitch
    const jitter = this.config.normal.pitchJitter
    return pitchFromDeg(baseDeg + randFloat(-jitter, jitter))
  }

  private _nextYawBias (): number {
    const jitter = this.config.normal.yawJitter
    return randFloat(-jitter, jitter) * DEG2RAD
  }
}
