const algos = ['clearpath', 'insertion', 'lineare'];

/**
 * Stack states bank
 * @type {Map<Stack,{state: *,id: number}>}
 */
const Bank = new Map();
let counter = 0;
const clamp = (v, min, max) => v < min ? min : v > max ? max : v;
Array.prototype.insert = function (elm, index) {
    this.splice(clamp(index, 0, this.length), 0, elm);
    return index;
}

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
    this.maximum = typeof max === "number" ? max : 100;

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
     * Push new stack/state into the stacks list, and directly execute unless
     * you set `dontExecute` as true.
     * @method Unro#push
     * @param {Stack} stack
     * @param {boolean} dontExecute
     * @returns {number} the current state index
     */
    push: function (stack, dontExecute) {
        if (!stack || typeof stack.undo != "function" || typeof stack.redo != "function")
            return console.error(`[UnroJS] wrong stack defintion in .push, a stack must have undo & redo functins`);

        // let's prepare the stack state storage
        Bank.set(stack, { state: null, id: ++counter });
        let oldIndex = this.current;

        if (this.algo === 'lineare')
            this.current = this.stack.push(elm) - 1;
        else if (this.algo === 'clearpath') {
            if (this.stack[oldIndex + 1] !== undefined)
                this.stack.splice(oldIndex + 1, this.stack.length)
                .forEach(old => Bank.delete(old));
            this.current = this.stack.push(elm) - 1;
        } else if (this.algo === 'insertion') {
            this.current = this.stack.insert(elm, oldIndex + 1);
        }

        // respect maximum term
        if (this.stack.length > this.maximum) {
            this.stack.shift();
            this.current = oldIndex;
        } else if (dontExecute === true) {
            this.current--;
            this.redo();
        }

        return this.current;
    },
    /**
     * Undo the last change or state/stack
     * @method Unro#undo
     * @returns {Unro}
     */
    undo: function () {
        if (!this.stack[this.current - 1]) return;
        this.current--;
        this.stack[this.current].undo.call(this);
        return this;
    },
    /**
     * Redo the last change or state/stack
     * @method Unro#redo
     * @returns {Unro}
     */
    redo: function () {
        if (!this.stack[this.current + 1]) return;
        this.current++;
        this.stack[this.current].redo.call(this);
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
        Bank.clear();
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
                for (let j = this.current + 1; j <= i; j++) {
                    this.current = j; // required for state functionality
                    this.stack[j].redo.call(this); // redoing the stack
                }
            else
                for (let j = this.current; j >= i; j--) {
                    this.current = j; // required for state functionality
                    this.stack[j].undo.call(this); // undoing the stack
                }

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
    },
    /**
     * Save to stack state, better be used inside `.undo` or `.redo` functions
     * @method Unro#save
     * @param {*} data
     */
    save: function (data) {
        Bank.get(this.stack[this.current]).state = data;
    },
    /**
     * Load data from stack state.
     * @method Unro#load
     * @returns {*}
     */
    load: function () {
        return Bank.get(this.stack[this.current]).state;
    }
}

window.Unro = Unro;
export default Unro;