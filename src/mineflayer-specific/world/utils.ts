import { Vec3 } from 'vec3'
import { Block } from '../../types'
import { Bot } from 'mineflayer'

export function fasterGetBlock (this: Bot['world'], pos: Vec3): Block {
  const fx = Math.floor(pos.x)
  const fy = Math.floor(pos.y)
  const fz = Math.floor(pos.z)

  const cX = fx >> 4
  const cZ = fz >> 4

  const colKey = `${cX},${cZ}`
  const col = (this.async as any).columns[colKey]

  if (col == null) {
    return null as unknown as Block
  }
  const colPos = new Vec3(fx & 0xf, fy, fz & 0xf)

  const ret1 = col.getBlock(colPos as any)
  if (ret1 == null) return null as unknown as Block
  ret1.position = new Vec3(fx, fy, fz)
  return ret1
}
