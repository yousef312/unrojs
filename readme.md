# Unro.js

Timeline your user action by integrating undo/redo functionalities in your app.

yeap that's me! [@yousef_neji](https://github.com/yousef312)

## How to?

Pretty simple!

```javascript
// EJS
import Unro from "unro";

// CommonJS
const Unro = require("unro");
```

And use..

```JavaScript
var max = 20; // stack counts
var algo = 'clearpath'; // stack algorithme

// intiate
var stack = new Unro(max,algo);

// max is the maximum cells for the stack
// default is 20 and you can expand it later
// using the method .expand

// algo is the algorithme used when pushing new stacks or the stacking method which goes like that:
// - clearpath: once you undo and push new stack the forward stacks will be removed.
// - insertion: once you undo and push new stack the new one will be inserted in front of the forward stacks.
// - lineare: once you push new stack it will be always added to the end of the stacks list.
```

You push new stack/state using the `push` method like so

```JavaScript

function removeItem(elm, parent){
    // pushing a simple stack
    elm.remove()
    stack.push({
        undo: () => parent.append(elm),
        redo: () => elm.remove()
    });
}
```

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
```

Expand the size of the stack

```JavaScript
stack.expand(30);
// now the stack is able to contain a thirteen stack and navigate through them
```

Empty/reset the stack

```JavaScript
stack.freeUp();
// now the stack array is empty
```

Change the used algorithme, which could be:
 - `clearpath` : once you undo and push new stack the forward stacks will be removed.
 - `insertion` : once you undo and push new stack the new one will be inserted in front of the forward stacks.
 - `lineare` : once you push new stack it will be always added to the end of the stacks list.

```JavaScript
stack.setAlgorithme('lineare');
```
