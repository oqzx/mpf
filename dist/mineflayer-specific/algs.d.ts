import { Goal, MovementProvider, Path as APath } from '../abstract';
import { AStarBackOff as AAStarBackOff } from '../abstract/algorithms/astar';
import { PathStatus } from '../types';
import { Move } from './move';
import { PathNode } from './node';
export interface Path extends APath<Move, AStar> {
}
export interface OptPath extends Path {
    optPath: Move[];
}
export interface PathProducer {
    getCurrentPath: () => Move[];
    getAstarContext: () => AStar | undefined;
    advance: () => {
        result: Path;
        astarContext: AStar;
    };
}
export declare class AStar extends AAStarBackOff<Move> {
    visitedChunks: Set<string>;
    mostRecentNode: PathNode;
    constructor(start: Move, movements: MovementProvider<Move>, goal: Goal<Move>, timeout: number, tickTimeout?: number, searchRadius?: number, differential?: number);
    protected addToClosedDataSet(node: PathNode): void;
    compute(): Path;
}
export declare class AStarNeighbor extends AStar {
    makeResult(status: PathStatus, node: PathNode): Path;
    compute(): Path;
    private test;
}
