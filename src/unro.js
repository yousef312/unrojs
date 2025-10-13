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
 * @property {function} init called to auto create a stack
 * @property {CanvasRenderingContext2D} renderer2D attach a ctx to activate the canvas copy/paste feature
 * @property {string} label helps identifiy the stack action
 * @property {Date} date the stack action date
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
     * @param {StackDef} stackdef
     * @param {Object} params
     * @returns {number} the current state index
     */
    push(stackdef, params) {
        if (!stackdef || (stackdef.toString() !== '[object Object]' && typeof stackdef != "string")) return;
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
        let stack = new Stack(stackdef);
        if (typeof stackdef.init === "function") {
            stackdef.init(stack);

            if (!stack.isReady) throw new Error(`[UnroJS] the .init function not well constructed`);
        } else if (typeof stackdef.undo != "function" || typeof stackdef.redo != "function")
            throw new Error(`[UnroJS] wrong stack defintion in .push, a stack must have undo & redo or init functions`);

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
    /**
     * Provider of render from/to canvas feature
     * @type {CanvasRenderingContext2D}
     */
    #renderer2D = null;
    /**
     * Canvas stack when using render from/to feature
     * @type {Array<CanvasRenderingContext2D>}
     */
    #ctxStack = null;
    #state = null;
    /**
     * Used for canvas copy/paste to check whether the stack is ready or not
     * @type {boolean}
     */
    #ready = false;
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
        if (def.renderer2D instanceof CanvasRenderingContext2D || def.renderer2D instanceof OffscreenCanvasRenderingContext2D) {
            this.#renderer2D = def.renderer2D;
            this.#ctxStack = [];
        }
    }

    get undo() {
        return this.#undo;
    }

    get redo() {
        return this.#redo;
    }

    get isReady() {
        return this.#ready;
    }

    get id() {
        return this.#id
    }

    save(data) {
        if (data != undefined)
            this.#state = data;
    }
    load() {
        return this.#state;
    }
    copy() {
        if (!this.#renderer2D)
            throw new Error(`[UnroJS] Define .renderer2D in order to use canvas copy/paste features.`);

        if (this.#ctxStack.length <= 2) {
            let ctx = new OffscreenCanvas(this.#renderer2D.canvas.width, this.#renderer2D.canvas.height).getContext('2d');
            ctx.drawImage(this.#renderer2D.canvas, 0, 0);
            this.#ctxStack.push(ctx);

            if (this.#ctxStack.length == 2) {
                this.#ready = true;
                // auto construct
                let oldUndo = this.#undo;
                let oldRedo = this.#redo;
                this.#undo = function () {
                    this.paste('undo');
                    if (typeof oldUndo === "function") oldUndo();
                }
                this.#redo = function () {
                    this.paste('redo');
                    if (typeof oldRedo === "function") oldRedo();
                }
            }
        }
    }

    paste(step) {
        if (!this.#renderer2D)
            throw new Error(`[UnroJS] Define .renderer2D in order to use canvas copy/paste features.`);

        // getting canvas stack
        let ctx = this.#ctxStack[[1, "undo"].includes(step) ? 0 : [2, "redo"].includes(step) ? 1 : -1];
        if (!ctx) throw new Error(`[UnroJS] Unknown "step" in .paste "${step}"`);
        // displaying it
        this.#renderer2D.clearRect(0, 0, this.#renderer2D.canvas.width, this.#renderer2D.canvas.height);
        this.#renderer2D.drawImage(ctx.canvas, 0, 0);
    }
}


function unro() {
    return new Unro();
}

window.unro = unro;
export default unro;