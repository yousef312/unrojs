const algos = ['clearpath', 'insertion', 'lineare'];

/**
 * @typedef {Object} Stack
 * @property {function} undo called when user is attempting to undo action
 * @property {function} redo called when user is attempting to redo action
 */

/**
 * Simple integration of undo/redo functionalities
 * @author Yousef Neji
 */
function Unro(max, algo) {
    /**
     * The stacks container
     * @type {Array<Stack>}
     */
    this.stack = [];

    /**
     * Current stack/state index 
     * @type {number} 
     */
    this.current = -1;

    /**
     * Maximum number of stacks that can be held.
     * @type {number}
     */
    this.maximum = typeof max === "number" ? max : 20;

    /**
     * The algorithme to use when stacking, or the stacking method, may be one of those:
     *  - `clearpath` : once you undo and push new stack the forward stacks will be removed.
     *  - `insertion` : once you undo and push new stack the new one will be inserted in front of the forward stacks.
     *  - `lineare` : once you push new stack it will be always added to the end of the stacks list.
     * 
     * by defaults its `clearpath`
     * @type {string}
     */
    this.algo = algos.includes(algo) ? algo : "clearpath";
}
Unro.prototype = {
    /**
     * Push new stack/state into the stacks list
     * @method Unro#push
     * @param {Stack} stack
     * @returns {number} the current state index
     */
    push: function (stack) {
        if (!stack || typeof stack.undo != "function" || typeof stack.redo != "function")
            return console.error(`[UnroJS] wrong stack defintion in .push, a stack must have undo & redo functins`);

        if (this.algo === 'lineare') {
            this.current = this.stack.push(elm) - 1;
        }
        else if (this.algo === 'clearpath') {
            if (this.stack[this.current + 1] !== undefined) {
                this.stack.splice(this.current + 1, this.stack.length);
            }
            this.current = this.stack.push(elm) - 1;
        }
        else if (this.algo === 'insertion') {
            this.stack.insert(elm, this.current + 1);
        }

        // respect maximum term
        if (this.stack.length > this.maximum) {
            this.stack.shift();
        }

        return this.current;
    },
    /**
     * Undo the last change or state/stack
     * @method Unro#undo
     * @param {number} step how much steps to undo; default to 1
     * @returns {Unro}
     */
    undo: function (step = 1) {
        this.current = Math.max(this.current - step, 0);
        this.stack[this.current].undo();
        return this;
    },
    /**
     * Redo the last change or state/stack
     * @method Unro#redo
     * @param {number} step how much states to redo; default to 1
     * @returns {Unro}
     */
    redo: function (step = 1) {
        this.current = Math.min(this.current + step,this.stack.length - 1);
        this.stack[this.current].redo();
        return this;
    },
    /**
     * Expand the stack maximum length
     * @method Unro#expand
     * @param {number} value
     * @returns {Unro}
     */
    expand: function (value) {
        this.maximum = typeof value == "number" ? value : this.maximum;
        return this
    },
    /**
     * Clear/reset the stack content
     * @method Unro#freeUp
     * @returns {Unro}
     */
    freeUp: function () {
        this.stack = [];
        this.current = 0;
        return this
    },
    /**
     * Move to a specified stack, the function will execute all stack up to 
     * the one requested, and return either the stack or:
     *  - `out-of-range`: when requested stack index doesn't exists
     *  - `current`: if requested stack is the current one
     * @method Unro#moveTo
     * @param {number} i 
     * @returns {string} the wanted stack content or the string `out-of-rang`
     */
    moveTo: function (i) {
        if (i === this.current) return 'current';
        if (this.stack[i]) {
            // you can't just jump from age 20 to 55
            // you must go through all between
            // the same happens here
            if (i > this.current)
                for (let j = this.current + 1; j <= i; j++)
                    this.stack[j].redo(); // redoing the stack
            else
                for (let j = this.current; j >= i; j--)
                    this.stack[j].undo(); // undoing the stack

            this.current = i;
            return this.stack[i];
        } else return 'out-of-range';
    },
    /**
     * Change the `algo` property value, available options are:
     *  - `clearpath` : once you undo and push new stack the forward stacks will be removed.
     *  - `insertion` : once you undo and push new stack the new one will be inserted in front of the forward stacks.
     *  - `lineare` : once you push new stack it will be always added to the end of the stacks list.
     * @method Unro#setAlgorithme
     * @param {string} algo 
     * @returns {boolean}
     */
    setAlgorithme: function (algo) {
        if (algos.includes(algo)) {
            this.algo = algo;
            return true
        }
        return false
    }
};

window.Unro = Unro;

export { Unro as default };
//# sourceMappingURL=unro.esm.js.map
