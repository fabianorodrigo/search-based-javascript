'use strict';

const Utils = {

    /**
    * Find the element inside the array and remove it
    *
    * @param {array} array The array which will be affected
    * @param {*} element Element to be removed
    * @return {array} The array up-to-date
    */
    removeArrayItem: function (array, element) {
        if (!Array.isArray(array)) throw new Error('First argument must be an Array');
        const i = array.findIndex((e) => {
            if (e === element) {
                return true;
            }
        });
        if (i > -1) {
            array.splice(i, 1);
        }
        return array;
    }
}

module.exports = Utils;
