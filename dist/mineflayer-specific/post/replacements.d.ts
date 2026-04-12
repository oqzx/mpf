import { Vec3 } from 'vec3';
import { Path, MovementProvider as AMovementProvider, PathNode, Algorithm } from '../../abstract';
import { Move } from '../move';
import { Movement, MovementProvider } from '../movements';
import { MovementReplacement } from './replacement';
export declare class ReplacementHandler implements AMovementProvider<Move> {
    private readonly orgMove;
    private readonly replacement;
    constructor(orgMove: Move, replacement: MovementProvider);
    static createFromSingle(move: Move, replacement: MovementProvider): ReplacementHandler;
    sanitize(): boolean;
    getNeighbors(org: Move): Move[];
}
export declare class SimpleJumpSprintReplacement extends Movement implements MovementReplacement {
    movementProvider: ReplacementHandler;
    startPosition: Vec3;
    endPosition: Vec3;
    canReplace(move: Move): boolean;
    initialize(move: Move): void;
    compute(): Path<Move, MovementReplacement> | null;
    makeResult(status: string, node: PathNode<Move>): Path<Move, Algorithm<Move>>;
}
