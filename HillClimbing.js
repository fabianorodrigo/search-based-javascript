'use strict';

const State = require("./State");
const Utils = require("./Utils");

const TRACE = true;

const HillClimbing = {

    /**
     * Store the solutions found
     */
    state: {},

    heuristics: 0,


    /**
    * Generate a new state/solution of type X
    *
    * @param {*} initSolution The initial state of solution
    * @param {*} goalSolution The optimum solution desired
    */
    getRouteWithHillClimbing: async function (initSolution, goalSolution) {

        return new Promise(async (resolve, reject) => {
            const initStateStackList = [];
            initStateStackList.push(initSolution);
            let iniStateHeuristics = await HillClimbing.getHeuristicsValue(initStateStackList, goalSolution);
            if (trace) console.log('getRouteWithHillClimbing.iniStateHeuristics'.green, iniStateHeuristics);

            const initState = State(initStateStackList, iniStateHeuristics);
            if (trace) console.log('getRouteWithHillClimbing.initState'.green, initState);
            const resultPath = [];
            resultPath.push(initState); //checar

            let currentState = initState;
            let noStateFound = false;
            if (trace) console.log('getRouteWithHillClimbing.currentState.state[0]'.green, currentState.state[0]);
            if (trace) console.log('getRouteWithHillClimbing.currentState.state[0] == goalSolution'.green, currentState.state[0] == goalSolution);
            while (!currentState.state[0] == goalSolution || noStateFound) {
                noStateFound = true;
                const nextState = await HillClimbing.findNextState(currentState, goalSolution);
                if (nextState != null) {
                    noStateFound = false;
                    currentState = nextState;
                    resultPath.add(nextState);
                }
            }

            if (trace) console.log('getRouteWithHillClimbing.return'.green, resultPath);
            resolve(resultPath);
        })
    },

    /**
     * finds new state from current state based on goal and
     * heuristics
     * 
     * @param {*} currentState The current better solution
     * @param {*} goalSolution The optimum solution desired
     */
    findNextState: async function (currentState, goalSolution) {
        const listOfStacks = currentState.state;
        let currentStateHeuristics = currentState.heuristics;

        const resultOperations = listOfStacks.map(async stack => {
            HillClimbing.applyOperationsOnState(listOfStacks, stack, currentStateHeuristics, goalSolution);
        });

        return resultOperations[0];
    },

    /**
     * Compute the heuristic value of the state
     * 
     * @param {*} currentSolution The current better solution
     * @param {*} goalSolution The optimum solution desired
     */
    getHeuristicsValue: async function (currentSolution, goalSolution) {
        let hv = null;
        try {
            hv = await Promise.all(currentSolution.map(stack => {
                if (trace) console.log('getHeuristicsValue.map.stack'.green, stack);
                try {
                    return HillClimbing.getHeuristicsValueForStack(stack, currentSolution, goalSolution);
                } catch (e) {
                    console.error(e)
                }
            }));
        } catch (e) {
            console.error(e);
        }
        //hv = hv.reduce(HillClimbing.add, 0);
        if (trace) console.log('getHeuristicsValue.hv'.green, hv);
        return hv;
    },

    add: function (a, b) {
        return a + b;
    },

    getHeuristicsValueForStack: async function (stack, currentSolution, goalSolution) {
        let stackHeuristics = 0;
        let isPositionedCorrect = true;
        let goalStartIndex = 0;
        if (trace) console.log('getHeuristicsValueForStack.beforeForEach'.green);
        await stack.forEach(async currentBlock => {
            if (trace) console.log('getHeuristicsValueForStack.forEach.currentBlock'.green, currentBlock);
            if (isPositionedCorrect && currentBlock == goalSolution[goalStartIndex]) {
                stackHeuristics += goalStartIndex;
            } else {
                stackHeuristics -= goalStartIndex;
                isPositionedCorrect = false;
            }
            goalStartIndex++;
        });
        if (trace) console.log('getHeuristicsValueForStack.stackHeuristics'.green, stackHeuristics);
        return stackHeuristics;
    },

    /**
    * Generate a new state/solution of type X
    *
    * @param {*} currentSolution Current better solution to be improved
    * @param {*} input Input to generate a next solution
    * @param {Number} currentHeuristics The current value of heuristics
    * @param {*} goalSolution The optimum solution desired
    */
    applyOperationsOnState: function (currentSolution, input, currentHeuristics, goalSolution) {
        let tempState = null;
        const tempSolution = currentSolution.clone();
        let block = input.pop();
        if (input.length == 0) {
            console.log('tempSolution pre remove', tempSolution);
            Utils.removeArrayItem(tempSolution, input);
            console.log('tempSolution pos remove', tempSolution);
        }
        tempState = HillClimbing.pushElementToNewStack(tempSolution, block, currentStateHeuristics, goalSolution);
        if (tempState == null) {
            tempState = HillClimbing.pushElementToExistingStacks(stack, tempSolution, block, currentStateHeuristics, goalSolution);
        }
        if (tempState == null) {
            stack.push(block);
        }
        return tempState;
    },

    pushElementToNewStack: function (stackList, block, currentStateHeuristics, goalSolution) {
        let newState = null;
        const newStack = [];
        newStack.push(block);

        stackList.push(newStack);
        const newStateHeuristics = HillClimbing.getHeuristicsValue(stackList, goalSolution);
        if (newStateHeuristics > currentStateHeuristics) {
            newState = State(stackList, newStateHeuristics);
        } else {
            Utils.removeArrayItem(stackList, newStack);
        }
        return newState;
    },

    pushElementToExistingStacks: function (currentStack, currentStackList, block, currentStateHeuristics, goalSolution) {
        const newState = currentStackList.filter(stack => stack != currentStack).map(stack => {
            return HillClimbing.pushElementToStack(stack, block, currentStackList, currentStateHeuristics, goalSolution);
        });
        return newState[0];
    },

    pushElementToStack: function (stack, block, currentStackList, currentStateHeuristics, goalSolution) {
        stack.push(block);
        const newStateHeuristics = HillClimbing.getHeuristicsValue(currentStackList, goalSolution);
        if (newStateHeuristics > currentStateHeuristics) {
            return State(currentStackList, newStateHeuristics);
        }
        stack.pop();
        return null;
    }

}

module.exports = HillClimbing;