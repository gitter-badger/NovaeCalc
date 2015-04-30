/**
 * This file is part of the NovaeCalc project.
 *
 * It is permitted to use, redistribute and/or modify this software
 * under the terms of the MIT License
 *
 * @author Felix Maier <maier.felix96@gmail.com>
 * @copyright (c) 2015 Felix Maier, @felixmaier
 *
 * You may not change or remove these lines
 *
 */
(function() { "use strict"

  /**
   * Run the interpreter
   *
   * @method eval
   * @static
   */
  CORE.eval = function() {

    var cells = this.Cells.Used;

    var formulas = [];

    var result = 0;

    for (var ii in cells) {
      /** Cell has a formula */
      if (cells[ii].Formula && cells[ii].Formula.length) {
        formulas.push({
          name: ii,
          value: cells[ii].Formula.substr(0, 0) + ii + cells[ii].Formula.substr(0)
        });
      }
    }

    if (formulas && formulas.length) {
      for (var ii = 0; ii < formulas.length; ++ii) {
        result = ENGEL.interpret(formulas[ii].value).VAR[formulas[ii].name].value.value;
        CORE.DOM.Output.children[CORE.$.getCell(formulas[ii].name)].innerHTML = result;
        CORE.Cells.Used[formulas[ii].name].Content = result;
      }
    }

  };

  /**
   * Register a new cell into the stack
   *
   * @method registerCell
   * @static
   */
  CORE.registerCell = function() {

    /** Cell is not registered yet */
    if (!ENGEL.STACK.get(arguments[0])) {
      /** Register the cell */
      ENGEL.STACK.createVariable(arguments[0]);
      /** Update cell stack name, check if it was successfully registered */
      if (ENGEL.STACK.VAR[arguments[0]]) {
        /** Update the name */
        ENGEL.STACK.VAR[arguments[0]].name = arguments[0];
      } else throw new Error("Fatal Error, failed to register " + arguments[0] + "!");
    }

  };

  /**
   * Update a cell in the stack
   *
   * @method updateCell
   * @static
   */
  CORE.updateCell = function(name) {

    /** Cell was registered successfully */
    if (ENGEL.STACK.get(name)) {

      /** If value is numeric, check if its above zero */
      if (!isNaN(arguments[1])) if (arguments[1] <= 0) return void 0;

      /** Update the cell value */
      ENGEL.STACK.update(name, {
        raw: arguments[1],
        value: ENGEL.TypeMaster(arguments[1]).value,
        type: "number"
      });
    }

  };

}).call(this);