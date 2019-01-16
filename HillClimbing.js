'use strict';

const State = require("./State");

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
    getRouteWithHillClimbing: function (initSolution, goalSolution) {
        const initStateStackList = [];
        initStateStackList.push(initSolution);
        let iniStateHeuristics = HillClimbing.getHeuristicsValue(initStateStackList, goalSolution);

        const initState = State(initStateStackList, iniStateHeuristics);

        const resultPath = [];
        resultPath.push(initState); //checar

        let currentState = initState;
        let noStateFound = false;
        while (!currentState.state[0] == goalSolution || noStateFound) {
            noStateFound = true;
            const nextState = HillClimbing.findNextState(currentState, goalSolution);
            if (nextState != null) {
                noStateFound = false;
                currentState = nextState;
                resultPath.add(nextState);
            }
        }

        return resultPath;
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

        listOfStacks.forEach(stack=>{
            
        })

        return listOfStacks.stream()
            .map(stack -> {
                return applyOperationsOnState(listOfStacks, stack, currentStateHeuristics, goalStateStack);
            })
            .filter(Objects::nonNull)
            .findFirst()
            .orElse(null);
    }

    /**
     * Compute the heuristic value of the state
     * @param {*} goalSolution The optimum solution desired
     * @param {*} currentState The current better solution
     * @param {*} newSolution The new solution proposed to be evaluated
     */
    getHeuristicsValue: async function (goalSolution, currentSolution, newSolution) {
        //TODO: implement the computation
        if (currentSolution > newSolution) {
            return -1;
        } else {
            return 1;
        }
    },

    /**
    * Generate a new state/solution of type X
    *
    * @param {*} currentSolution Current better solution to be improved
    * @param {*} input Input to generate a next solution
    * @param {Number} currentHeuristics The current value of heuristics
    */
    solutionX: function (currentSolution, input, currentHeuristics) {
        //TODO: write it
    }

}

module.exports = HillClimbing;