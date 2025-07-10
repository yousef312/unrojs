# Changelog

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