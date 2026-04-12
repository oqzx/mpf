import { Vec3 } from 'vec3'
import {
  pitchFromDeg,
  randFloat,
  dirFromYaw,
  shortestYawDelta,
  wrapRadians,
  PlacementPredictor,
  DEG2RAD,
  RAD2DEG
} from '../BridgeUtils'
import { BridgeModeBase, ModeTickResult, TickContext, DEFAULT_TICK_RESULT } from './BridgeModeBase'

const NINJA_ALIGN_THRESH_DEG = 5
const NINJA_PITCH_THRESH_DEG = 1.5

type BridgePhase = 'approach' | 'bridge'

export class NormalMode extends BridgeModeBase {
  private readonly placementPredictor = new PlacementPredictor()
  private phase: BridgePhase = 'approach'
  private currentPitch = 0
  private currentYawBias = 0
  private shouldBridge = false
  private _safeWalkUntilMs = 0

  onMoveStart (ctx: TickContext): void {
    this.phase = 'approach'
    this.placementPredictor.reset()
    this.currentPitch = this._nextPitch()
    this.currentYawBias = this._nextYawBias()
    this.shouldBridge = false
    this._safeWalkUntilMs = 0
  }

  onTick (ctx: TickContext): ModeTickResult {
    const bot = this.bot
    const dx = ctx.move.exitPos.x - ctx.move.entryPos.x
    const dz = ctx.move.exitPos.z - ctx.move.entryPos.z
    const rawMovingYaw = Math.atan2(-dx, -dz)
    const movingYaw = rawMovingYaw + this.currentYawBias
    const facingYaw = movingYaw + Math.PI
    const { dx: backX, dz: backZ } = dirFromYaw(movingYaw)
    const onGround = bot.entity.onGround

    if (this.phase === 'approach') {
      const result: ModeTickResult = { ...DEFAULT_TICK_RESULT }
      result.targetYaw = rawMovingYaw
      result.targetPitch = this.currentPitch
      result.allowPlace = false

      if (onGround && this._atPlatformEdge(backX, backZ)) {
        this.phase = 'bridge'
        this.shouldBridge = true
        result.wantSneak = true
        result.movementOverride = new Vec3(0, 0, 0)
        console.log(
          `[ninja dbg] APPROACH->BRIDGE edge detected ` +
          `pos=(${bot.entity.position.x.toFixed(2)},${bot.entity.position.y.toFixed(2)},${bot.entity.position.z.toFixed(2)}) ` +
          `yaw=${(bot.entity.yaw * RAD2DEG).toFixed(1)}`
        )
      } else {
        result.movementOverride = null
      }
      return result
    }

    const ninjaYaw = this._snapToNinjaDiagonal(facingYaw)
    const ninjaVec = this._ninjaStrafVec(ninjaYaw)

    const yawErr = Math.abs(shortestYawDelta(bot.entity.yaw, ninjaYaw))
    const pitchErr = Math.abs((bot.entity.pitch - this.currentPitch) * RAD2DEG)
    if (yawErr > NINJA_ALIGN_THRESH_DEG * DEG2RAD || pitchErr > NINJA_PITCH_THRESH_DEG) {
      const result: ModeTickResult = { ...DEFAULT_TICK_RESULT }
      result.wantSneak = true
      result.targetYaw = ninjaYaw
      result.targetPitch = this.currentPitch
      result.movementOverride = new Vec3(0, 0, 0)
      result.allowPlace = false
      return result
    }

    const overAir = this._atPlatformEdge(backX, backZ)

    console.log(
      `[ninja dbg] phase=bridge safeWalk=${ctx.nowMs < this._safeWalkUntilMs} overAir=${overAir} onGround=${onGround} ` +
      `yaw=${(bot.entity.yaw * RAD2DEG).toFixed(1)} pitch=${(bot.entity.pitch * RAD2DEG).toFixed(1)} ` +
      `pos=(${bot.entity.position.x.toFixed(2)},${bot.entity.position.y.toFixed(2)},${bot.entity.position.z.toFixed(2)}) ` +
      `vel=(${bot.entity.velocity.x.toFixed(3)},${bot.entity.velocity.y.toFixed(3)},${bot.entity.velocity.z.toFixed(3)}) ` +
      `placed=${ctx.placedThisMove}`
    )

    const result: ModeTickResult = { ...DEFAULT_TICK_RESULT }
    const inSafeWalk = ctx.nowMs < this._safeWalkUntilMs

    result.wantSneak = inSafeWalk
    result.targetYaw = ninjaYaw
    result.targetPitch = this.currentPitch
    result.allowPlace = this.shouldBridge && this._shouldAllowPlace(ctx, backX, backZ)

    if (!inSafeWalk) {
      let movX = ninjaVec.x
      let movZ = ninjaVec.z
      const line = ctx.lineTracker.getOptimalLine(bot, this.world)
      if (line != null) {
        const corr = ctx.lineTracker.getCorrectionDir(bot, line)
        if (corr.norm() > 0.001) {
          movX += corr.x * 0.3
          movZ += corr.z * 0.3
        }
      }
      const movLen = Math.sqrt(movX * movX + movZ * movZ)
      result.movementOverride = new Vec3(movX / movLen, 0, movZ / movLen)
    } else {
      result.movementOverride = new Vec3(0, 0, 0)
    }

    return result
  }

  onBlockPlaced (ctx: TickContext): void {
    const bot = this.bot
    const dx = ctx.move.exitPos.x - ctx.move.entryPos.x
    const dz = ctx.move.exitPos.z - ctx.move.entryPos.z
    const movingYaw = Math.atan2(-dx, -dz) + this.currentYawBias
    const { dx: backX, dz: backZ } = dirFromYaw(movingYaw)
    const edgePos = this._computeEdgePos(bot.entity.position, backX, backZ)
    this.placementPredictor.record(bot.entity.position, edgePos)

    this._safeWalkUntilMs = ctx.nowMs + randFloat(100, 150)

    console.log(
      `[ninja dbg] BLOCK PLACED placedTotal=${ctx.placedThisMove + 1} safeWalkFor=${(this._safeWalkUntilMs - ctx.nowMs).toFixed(0)}ms ` +
      `pos=(${bot.entity.position.x.toFixed(2)},${bot.entity.position.y.toFixed(2)},${bot.entity.position.z.toFixed(2)}) ` +
      `yaw=${(bot.entity.yaw * RAD2DEG).toFixed(1)} pitch=${(bot.entity.pitch * RAD2DEG).toFixed(1)}`
    )

    this.currentPitch = this._nextPitch()
    this.currentYawBias = this._nextYawBias()
  }

  onMoveEnd (): void {
    this.phase = 'approach'
    this.placementPredictor.reset()
    this.shouldBridge = false
    this.currentYawBias = 0
    this._safeWalkUntilMs = 0
  }

  private _atPlatformEdge (backX: number, backZ: number): boolean {
    const bot = this.bot
    if (!bot.entity.onGround) return false

    const pos = bot.entity.position
    const stepX = Math.round(backX)
    const stepZ = Math.round(backZ)
    const groundY = Math.floor(pos.y) - 1

    const bx = Math.round(pos.x)
    const bz = Math.round(pos.z)

    const underFeet = this.world.getBlockInfo(new Vec3(bx, groundY, bz))
    if (!underFeet.physical && !underFeet.liquid) return false

    const underNext = this.world.getBlockInfo(new Vec3(bx + stepX, groundY, bz + stepZ))
    return !underNext.physical && !underNext.liquid
  }

  private _shouldAllowPlace (ctx: TickContext, backX: number, backZ: number): boolean {
    const avg = this.placementPredictor.average()
    if (avg === null) return true

    const bot = this.bot
    const edgePos = this._computeEdgePos(bot.entity.position, backX, backZ)
    const off = bot.entity.position.minus(edgePos)
    const dist = Math.sqrt((off.x - avg.x) ** 2 + (off.z - avg.z) ** 2)
    return dist <= this.config.normal.placementPredictorThreshold
  }

  private _computeEdgePos (pos: Vec3, backX: number, backZ: number): Vec3 {
    return new Vec3(
      Math.floor(pos.x) + 0.5 - backX * 0.5,
      pos.y,
      Math.floor(pos.z) + 0.5 - backZ * 0.5
    )
  }

  private _snapToNinjaDiagonal (yaw: number): number {
    const D = Math.PI / 4
    const DIAGONALS = [D, 3 * D, 5 * D, 7 * D]
    const wrapped = wrapRadians(yaw)
    let best = DIAGONALS[0]
    let bestDist = Math.abs(shortestYawDelta(wrapped, best))
    for (let i = 1; i < DIAGONALS.length; i++) {
      const dist = Math.abs(shortestYawDelta(wrapped, DIAGONALS[i]))
      if (dist < bestDist) { bestDist = dist; best = DIAGONALS[i] }
    }
    return best
  }

  private _ninjaStrafVec (ninjaYaw: number): Vec3 {
    const w = wrapRadians(ninjaYaw)
    const z = (w < Math.PI / 2 || w >= 3 * Math.PI / 2) ? 1 : -1
    return new Vec3(0, 0, z)
  }

  private _nextPitch (): number {
    return pitchFromDeg(
      this.config.normal.pitch +
      randFloat(-this.config.normal.pitchJitter, this.config.normal.pitchJitter)
    )
  }

  private _nextYawBias (): number {
    return randFloat(-this.config.normal.yawJitter, this.config.normal.yawJitter) * DEG2RAD
  }
}