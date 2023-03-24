import Stack from "../../Wolfie2D/DataTypes/Collections/Stack";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import NavigationPath from "../../Wolfie2D/Pathfinding/NavigationPath";
import NavPathStrat from "../../Wolfie2D/Pathfinding/Strategies/NavigationStrategy";
import GraphUtils from "../../Wolfie2D/Utils/GraphUtils";

import Graph from "../../Wolfie2D/DataTypes/Graphs/Graph";
import EdgeNode from "../../Wolfie2D/DataTypes/Graphs/EdgeNode";
import List from "../../Wolfie2D/DataTypes/Collections/List";
import Map from "../../Wolfie2D/DataTypes/Collections/Map";
import PositionGraph from "../../Wolfie2D/DataTypes/Graphs/PositionGraph";

// TODO Construct a NavigationPath object using A*

/**
 * The AstarStrategy class is an extension of the abstract NavPathStrategy class. For our navigation system, you can
 * now specify and define your own pathfinding strategy. Originally, the two options were to use Djikstras or a
 * direct (point A -> point B) strategy. The only way to change how the pathfinding was done was by hard-coding things
 * into the classes associated with the navigation system. 
 * 
 * - Peter
 */
export default class AstarStrategy extends NavPathStrat {

    /**
     * @see NavPathStrat.buildPath()
     */
    public buildPath(to: Vec2, from: Vec2): NavigationPath {
        /* direct path
        let stack = new Stack<Vec2>();
        stack.push(to.clone());
        return new NavigationPath(stack);
        */
       let mg = this.mesh.graph;

        let startPost = mg.snap(from);
        let endPost = mg.snap(to);

        /*
        let edges = mg.getEdges(startPost);
        while (edges != null) {
            console.log(mg.getNodePosition(edges.y));
            edges = edges.next;
        }
        */

        let pathArray = this.AstarIterator(mg, startPost, endPost);
        //console.log(pathArray);
        
        let stack = new Stack<Vec2>();
        stack.push(to.clone());
        //stack.push(new Vec2(100, 100));
        return new NavigationPath(stack);
    }
    
    public AstarIterator(g: PositionGraph, start: number, end: number): number[] {
        let openList = []; // openList to iterate through
        let closeList: []; // iterated and saved.

        openList.push(start);

        return closeList;
    }

    public heuristic(current: number, goal: number): number {
        return -1;
    }
}