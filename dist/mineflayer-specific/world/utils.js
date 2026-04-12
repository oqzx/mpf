"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fasterGetBlock = fasterGetBlock;
function fasterGetBlock(pos) {
    const cX = pos.x >> 4;
    const cZ = pos.z >> 4;
    const colKey = `${cX},${cZ}`;
    const col = this.async.columns[colKey];
    if (col == null) {
        return null;
    }
    const colPos = { x: pos.x & 0xf, y: pos.y, z: pos.z & 0xf };
    const ret1 = col.getBlock(colPos);
    ret1.position = pos;
    return ret1;
}
//# sourceMappingURL=utils.js.map