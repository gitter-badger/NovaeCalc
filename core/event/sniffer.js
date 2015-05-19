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
   * Check if user is in edit mode
   *
   * @method inEditMode
   * @static
   */
  CORE.Event.inEditMode = function() {

    /** Check if user edits a cell, if yes, sniff for input stream */
    if (CORE.Input.Mouse.Edit) {
      /** User edits a valid cell */
      if (CORE.Cells.Edit) {
        /** Check if edited cell got successfully registered inside the cell edit stack */
        if (CORE.Cells.Used[CORE.Cells.Edit]) return (true);
      }
    }

    return (false);

  };

  /**
   * Check if user pressed a arrow key
   *
   * @method pressedArrowKey
   * @static
   */
  CORE.Event.pressedArrowKey = function(keyCode) {

    /** Check if user pressed an arrow key */
    if ([37, 38, 39, 40].indexOf(keyCode) >= 0) return (true);
    return (false);

  };

  /**
   * Check if user pressed the enter key
   *
   * @method pressedEnter
   * @static
   */
  CORE.Event.pressedEnter = function(keyCode) {

    /** User finished cell edit and pressed [ENTER] */
    if (keyCode === 13) {
      /** User is in edit mode? */
      if (CORE.Event.inEditMode()) {
        CORE.Grid.cleanEditSelection();
        CORE.Selector.getSelection();
        /** Run the interpreter */
        CORE.eval();
      }
      return (true);
    }

    return (false);

  };

  /**
   * Check if user edits a cell, if yes update its content
   *
   * @method sniffCellInput
   * @static
   */
  CORE.Event.sniffCellInput = function(keyCode) {

    var jumps = 0;

    /** User is in edit mode? */
    if (CORE.Event.inEditMode()) {
      /** Go to the end of a cell text if edit first time */
      CORE.Selector.cellFocusSwitch = false;
      /** Get cell content and pass it into the cell edit cell stack */
      jumps = CORE.$.getCell(CORE.Cells.Edit);
      if (jumps >= 0) CORE.Cells.Used[CORE.Cells.Edit].Content = CORE.DOM.CellInput.value;
    }

    /** Check if user pressed [ENTER] */
    if (!CORE.Event.pressedEnter(keyCode)) {
      /** User pressed another key then [ENTER] */

      /** Fetch the current selected cell */
      CORE.Grid.cleanEditSelection();
      CORE.Grid.getEditSelection(CORE.Selector.Selected.First.Letter + CORE.Selector.Selected.First.Number);

      /** Async input processing */
      this.processCellContent();

    /** User pressed enter */
    } else {
      CORE.eval();
      CORE.Grid.getEditSelection(CORE.Selector.Selected.First.Letter + CORE.Selector.Selected.First.Number);
      CORE.Grid.cleanEditSelection();
      /** Take selection and move it 1 down */
      CORE.Selector.moveSelectionDown(1);
      CORE.DOM.CellInput.blur();
    }

  };

  /**
   * Check if cell content is a formula
   *
   * @method isFormula
   * @static
   */
  CORE.Event.isFormula = function() {

    /** User is in edit mode? */
    if (CORE.Event.inEditMode()) {
      var cellEditContent = CORE.Cells.Used[CORE.Cells.Edit].Content;
      /** Check if cell is filled and valid */
      if (cellEditContent && cellEditContent.length) {
        /** Cell starts with a "=" and will be interpreted as a formula */
        if (cellEditContent[0] === "=") {
          CORE.Cells.Used[CORE.Cells.Edit].Formula = cellEditContent;
        /** Cell has no formula anymore */
        } else {
          /** Clean the cell formula if it has content */
          if (CORE.Cells.Used[CORE.Cells.Edit].Formula && CORE.Cells.Used[CORE.Cells.Edit].Formula.length) {
            CORE.Cells.Used[CORE.Cells.Edit].Formula = null;
          }
          /** Check if cell has content, if yes pass it over to the interpreter stack */
          if (CORE.Cells.Used[CORE.Cells.Edit].Content && CORE.Cells.Used[CORE.Cells.Edit].Content.length) {
            /** Update the cell stacks content */
            CORE.updateCell(CORE.Cells.Edit, CORE.Cells.Used[CORE.Cells.Edit].Content);
          }
        }
      }
    }

  };

  /**
   * Take value of input cell and pass it into the accordingly cell
   *
   * @method processCellContent
   * @static
   */
  CORE.Event.processCellContent = function() {

    var element = null,
        jumps = 0;

    /** Focus the cell input field on start typing */
    CORE.DOM.CellInput.focus();

    setTimeout(function() {
      jumps = CORE.$.getCell(CORE.Selector.Selected.First.Letter + CORE.Selector.Selected.First.Number);
      if (jumps >= 0) element = CORE.DOM.Output.children[jumps];
      /** Update cell used stack value with cell input fields value */
      if (CORE.Cells.Used[CORE.Cells.Edit]) CORE.Cells.Used[CORE.Cells.Edit].Content = CORE.DOM.CellInput.value;
      /** Cell is not in view, register it anyway */
      else CORE.registerCell(CORE.Cells.Edit);
      /** Update cell content with cell used stack value */
      if (element) element.innerHTML = CORE.Cells.Used[CORE.Cells.Edit].Content;
      /** Check if cell is a formula */
      CORE.Event.isFormula();
      /** Move cursor to end of cell content text */
      if (CORE.Cells.Used[CORE.Cells.Edit] && CORE.Cells.Used[CORE.Cells.Edit].Content && CORE.Selector.cellFocusSwitch) CORE.Grid.goToEndOfCellText();
      CORE.Selector.cellFocusSwitch = true;
      /** Focus the cell input field while typing */
      CORE.DOM.CellInput.focus();
    }, 1);

  };

}).call(this);