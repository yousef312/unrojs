# Changelog

## [3.0.1] - 2025-07-04

### Added

 - added function `child` from previous version

## [3.0.1] - 2025-07-04

### Added

 - new `append` function with flexible `pos` to expand wide range of opportunities
 - new `replaceWith` function
 - new `parent` set/get function
 - new `is` to compare nodes with flexible `check`
 - new `each` to run multi selected elements
 - new `off` function to remove event listeners
 - new `trigger` function to ease controlling events
 - new `find` function to find sub elements with `multiple` wild card parameter
 - new `clone` function to clone current node
 - new `compute` function to get element computed style declaration or DOMRect box
 - new `pointer` function to unleash the PointerLock API and pointerCapture features 

### Changed

 - a better modern core wrapper.
 - library now support processing multiple selection at once.
 - `.on` function now support targeted callbacks for event delegation.
 - `.data` function no more use dataset, rather it uses RAM.
 - `.attr` support setting to dataset using data-...
 - main function `eye` now support multi selection with [optional] "!" at the end of the selector to perform first occurence only.

## [2.1.1] - 2025-07-01

**Breaking News!**

we've added a new feature in our little library!

### Added

 - introducing a new feature `model`, where you can create models and use them multiple times around your code, without having to create the whole shit over and over, similar to react components but with less muli-files headache(check out readme.md to more tutorial of how to use).

 - `class` attribute now can accept a string concatenation of classes beside an array of them, so instead of `eye("div",{ class: ["class1","class2"]})` you can do `eye("div",{ class: "class1 class2" })`.