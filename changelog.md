# Changelog

## [3.3.0] - 2025-10-10

### Added

 - introducing pre-defined handlers, a RAM friendly handlers that execute the same undo/redo functions of the stack with different parameters for each stack.
 - new `.defineHandler` function to add a new handler 
 - new `.removeHandler` function to remove a new handler 
 - new `.hasHandler` function to check whether handler with given name exists or not
  
## [3.2.3] - 2025-08-22

### Fixed

 - when undo to 0 then redo the second stack is missed, passed to the next, Fixed!

## [3.2.2] - 2025-08-20

### Added

 - `renderer2D` may take OffscreenCanvasRenderingContext2d

## [3.2.1] - 2025-08-03

### Fixed

 - undo/redo keeps repeating for the last/first stack infinitely, Fixed

### Added

 - added two attribute `.isFirstStack` and `.isLastStack` to check whether current stack is the first or the last. 

## [3.2.0] - 2025-07-16

### Added

- new `lastAction` attribute that contains either `undo` or `redo` depending on the last performed action

### Fixed

- double required undo or redo when reversing the process, Fixed!

## [3.1.0] - 2025-07-15

### Changed

- when `.push`ing a new canvas stack, you can defined `unro` `redo` function that will run right after the auto created calls.

### Added

- new `len` attribute that returns the stack length

### Fixed

- `.push` function not working, Fixed.
- `moveTo` not working properly, Fixed.
- error `Failed to execute...` fixed.
- fixed `.acquire` set undo to ctrl+w instead of ctrl+z as supposed to.
- undo and redo stability improved, skip first and last stack fixed.

## [3.0.0] - 2025-07-15

### Changed

- auto instantiate the Unro class
- function `.freeUp` renamed to `.free`

### Added

- new `acquire` function to auto require a accelerator library functionalities

## [2.0.0] - 2025-07-15

### Changed

- library is now written ES6 class style.
- stacks are now are self defined instances.
- `.save` `.load` now belongs to stacks not `Unro`
- `.push` auto-execute not much helpfull so it was removed

### Added

- new feature "**canvas stacking**" to support canvas snapshots stacking
- new `.init` to auto prepare canvas stacking
- new attribute `renderer2D` to define canvas stacking source
- new `.copy` function to use within `.init` to defined a stack action (`undo` or `redo`), learn more in the readme.md.
- new `.paste` function to use in the canvas stacking

### Fixed

- error(undefined 'elm') when executing .push function fixed

## [1.2.0] - 2025-07-13

### Added

- new `.exportStackActions` function to export actions data in JSON format
- added two fields in Stack configurations `.date` and optional `.label`

## [1.1.0] - 2025-07-10

## Interducing States

States are local data, attached to each stack, you can access them from within the stack `.undo` and `.redo` to get fresh data.

### Added

- new `.save` function to store data
- new `.load` function to retrieve data

### Changed

- `.push` now execute the stack right away, unless you passed `dontExecute` as true.

### Fixed

- `undefined` function `.insert` when calling `.push` using insertion algorithme.
- keep `undo` the very first stack forever! now once as all the other stack.
- keep `redo` the very last stack forever! now once as all the other stack.
