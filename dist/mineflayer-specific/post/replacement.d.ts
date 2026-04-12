import { Move } from '../move';
import { Algorithm, Path } from '../../abstract';
import { ReplacementMap } from '.';
import { Bot } from 'mineflayer';
import { World } from '../world/worldInterface';
interface Result {
    referencePath: Move[];
    replacements: Map<number, Path<Move, MovementReplacement>>;
    context: Replacer;
}
export interface MovementReplacement extends Algorithm<Move> {
    canReplace: (move: Move) => boolean;
    initialize: (move: Move) => void;
    compute: () => Path<Move, MovementReplacement> | null;
}
export declare class Replacer {
    repMap: ReplacementMap;
    private pathCopy;
    private currentIndex;
    constructor(bot: Bot, world: World, optMap: ReplacementMap);
    loadPath(path: Move[]): void;
    sanitize(): boolean;
    makeResult(this: Replacer, repRetMap: Map<number, Path<Move, MovementReplacement>>): Result;
    compute(): Promise<Result>;
}
export {};
