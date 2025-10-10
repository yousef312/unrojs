# Unro.js

Timeline your user action by integrating undo/redo functionalities in your app.

yeap that's me! [@yousef_neji](https://github.com/yousef312)

## How to?

Pretty simple!

```javascript
// EJS
import unro from "unro";

// CommonJS
const unro = require("unro");
```
### Changing some properties/settings of the feature

- **Creating an instance to use**

```javascript
let stack = unro();

```

- **Expand the size of the stack**

```JavaScript
stack.expand(30);
// now the stack is able to contain a thirteen stack and navigate through them
```

 - **Change the used algorithme, which could be:**
   - `clearpath` : once you undo and push new stack the forward stacks will be removed.
   - `insertion` : once you undo and push new stack the new one will be inserted in front of the forward stacks.
   - `lineare` : once you push new stack it will be always added to the end of the stacks list.

```JavaScript
stack.setAlgorithme('lineare');
```

 - **Pushing normal stack:**

```JavaScript

function removeItem(elm, parent){
    // creating a new stack
    stack.push({
        undo: () => parent.append(elm),
        redo: () => elm.remove()
    },/* true - to disable auto execute stack */);
    // the stack will auto execute unless you passed `true`
}

// using .save and .load 
let listOfFlowers = [];
function removeFlower(name){
    let i = listOfFlowers.findIndex(a => a == name );
    if(i != -1)
        stack.push({
            undo: function(){
                let [flower, idx] = this.load();
                arrInsert(listOfFlowers, flower, idx);
            },
            redo: function(){
                this.save([listOfFlowers.splice(i,1),i])
            }
        })
}
```
 - **Canvas Stacking:**

 this feature allows you to stack canvas content automating the `undo` `redo` calls.

```javascript
render(ctx){
    stack.push({
        // we first defined the canvas to take from/put to
        renderer2D: ctx,
        // those will run after the main paste action
        undo: function(){
            _this.app.renderer.render();
        },
        redo: function(){
            _this.app.renderer.render();
        },
        // now the init function that will auto define our "undo" and "redo" function at the background
        init: function (st) {
            st.copy(); // auto create the undo fn 
            ctx.fillRect(x0, y0, distX, distY);
            st.copy(); // auto create the redo fn 
        }
    });
}
```

- **handlers**

Introducing pre-defined handlers for stacks operations, this RAM-friendlyt functionality allows to write once the same repetitive call, and use multiple times as u want, the tweak is using different parameters each time.

```javascript
var list = [];
stack.defineHandler({
    label: "addToArray",
    undo: function(params){
        const { elm } = params;
        let idx = list.findIndex(a => a.name === elm.name );
        if(idx != -1) list.splice(idx,1);
    },
    redo: function(params){
        const { elm, idx } = params;
        list.splice(idx,0,elm); // a trick to insert element in an array
    }
})


buttonA.addEventListener('click',function(){
    let idx = list.push(elm) - 1;
    // --- usage ----
    stack.push("addToArray",{ elm, idx })
    // now you'll be having a functional undo/redo stack
})
```

- **the real magic**

`undo` `redo` ready for the job now, or you can also `moveTo` for quick navigation to certain stack.

```JavaScript

// to undo
stack.undo();

// to redo
stack.undo();

// to go to a specific stack
stack.moveTo(4);
// this functions `out-of-range` for uknown stack index
// or `current` if requested stack is current one 

// free stacks
stack.free();

// exports the stacks identified by their labels defined at the ".push" call!
stack.exportStackActions();
```

- **Acquiring [Qway](https://www.npmjs.com/package/qway) or other shortcut library**

- the `pattern`(second parameter) either accepts `a` or `b`:
   - `a`: ctrl+z => undo ctrl+y => redo
   - `b`: ctrl+z => undo ctrl+shift+z => redo

```javascript
stack.acquire(qway,pattern);
```