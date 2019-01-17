'use strict';

const State = (state, heuristics) => {
    return {
        //Array implements methods of Stack and can be used as list as well
        state: state,
        heuristics: heuristics
    }
}

module.exports = State;