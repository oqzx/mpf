import { Bot } from 'mineflayer';
import { Move } from '../../move';
import { World } from '../../world/worldInterface';
export declare class PathSplicer {
    static computeSpliceEnd(bot: Bot, world: World, startIndex: number, path: Move[], maxLook?: number): number;
    private static _xzDir;
    private static _hasSupportAt;
}
