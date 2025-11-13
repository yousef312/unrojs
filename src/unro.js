const algos = ['clearpath', 'insertion', 'lineare'];

const dfn = () => { } // dfn stands for Default function
let counter = 0;
const clamp = (v, min, max) => v < min ? min : v > max ? max : v;
Array.prototype.insert = function (elm, index) {
    this.splice(clamp(index, 0, this.length), 0, elm);
    return index;
}

/**
 * @typedef {Object} StackDef
 * @property {function} undo called when user is attempting to undo action
 * @property {function} redo called when user is attempting to redo action
 * @property {string} label helps identifiy the stack action
 * @property {Date} date the stack action date
 */

/**
 * Utility used to to create Canvas Stack
 * @typedef {Object} Maker
 * @property {(dst: OffscreenCanvasRenderingContext2D|CanvasRenderingContext2D)=>} use Define destination to use in the Stack
 * @property {(str: string)=>} label Label the stack
 * @property {(step: "undo"|"redo", src?: OffscreenCanvasRenderingContext2D|CanvasRenderingContext2D|ImageData)=>} register Register `undo` & `redo` calls
 * @property {(step: "unro"|"redo"|()=>, cb?: ()=>)=>} after defines a callback to run after one of the stacks or both
 */

/**
 * Simple integration of undo/redo functionalities
 * @author Yousef Neji
 */
export class Unro {
    /**
     * The stacks container
     * @type {Array<Stack>}
     */
    #stack = [];

    /**
     * Last action performed
     * @type {"undo" | "redo"}
     */
    #last = null;

    /**
     * Holds a state of whether all stacks are done or not
     * @type {boolean}
     */
    #alldone = false;

    /**
     * Holds a state of whether all stacks are undone or not
     * @type {boolean}
     */
    #allundone = false;

    /**
     * List of defined labeled stacks handlers created through `.define` method
     * @type {Array<{ label: string, undo: (params: Object) =>, redo: (params: Object) => }>}
     */
    #defined = [];


    /**
     * Used to create canvas stacks
     * @type {Maker}
     */
    #maker = null;

    constructor() {

        /**
         * Current stack/state index 
         * @type {number} 
         */
        this.current = -1;

        /**
         * Maximum number of stacks that can be held.
         * @type {number}
         */
        this.maximum = 100;

        /**
         * The algorithme to use when stacking, or the stacking method, may be one of those:
         *  - `clearpath` : once you undo and push new stack the forward stacks will be removed.
         *  - `insertion` : once you undo and push new stack the new one will be inserted in front of the forward stacks.
         *  - `lineare` : once you push new stack it will be always added to the end of the stacks list.
         * 
         * by defaults its `clearpath`
         * @type {string}
         */
        this.algo = "clearpath";

        const maker = () => {
            let destination, label, undo, redo, undoCb, redoCb;
            return {
                use: (dst) => {
                    if (
                        dst instanceof OffscreenCanvasRenderingContext2D ||
                        dst instanceof CanvasRenderingContext2D
                    )
                        destination = dst;
                    else throw new Error(`UnroJs Definition Error\n Parameter passed in ".use" function must be of type OffscreenCanvasRenderingContext2D or CanvasRenderingContext2D`);
                },
                label: (str) => label = str,
                register: (step, src) => {
                    if (!destination && (!src || (!(src instanceof OffscreenCanvasRenderingContext2D) && !(src instanceof CanvasRenderingContext2D))))
                        throw new Error(`UnroJs Defintion Error\n ".register" is missing the source parameter`)
                    const f = src || destination;
                    switch (step) {
                        case "undo":
                            undo = f instanceof ImageData ? f : f.getImageData(0, 0, f.canvas.width, f.canvas.height);
                            break;
                        case "redo":
                            redo = f instanceof ImageData ? f : f.getImageData(0, 0, f.canvas.width, f.canvas.height);
                            break;
                    }
                },
                after: (step, cb) => {
                    if (step === "undo" && typeof cb === "function")
                        undoCb = cb;
                    else if (step === "redo" && typeof cb === "function")
                        redoCb = cb;
                    else if (typeof step === "function") {
                        undoCb =
                            redoCb =
                            step;
                    }
                },
                process: function () {
                    if (!(this instanceof Unro))
                        throw new Error(`UnroJs Error\n".process" function is only callable from within Unro class`);
                    if (!undo || !redo || !destination)
                        throw new Error(`UnroJs Definition Error\n Definition is missing "undo" or "redo" stacks or destination CanvasContext! make sure to call ".register(stack)" and ".use(dst)" from within the maker`);
                    let nst = new Stack({
                        undo: function () {
                            this.load("source").putImageData(this.load("undo"), 0, 0);
                            if (this.load("undo-cb")) this.load("undo-cb")();
                        },
                        redo: function () {
                            this.load("source").putImageData(this.load("redo"), 0, 0);
                            if (this.load("redo-cb")) this.load("redo-cb")();
                        },
                        label
                    });
                    nst.save("source", destination);
                    nst.save("undo", undo);
                    nst.save("redo", redo);
                    if (typeof undoCb === "function") nst.save("undo-cb", undoCb);
                    if (typeof redoCb === "function") nst.save("redo-cb", redoCb);
                    return nst;
                },
                kill: function () {
                    if (!(this instanceof Unro))
                        throw new Error(`UnroJs Error\n".kill" function is only callable from within Unro class`);
                    redo =
                        undo =
                        label =
                        destination = undefined;
                    // now we can re-use the make over and over again!
                }
            }
        }

        this.#maker = maker();
    }


    get lastAction() {
        return this.#last;
    }

    get isFirstStack() {
        return this.#allundone === true;
    }

    get isLastStack() {
        return this.#alldone === true;
    }

    /**
     * Push new stack/state into the stacks list, and directly execute unless
     * you set `dontExecute` as true.
     * @method Unro#push
     * @param {StackDef|(mk: Maker)=>} stackdef
     * @param {Object} params
     * @returns {number} the current state index
     */
    push(stackdef, params) {
        if (!stackdef ||
            (stackdef.toString() !== '[object Object]' &&
                !['string', 'function'].includes(typeof stackdef))) return;

        if (typeof stackdef === "string") {
            let hnd = this.#defined.find(a => a.label === stackdef);
            if (hnd)
                stackdef = {
                    undo: function () {
                        hnd.undo(params);
                    },
                    redo: function () {
                        hnd.redo(params);
                    }
                }
            else return;
        }
        let stack;
        if (typeof stackdef === "function") {
            stackdef(this.#maker);
            stack = this.#maker.process.call(this);
            this.#maker.kill.call(this); // reset for an other use later 
        } else if (typeof stackdef.undo != "function" || typeof stackdef.redo != "function")
            throw new Error(`[UnroJS] wrong stack defintion in .push, a stack must have undo & redo or init functions`);
        else stack = new Stack(stackdef);

        // let's prepare the stack state storage
        let oldIndex = this.current;

        if (this.algo === 'lineare')
            this.current = this.#stack.push(stack) - 1;
        else if (this.algo === 'clearpath') {
            if (this.#stack[oldIndex + 1] !== undefined)
                this.#stack.splice(oldIndex + 1, this.#stack.length);
            this.current = this.#stack.push(stack) - 1;
        } else if (this.algo === 'insertion') {
            this.current = this.#stack.insert(stack, oldIndex + 1);
        }

        // respect maximum term
        if (this.#stack.length > this.maximum) {
            this.#stack.shift();
            this.current = oldIndex;
        }

        this.#allundone = false; // we just add a new stack so continue
        return this.current;
    }
    /**
     * Undo the last change or state/stack
     * @method Unro#undo
     * @returns {Unro}
     */
    undo() {
        if (this.#allundone) return;
        // executing
        this.#last = "undo";
        this.#stack[this.current].undo(this);
        // decreasing
        if (this.current > -2)
            this.current--;
        if (this.current < 0)
            return this.#allundone = true;

        this.#alldone = false;
        return this;
    }
    /**
     * Redo the last change or state/stack
     * @method Unro#redo
     * @returns {Unro}
     */
    redo() {
        // increasing
        if (this.#stack[this.current + 1])
            this.current++;
        else return this.#alldone = true;

        // executing
        this.#stack[this.current].redo(this);
        this.#last = "redo";
        this.#allundone = false;
        return this;
    }
    /**
     * Expand the stack maximum length
     * @method Unro#expand
     * @param {number} value
     * @returns {Unro}
     */
    expand(value) {
        this.maximum = typeof value == "number" ? value : this.maximum;
        return this
    }
    /**
     * Clear/reset the stack content
     * @method Unro#free
     * @returns {Unro}
     */
    free() {
        this.#stack = [];
        this.current = 0;
        return this
    }
    /**
     * Move to a specified stack, the function will execute all stack up to 
     * the one requested, and return either the stack or:
     *  - `out-of-range`: when requested stack index doesn't exists
     *  - `current`: if requested stack is the current one
     * @method Unro#moveTo
     * @param {number} i 
     * @returns {string} the wanted stack content or the string `out-of-rang`
     */
    moveTo(i) {
        if (i === this.current) return 'current';
        if (this.#stack[i]) {
            // you can't just jump from age 20 to 55
            // you must go through all between
            // the same happens here
            if (i > this.current)
                for (let j = this.current + 1; j <= i; j++) {
                    this.current = j; // required for state functionality
                    this.#stack[j].redo(this); // redoing the stack
                }
            else
                for (let j = this.current; j >= i; j--) {
                    this.current = j; // required for state functionality
                    this.#stack[j].undo(this); // undoing the stack
                }

            this.current = i;
            return this.#stack[i];
        } else return 'out-of-range';
    }
    /**
     * Change the `algo` property value, available options are:
     *  - `clearpath` : once you undo and push new stack the forward stacks will be removed.
     *  - `insertion` : once you undo and push new stack the new one will be inserted in front of the forward stacks.
     *  - `lineare` : once you push new stack it will be always added to the end of the stacks list.
     * @method Unro#setAlgorithme
     * @param {string} algo 
     * @returns {boolean}
     */
    setAlgorithme(algo) {
        if (algos.includes(algo)) {
            this.algo = algo;
            return true
        }
        return false
    }

    /**
     * Creates a JSON stack action string 
     * @method Unro#exportStackActions
     * @returns {string}
     */
    exportStackActions() {
        let stacks = [];
        this.#stack.forEach(stk => stacks.push({ action: stk.label, date: stk.date }));
        return JSON.stringify({ stacks });
    }

    /**
     * Acquire a shortcut library functionality such as qway.js, binding certain pattern as follow:
     *  - `a`: ctrl+z => undo ctrl+y => redo
     *  - `b`: ctrl+z => undo ctrl+shift+z => redo
     * @method Unro#integrate
     * @param {Object} accelLib 
     * @param {"a" | "b"} pattern 
     */
    acquire(accelLib, pattern) {
        if (accelLib.bind) {
            let _this = this;
            let undo = 'ctrl+w',
                redo = 'ctrl+y';
            if (pattern == "b") {
                undo = 'ctrl+w';
                redo = 'ctrl+shift+y';
            }

            accelLib.bind(undo, function () {
                _this.undo();
            })
            accelLib.bind(redo, function () {
                _this.redo();
            })
        }
        return this
    }


    /**
     * Define a labeled re-usable stack action handler
     * @param {{ label: string, undo: (params: Object) =>, redo: (params: Object) => }} handler 
     */
    defineHandler(handler) {
        if (handler.toString() === "[object Object]" && typeof handler.label === "string" && typeof handler.undo === "function" && typeof handler.redo === "function")
            this.#defined.push(handler);
        else throw new Error(`UnroJs Error\n trying to use ".defineHandler" function with wrong parameter type or structure!`);
    }

    /**
     * Remove handler with given `name` and return a boolean of whether deletion was successful or not
     * @param {string} name 
     * @returns {boolean}
     */
    removeHandler(name) {
        if (typeof name === "string") {
            let idx = this.#defined.findIndex(a => a.label === name);
            if (idx != -1) {
                this.#defined.splice(idx, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Check whether handler with given `name`/label exists or not
     * @param {string} name 
     * @returns {boolean}
     */
    hasHandler(name) {
        return this.#defined.findIndex(a => a.label === name) != -1;
    }

    /**
     * The length of the current stack
     * @type {number}
     */
    get len() {
        return this.#stack.length;
    }
}

class Stack {
    #undo = dfn;
    #redo = dfn;
    #attrs = {};
    #id = ++counter;

    /**
     * 
     * @param {StackDef} def 
     */
    constructor(def) {
        this.#undo = def.undo;
        this.#redo = def.redo;
        this.date = new Date();
        this.label = def.label;
    }

    get undo() {
        return this.#undo;
    }

    get redo() {
        return this.#redo;
    }

    get id() {
        return this.#id
    }

    save(key, value) {
        if (typeof key === "string" && value != undefined)
            this.#attrs[key] = value;
    }
    load(key) {
        return key ? this.#attrs[key] : { ...this.#attrs };
    }
}


function unro() {
    return new Unro();
}

window.unro = unro;
export default unro;