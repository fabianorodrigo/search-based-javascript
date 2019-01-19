'use strict';

const State = {

    newState: (state, heuristics) => {
        if (State.isState(state)) {
            const s = {
                state: [],
                heuristics: state.heuristics
            }
            if (!Array.isArray(state.state) || !Array.isArray(state.state[0])) throw new Error(`The argument 'state.state' must be an Array of Arrays`);
            for (let i = 0; i < state.state.length; i++) {
                const stack = state.state[i];
                s.state.push(stack);
            }
        } else {
            if (!Array.isArray(state) || !Array.isArray(state[0])) throw new Error(`The argument 'state' must be an Array of Arrays`);
            return {
                //Array implements methods of Stack and can be used as list as well
                state: state,
                heuristics: heuristics
            }
        }
    },

    isState: (obj) => {
        return obj.state != null && obj.heuristics != null;
    },

    cloneStackList: (stackList)=>{
        if (!Array.isArray(stackList) || !Array.isArray(stackList[0])) throw new Error(`The argument 'state' must be an Array of Arrays`);
        const clone = [];
        stackList.forEach(stack=>{
            clone.push(stack.slice(0)); //shallow copy of an array
        });
        return clone;
    }
}

module.exports = State;