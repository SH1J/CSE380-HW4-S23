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

/*
1- create 2 list, open/closed
-- open list contains nodes/edges that needs to be checked
-- closed list contains nodes/edges that are checked

2- look at adjacent nodes
-- only left/right/up/down based on what EdgeNode Linklist have
-- add neighbors to open list if not in, update/ignore if already in.
-- after finding neighbors, add current node to closed list with distance weight

3- distance weight ... heuristic
-- f = total distance = g + h
-- g = actual movement from starting square
-- h = theretical distance to goal (gonna use Manhattan distance)

4- repeat 2-3 until path is found or map is all observed.
-- if path found, return the nodes to reach
-- if path not found, do nothing

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
        
        console.log('\nStart', startPost);
        console.log('End', endPost);
        console.log("");
        */

        let returnedClosedList = this.AstarIterator(mg, startPost, endPost);

        let stack = this.pathStack(startPost, endPost, returnedClosedList);
        return new NavigationPath(stack);
    }

    private AstarIterator(g: PositionGraph, start: number, end: number) {
        let openList = [{"node": start, "fCost": 0, "gCost": 0, "hCost": 0, "parent": start}]; // openList to iterate through
        let closeList = []; // iterated and saved.
        
        /*
        console.log("starting open");
        console.log(openList);
        console.log(openList.length);
        console.log("");
        */

        while (openList.length > 0) {
            /*
            console.log("open");
            console.log(openList.length);
            for (let i = 0; i < openList.length; i++) {
                console.log(openList[i]);
            }
            */

            openList.sort(function(obj1, obj2) {
                // || obj1.node - obj2.node
                return obj1.fCost - obj2.fCost || obj1.hCost - obj2.hCost;
            });

            /*
            console.log("open sorted");
            console.log(openList.length);
            for (let i = 0; i < openList.length; i++) {
                console.log(openList[i]);
            }
            */

            let currentNodeSet = openList.shift();
            let currentNode = currentNodeSet.node;

            /*
            console.log("current node")
            console.log(currentNodeSet);
            console.log(currentNode);
            console.log("close");
            console.log(closeList.length);

            for (let i = 0; i < closeList.length; i++) {
                console.log(closeList[i]);
            }
            console.log("");
            */

            if (currentNode == end) {
                console.log("Path found");
                closeList.push(currentNodeSet);
                return closeList;
            }
            
            let adjacentList = this.getAdjacents(currentNode);
            for (let i = 0; i < adjacentList.length; i++) {
                if (closeList.findIndex(x => x.node === adjacentList[i]) > -1) {continue;}
                let newNodeSet = this.getHeuristic(adjacentList[i], end, currentNodeSet)[0];

                if ((openList.findIndex(x => x.node === adjacentList[i]) > -1)) {
                    let oldNode = openList.find(x => x.node === adjacentList[i]);
                    let gCostOld = oldNode.gCost;
                    if (gCostOld > newNodeSet.gCost) {
                        newNodeSet.parent = currentNode;
                        openList[openList.findIndex(x => x.node === adjacentList[i])] = newNodeSet;
                    }
                }
                else if ((openList.findIndex(x => x.node === adjacentList[i]) == -1)) {
                    newNodeSet.parent = currentNode;
                    openList.push(newNodeSet);
                }
            }
            closeList.push(currentNodeSet);
        }
        console.log("Path not Found");
        return [];
    }

    private getHeuristic(nodeID: number, goal: number, parentNode) {
        let mg = this.mesh.graph;
        
        let nodePosition = mg.getNodePosition(nodeID);
        let endPosition = mg.getNodePosition(goal);

        let xDistEnd = Math.abs(endPosition.x - nodePosition.x);
        let yDistEnd = Math.abs(endPosition.y - nodePosition.y);

        // gCost
        let gCost = Number(parentNode.gCost) + 1;

        // hCost
        let hCost = xDistEnd + yDistEnd;

        let edgeNum = 1;
        let edges = mg.getEdges(nodeID);
        while (edges.next != null) {
            edges = edges.next;
            edgeNum++;
        }

        if (edgeNum < 2) {
            hCost += 10;
        }
        else if (edgeNum < 3) {
            hCost += 5;
        }

        let fCost = gCost + hCost;

        return [{ "node": nodeID, "fCost": fCost, "gCost": gCost, "hCost": hCost, "parent": -1}];
    }

    private updateHeuristic(currentNode, goal: number, parentNode) {
        let node = currentNode.node;
        let fCost = currentNode.fCost;
        let hCost = currentNode.hCost;
        let parent = parentNode.parent;
        
        let gCost = parent.gCost + 1;

        return [{ "node": node, "fCost": fCost, "gCost": gCost, "hCost": hCost, "parent": parent}];
    }

    private getAdjacents(node: number) {
        let adjacents = [];
        let edges = this.mesh.graph.getEdges(node);
        //console.log(edges);

        if (edges != undefined) {
            while (edges.next != null) {
                edges = edges.next;
                adjacents.push(edges.y);
            }
        }
        
        return adjacents
    }

    private pathStack(start: number, end: number, pathArray) {
        let stackPath = new Stack<Vec2>(pathArray.length);
        let mg = this.mesh.graph;
        let pathFound = false;
        
        let pathNode = pathArray.find(x => x.node === end);

        if (pathArray == 0) {
            return stackPath;
        }

        stackPath.push(mg.getNodePosition(pathNode.node));
        let pathParent = pathNode.parent;


        while (!pathFound) { 
            pathNode = pathArray.find(x => x.node === pathParent);
            stackPath.push(mg.getNodePosition(pathNode.node));
            pathParent = pathNode.parent;
            
            if (pathNode.node == pathParent) {
                pathFound = true;
            }
        }
        
        return stackPath;
    }
}