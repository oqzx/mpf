"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapDegrees = wrapDegrees;
exports.wrapRadians = wrapRadians;
exports.strafeMovement = strafeMovement;
exports.botStrafeMovement = botStrafeMovement;
exports.smartMovement = smartMovement;
exports.botSmartMovement = botSmartMovement;
const TWO_PI_OVER_TWELVE = (2 * Math.PI) / 12;
const FOUR_PI_OVER_TWELVE = (4 * Math.PI) / 12;
const EIGHT_PI_OVER_TWELVE = (8 * Math.PI) / 12;
const TEN_PI_OVER_TWELVE = (10 * Math.PI) / 12;
const FOURTEEN_PI_OVER_TWELVE = (14 * Math.PI) / 12;
const SIXTEEN_PI_OVER_TWELVE = (16 * Math.PI) / 12;
const TWENTY_PI_OVER_TWELVE = (20 * Math.PI) / 12;
const TWENTY_TWO_PI_OVER_TWELVE = (22 * Math.PI) / 12;
const TWO_PI = 2 * Math.PI;
function wrapDegrees(degrees) {
    const tmp = degrees % 360;
    return tmp < 0 ? tmp + 360 : tmp;
}
function wrapRadians(radians) {
    const tmp = radians % TWO_PI;
    return tmp < 0 ? tmp + TWO_PI : tmp;
}
function findDiff(position, velocity, yaw, pitch, nextPoint, onGround) {
    const xzVel = velocity.offset(0, -velocity.y, 0);
    const amt = xzVel.norm();
    let scale = onGround ? 0 : 1;
    if (amt > 0.17)
        scale = 2;
    if (position.distanceTo(nextPoint) < 0.3)
        scale = 0;
    if (amt < 0.02)
        scale = 0;
    const offset = position.plus(velocity.scaled(scale));
    const lookDiff = wrapRadians(wrapRadians(yaw));
    if (xzVel.norm() < 0.03) {
        const dir = nextPoint.minus(offset);
        const dx = dir.x;
        const dz = dir.z;
        const wantedYaw = wrapRadians(Math.atan2(-dx, -dz));
        const diff = wrapRadians(wantedYaw - lookDiff);
        return diff;
    }
    const dir = nextPoint.minus(offset);
    const dx = dir.x;
    const dz = dir.z;
    const wantedYaw = wrapRadians(Math.atan2(-dx, -dz));
    const diff = wrapRadians(wantedYaw - lookDiff);
    return diff;
}
function strafeMovement(ctx, nextPoint) {
    ctx.control.set('left', false);
    ctx.control.set('right', false);
}
function botStrafeMovement(bot, nextPoint) {
    const diff = findDiff(bot.entity.position, bot.entity.velocity, bot.entity.yaw, bot.entity.pitch, nextPoint, bot.entity.onGround);
    if (bot.entity.position.distanceTo(nextPoint) < 0.1) {
        bot.setControlState('left', false);
        bot.setControlState('right', false);
    }
    if (FOURTEEN_PI_OVER_TWELVE < diff && diff < TWENTY_TWO_PI_OVER_TWELVE) {
        bot.setControlState('left', false);
        bot.setControlState('right', true);
    }
    else if (TWO_PI_OVER_TWELVE < diff && diff < TEN_PI_OVER_TWELVE) {
        bot.setControlState('left', true);
        bot.setControlState('right', false);
    }
    else {
        bot.setControlState('left', false);
        bot.setControlState('right', false);
    }
}
function smartMovement(ctx, nextPoint, sprint = true) {
    const diff = findDiff(ctx.pos, ctx.vel, ctx.yaw, ctx.pitch, nextPoint, ctx.onGround);
    if (ctx.pos.distanceTo(nextPoint) < 0.1) {
        ctx.control.set('forward', false);
        ctx.control.set('back', false);
        return;
    }
    if (EIGHT_PI_OVER_TWELVE < diff && diff < SIXTEEN_PI_OVER_TWELVE) {
        ctx.control.set('forward', false);
        ctx.control.set('sprint', false);
        ctx.control.set('back', true);
    }
    else if (TWENTY_PI_OVER_TWELVE < diff || diff < FOUR_PI_OVER_TWELVE) {
        ctx.control.set('forward', true);
        ctx.control.set('sprint', sprint);
        ctx.control.set('back', false);
    }
    else {
        ctx.control.set('forward', false);
        ctx.control.set('sprint', false);
        ctx.control.set('back', false);
    }
}
function botSmartMovement(bot, nextPoint, sprint) {
    const diff = findDiff(bot.entity.position, bot.entity.velocity, bot.entity.yaw, bot.entity.pitch, nextPoint, bot.entity.onGround);
    if (bot.entity.position.distanceTo(nextPoint) < 0.1) {
        bot.setControlState('forward', false);
        bot.setControlState('back', false);
        return;
    }
    if (EIGHT_PI_OVER_TWELVE < diff && diff < SIXTEEN_PI_OVER_TWELVE) {
        bot.setControlState('forward', false);
        bot.setControlState('sprint', false);
        bot.setControlState('back', true);
    }
    else if (TWENTY_PI_OVER_TWELVE < diff || diff < FOUR_PI_OVER_TWELVE) {
        bot.setControlState('forward', true);
        bot.setControlState('sprint', sprint);
        bot.setControlState('back', false);
    }
    else {
        bot.setControlState('forward', false);
        bot.setControlState('sprint', false);
        bot.setControlState('back', false);
    }
}
//# sourceMappingURL=controls.js.map