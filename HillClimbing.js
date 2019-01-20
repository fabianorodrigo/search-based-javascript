'use strict';

const State = require("./State");
const Utils = require("./Utils");

const TRACEALL = false;

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
        const TRACE = true;
        let budget = 5;
        return new Promise(async (resolve, reject) => {
            const initStateStackList = [];
            initStateStackList.push(initSolution);
            let iniStateHeuristics = await HillClimbing.getHeuristicsValue(initStateStackList, goalSolution);
            if (TRACEALL || TRACE) console.log('getRouteWithHillClimbing.iniStateHeuristics'.green, iniStateHeuristics);

            const initState = State.newState(initStateStackList, iniStateHeuristics);
            if (TRACEALL || TRACE) console.log('getRouteWithHillClimbing.initState'.green, initState);
            const resultPath = [];
            resultPath.push(initState); //checar

            let currentState = initState;
            let noStateFound = false;
            if (TRACEALL || TRACE) console.log('getRouteWithHillClimbing.currentState.state[0]'.green, currentState.state[0]);
            if (TRACEALL || TRACE) console.log('getRouteWithHillClimbing.currentState.state[0] != goalSolution'.green, currentState.state[0] == goalSolution);
            if (TRACEALL || TRACE) console.log('getRouteWithHillClimbing.currentState.state[0] != goalSolution || noStateFound'.green, !currentState.state[0] == goalSolution || noStateFound);
            while (budget > 0 && (currentState.state[0] != goalSolution || noStateFound)) {
                if (TRACEALL || TRACE) console.log('getRouteWithHillClimbing.while.START'.green);
                noStateFound = true;
                const nextState = await HillClimbing.findNextState(currentState, goalSolution);
                if (TRACEALL || TRACE) console.log('getRouteWithHillClimbing.while.nextState'.green, nextState);
                if (nextState != null) {
                    noStateFound = false;
                    currentState = nextState;
                    resultPath.push(nextState);
                } else {
                    budget--;
                }
            }

            if (TRACEALL || TRACE) console.log('getRouteWithHillClimbing.return'.green, resultPath);
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
        const TRACE = false;
        if (!State.isState(currentState)) throw new Error(`The argument 'currentState' must be an State: ${JSON.stringify(currentState)}`);
        if (!Array.isArray(goalSolution)) throw new Error(`The argument 'goalSolution' must be an Array`);
        const listOfStacks = currentState.state;
        let currentStateHeuristics = currentState.heuristics;

        const resultOperations = await Promise.all(listOfStacks.map((stack, indexStack) => {
            return HillClimbing.applyOperationsOnState(listOfStacks, indexStack, currentStateHeuristics, goalSolution);
        }));
        if (TRACEALL || TRACE) console.log('findNextState.resultOperations'.green, resultOperations);
        return resultOperations[0];
    },

    /**
     * Compute the heuristic value of the state
     * 
     * @param {*} currentSolution The current better solution
     * @param {*} goalSolution The optimum solution desired
     */
    getHeuristicsValue: async function (currentSolution, goalSolution) {
        const TRACE = false;
        let hv = null;
        try {
            hv = await Promise.all(currentSolution.map(stack => {
                if (TRACEALL || TRACE) console.log('getHeuristicsValue.map.stack'.green, stack);
                try {
                    return HillClimbing.getHeuristicsValueForStack(stack, goalSolution);
                } catch (e) {
                    console.error(e)
                }
            }));
        } catch (e) {
            console.error(e);
        }
        hv = hv.reduce(HillClimbing.add, 0);
        if (TRACEALL || TRACE) console.log('getHeuristicsValue.hv'.green, hv);
        return hv;
    },

    add: function (a, b) {
        return a + b;
    },

    /***
     * Returns heuristics value for a particular Stack
     * 
     * @param {Array} stack The stack which heuristics value will be calculated
     * @param {Array} goalSolution The stack that represents the best solution
     * @returns {number} The Heuristics value
     */
    getHeuristicsValueForStack: async function (stack, goalSolution) {
        const TRACE = false;
        if (!Array.isArray(stack)) throw new Error('The stack argument must be an Array');
        if (!Array.isArray(goalSolution)) throw new Error('The goalSolution argument must be an Array');
        let stackHeuristics = 0;
        let isPositionedCorrect = true;
        let goalStartIndex = 0;
        for (let i = 0; i < stack.length; i++) {
            const currentBlock = stack[i];
            if (TRACEALL || TRACE) console.log('getHeuristicsValueForStack.forEach.currentBlock'.green, currentBlock);
            if (isPositionedCorrect && currentBlock == goalSolution[goalStartIndex]) {
                stackHeuristics += goalStartIndex;
            } else {
                stackHeuristics -= goalStartIndex;
                isPositionedCorrect = false;
            }
            if (TRACEALL || TRACE) console.log('getHeuristicsValueForStack.forEach.stackHeuristics'.green, stackHeuristics);
            goalStartIndex++;
        }
        if (TRACEALL || TRACE) console.log('getHeuristicsValueForStack.stackHeuristics returned'.green, stackHeuristics);
        return stackHeuristics;
    },

    /**
    * Generate a new state/solution of type X
    *
    * @param {*} currentSolution Current better solution to be improved
    * @param {Number} indexStack Index of the Input stack to generate a next solution in the currentSolution
    * @param {Number} currentHeuristics The current value of heuristics
    * @param {*} goalSolution The optimum solution desired
    */
    applyOperationsOnState: async function (currentSolution, indexStack, currentStateHeuristics, goalSolution) {
        const TRACE = false;
        if (!Array.isArray(currentSolution) || !Array.isArray(currentSolution[0])) throw new Error(`The argument 'currentSolution' must be an Array of Arrays`);
        if (!Array.isArray(currentSolution[indexStack])) throw new Error(`The argument 'currentSolution[indexStack]' must be an Array`);
        if (!Array.isArray(goalSolution)) throw new Error(`The argument 'goalSolution' must be an Array`);
        let tempState = null;
        let tempSolution = State.cloneStackList(currentSolution);
        if (TRACEALL || TRACE) console.log('applyOperationsOnState.tempSolution'.green, tempSolution);
        if (TRACEALL || TRACE) console.log('applyOperationsOnState.currentSolution[indexStack]'.green, currentSolution[indexStack]);
        let block = tempSolution[indexStack].pop();
        if (TRACEALL || TRACE) console.log('applyOperationsOnState.block'.green, block);
        if (tempSolution[indexStack].length == 0) {
            tempSolution = await Utils.removeArrayItem(tempSolution, tempSolution[indexStack]);
        }
        if (TRACEALL || TRACE) console.log('applyOperationsOnState.tempSolution'.yellow, tempSolution);
        tempState = await HillClimbing.pushElementToNewStack(tempSolution, block, currentStateHeuristics, goalSolution);
        if (TRACEALL || TRACE) console.log('applyOperationsOnState.tempState'.green, tempState);
        if (tempState == null) {
            tempState = await HillClimbing.pushElementToExistingStacks(indexStack, tempSolution, block, currentStateHeuristics, goalSolution, currentSolution);
        }
        if (tempState == null) {
            if(tempSolution[indexStack] == null){
                tempSolution.push([]);
            }
            tempSolution[indexStack].push(block);
        }
        return tempState;
    },

    pushElementToNewStack: async function (stackList, block, currentStateHeuristics, goalSolution) {
        const TRACE = false;
        if (!Array.isArray(stackList)) throw new Error(`The argument 'stackList' must be an Array: ${JSON.stringify(stackList)}`);
        if (!Array.isArray(goalSolution)) throw new Error(`The argument 'goalSolution' must be an Array`);
        let newState = null;
        const newStack = [];
        newStack.push(block);

        stackList.push(newStack);
        if (TRACEALL || TRACE) console.log('pushElementToNewStack.stackList'.yellow, stackList);
        const newStateHeuristics = await HillClimbing.getHeuristicsValue(stackList, goalSolution);
        if (TRACEALL || TRACE) console.log('pushElementToNewStack.newStateHeuristics'.green, newStateHeuristics);
        if (newStateHeuristics > currentStateHeuristics) {
            newState = State.newState(stackList, newStateHeuristics);
        } else {
            stackList = await Utils.removeArrayItem(stackList, newStack);
        }
        return newState;
    },

    pushElementToExistingStacks: async function (indexStack, tempStackList, block, currentStateHeuristics, goalSolution, currentSolution) {
        const TRACE = currentStateHeuristics >= 1;
        if (!Array.isArray(currentSolution[indexStack])) throw new Error(`The argument 'currentSolution[indexStack]' must be an Array: ${JSON.stringify(currentSolution[indexStack])}`);
        if (!Array.isArray(tempStackList)) throw new Error(`The argument 'tempStackList' must be an Array: ${JSON.stringify(tempStackList)}`);
        if (!Array.isArray(goalSolution)) throw new Error(`The argument 'goalSolution' must be an Array`);
        const currentStack = currentSolution[indexStack];
        const newStates = []
        for (let i = 0; i < tempStackList.length; i++) {
            if (currentStack == tempStackList[i]) {
                continue;
            } else {
                //adiciona na stack "i" pra fazer a avaliação
                tempStackList[i].push(block);
                const newStateHeuristics = await HillClimbing.getHeuristicsValue(tempStackList, goalSolution);
                if (newStateHeuristics > currentStateHeuristics) {
                    newStates.push(State.newState(State.cloneStackList(tempStackList), newStateHeuristics));
                }
                //remove na stack "i" pra voltar ao estado original
                tempStackList[i].pop();
            }
        }

        if (TRACEALL || TRACE) console.log('pushElementToExistingStacks.newState'.yellow, JSON.stringify(newStates));
        return newStates.filter(s => s != null)[0];
    },

    pushElementToStack: async function (stack, block, currentStackList, currentStateHeuristics, goalSolution) {
        const TRACE = currentStateHeuristics >= 1;
        if (!Array.isArray(stack)) throw new Error(`The argument 'stack' must be an Array`);
        if (!Array.isArray(currentStackList) || !Array.isArray(currentStackList[0])) throw new Error(`The argument 'currentStackList' must be an Array of Arrays`);
        if (!Array.isArray(goalSolution)) throw new Error(`The argument 'goalSolution' must be an Array`);

        stack.push(block);
        const newStateHeuristics = await HillClimbing.getHeuristicsValue(currentStackList, goalSolution);
        if (TRACEALL || TRACE) console.log('pushElementToStack.newStateHeuristics / currentStateHeuristics'.green, newStateHeuristics, '/', currentStateHeuristics);
        if (newStateHeuristics > currentStateHeuristics) {
            if (TRACEALL || TRACE) console.log('pushElementToStack.RETURN'.green, State.newState(currentStackList, newStateHeuristics));
            return State.newState(currentStackList, newStateHeuristics);
        }
        const indexStack = currentStackList.findIndex(a => {
            return a == stack;
        });
        if (TRACEALL || TRACE) console.log('pushElementToStack.indexStack'.green, indexStack);
        if (TRACEALL || TRACE) console.log('pushElementToStack.currentStackList[indexStack].prePOP'.green, currentStackList[indexStack]);
        if (indexStack > -1) {
            currentStackList[indexStack].pop();
        }
        //stack.pop();
        if (TRACEALL || TRACE) console.log('pushElementToStack.stack.afterPOP'.green, stack);
        if (TRACEALL || TRACE) console.log('pushElementToStack.currentStackList[indexStack].afterPOP'.green, currentStackList[indexStack]);
        return null;
    }

}

module.exports = HillClimbing;