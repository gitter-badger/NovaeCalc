/**
 * This file is part of the NovaeCalc project.
 *
 * It is permitted to use, redistribute and/or modify this software
 * under the terms of the BSD License
 *
 * @author Felix Maier <maier.felix96@gmail.com>
 * @copyright (c) 2015 Felix Maier, @felixmaier
 *
 * You may not change or remove these lines
 *
 */

"use strict";

  /** Create Functions Object */
  CORE.$ = {};

  /**
   * Initialise everything
   *
   * @method init
   * @static
   */
  CORE.$.init = function() {

    /** Mobile device check */
    CORE.$.isMobile();

    /** Calculate scroll amount */
    CORE.Settings.Scroll.OriginalVertical = CORE.Settings.Scroll.Vertical = CORE.$.calculateScrollAmount();

    /** Fastclick if we're on mobile */
    if (CORE.Settings.Mobile) FastClick.attach(document.body);

    /** Initialize Connector Plugin */
    CORE.Connector = new CORE.Connector();

    /** Initialize File Plugin */
    CORE.File = new CORE.File();

    /** Initialize Awakener Plugin */
    CORE.Awakener = new CORE.Awakener();

    /** Initialize Sheet Plugin */
    CORE.Sheets = new CORE.Sheets();

    /** Add a new first sheet */
    CORE.Sheets.addSheet();

    /** Switch to the first sheet */
    CORE.Sheets.changeSheet(CORE.CurrentSheet);

		/** Initialize all event listeners */
    CORE.Event.init();

    /** Initialize Selector Plugin for this sheet */
    CORE.Sheets[CORE.CurrentSheet].Selector = new CORE.Selector();

    /** Initialize Injector Plugin */
    CORE.Injector = new CORE.Injector();

    /** Define first cell in grid as parent cell */
    CORE.Sheets[CORE.CurrentSheet].Selector.parentSelectedCell = {
      Letter: 1,
      Number: 1
    };

    /** Select major first cell in the grid */
    CORE.Sheets[CORE.CurrentSheet].Selector.selectCell(1, 1);

    /** Try to connect */
    if (CORE.Connector.getURL()) CORE.Connector.connect();

  };

  /**
   * Check if we're on a mobile device
   *
   * @method mobileDeviceCheck
   * @static
   */
  CORE.$.isMobile = function() {
    if (/iPhone|iPad|iPod|Android|Mobile/i.test(navigator.userAgent)) CORE.Settings.Mobile = true;
  };

  /**
   * Calculate a fine scroll amount
   *
   * @method calculateScrollAmount
   * @static
   */
  CORE.$.calculateScrollAmount = function() { 
    return (Math.floor((Math.pow(CORE.Settings.Height, Math.floor(Math.log(CORE.Settings.Height) / Math.log(CORE.Settings.Height))) / 100) / 4));
  };

  /**
   * Number to alphabetical letter conversion
   *
   * @method numberToAlpha
   * @static
   */
  CORE.$.numberToAlpha = function(number) {

    /** Charcode for a */
    var a = 65;

    /** Alphabet length */
    var length = 26;

    /** Final letter */
    var letter = 0;

    /** Calculation */
    var newNumber = 0;

    /** Get modulo */
    letter = (a + (number - 1) % length);

    /** Auto validation */
    letter = letter <= a ? String.fromCharCode(a) : String.fromCharCode(letter);

    /** Get letter length */
    newNumber = parseInt((number - 1) / length);

    /** Recurse to get the following letters */
    if (newNumber > 0) return (CORE.$.numberToAlpha(newNumber) + letter);

    return (letter);

  };

  /**
   * Alphabetical letter to number conversion
   *
   * TODO: Support > 702 =^ ZZ
   *
   * @method alphaToNumber
   * @static
   */
  CORE.$.alphaToNumber = function(letter) {

    if (!isNaN(letter)) return void 0;

    /** Charcode for a */
    var a = 65;

    /** Alphabet length */
    var length = 26;

    /** Calculation */
    var newNumber = 0;

    /** Convert letter into number */
    var number = letter.charCodeAt(0);

    /** Auto validation */
    number = number <= a ? 1 : (number % a + 1);

    /** Get number value */
    newNumber = parseInt((number - 1) * length);

    newNumber += (length);

    if (letter = letter.substr(1, letter.length)) return (CORE.$.alphaToNumber(letter) + newNumber);

    return (number);

  };

  /**
   * Get a specific cell
   *
   * @method getCell
   * @static
   */
  CORE.$.getCell = function(object) {

    var letter = object.letter,
        number = object.number,
        jumps = ((CORE.Sheets[CORE.CurrentSheet].Settings.y * (letter - 1) ) + number - 1 - CORE.Sheets[CORE.CurrentSheet].Settings.scrolledY) - (CORE.Sheets[CORE.CurrentSheet].Settings.y * CORE.Sheets[CORE.CurrentSheet].Settings.scrolledX);

    if (CORE.$.isInView(letter, jumps) && CORE.DOM.Output.children[jumps]) return (jumps);

    return void 0;

  };

  /**
   * Check if a cell is in its correct row
   *
   * @method isInView
   * @static
   */
  CORE.$.isInView = function(letter, jumps) {

    var row = letter;
        row = row <= 1 ? 1 : row;

    if (jumps < ( (letter * CORE.Sheets[CORE.CurrentSheet].Settings.y) - CORE.Sheets[CORE.CurrentSheet].Settings.y) - (CORE.Sheets[CORE.CurrentSheet].Settings.y * CORE.Sheets[CORE.CurrentSheet].Settings.scrolledX) ) return (false);
    else if (jumps >= (letter * CORE.Sheets[CORE.CurrentSheet].Settings.y) - (CORE.Sheets[CORE.CurrentSheet].Settings.y * CORE.Sheets[CORE.CurrentSheet].Settings.scrolledX) ) return (false);
    return (true);

  };

  /**
   * Check if a cell is selected
   * If not, register it into the cell used stack
   *
   * @method validCell
   * @static
   */
  CORE.$.validCell = function() {

    /** Check if a cell is selected */
    if (CORE.Sheets[CORE.CurrentSheet].Selector.Selected.First.Letter && (CORE.Sheets[CORE.CurrentSheet].Selector.Selected.First.Number >= 0) ) {

      var letter = CORE.Sheets[CORE.CurrentSheet].Selector.Selected.First.Letter,
          number = CORE.Sheets[CORE.CurrentSheet].Selector.Selected.First.Number;

      /** Valid cell selection */
      if (letter && number > 0) {
        /** Cell is not used yet */
        CORE.$.registerCell({ letter: letter, number: number });
        /** Cell was successfully registered ? */
        if (CORE.Cells.Used[CORE.CurrentSheet][letter][letter + number]) return (true);
      }

    }

    return (false);

  };

  /**
   * Check if multiple cells was selected and each is valid
   * If not, register each into the cell used stack
   *
   * @method validateCells
   * @static
   */
  CORE.$.validateCells = function() {

    /** Loop through all selected cells */
    for (var ii = 0; ii < CORE.Sheets[CORE.CurrentSheet].Selector.SelectedCells.length; ++ii) {
      var letter = CORE.$.numberToAlpha(CORE.Sheets[CORE.CurrentSheet].Selector.SelectedCells[ii].letter);
      var number = CORE.Sheets[CORE.CurrentSheet].Selector.SelectedCells[ii].number;
      CORE.$.registerCell({ letter: letter, number: number });
    }

  };

  /**
   * Register a used cell
   *
   * @method registerCell
   * @static
   */
  CORE.$.registerCell = function(object) {

    var letter = object.letter;
    var number = object.number;
    var name = letter + number;

    if (CORE.Cells.Used[CORE.CurrentSheet][letter]) {
      if (!CORE.Cells.Used[CORE.CurrentSheet][letter][name]) {
        CORE.Cells.Used[CORE.CurrentSheet][letter][name] = new CORE.Sheets[CORE.CurrentSheet].Cell();
      }
    } else {
      CORE.Cells.Used[CORE.CurrentSheet][letter] = {};
      CORE.Cells.Used[CORE.CurrentSheet][letter][name] = new CORE.Sheets[CORE.CurrentSheet].Cell();
    }

  };

  /**
   * Clear the selection of all texts in the document
   *
   * @method looseSelection
   * @static
   */
  CORE.$.looseSelection = function() {

    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {  // IE?
      document.selection.empty();
    }

  };

  /**
   * Select a specific text in the document
   *
   * @method selectText
   * @static
   */
  CORE.$.selectText = function(element) {

    var character = element.textContent.length, 
        select;

    if (document.selection) {
      select = document.selection.createRange();
      select.moveStart('character', character);
      select.select();
    } else {
      select = window.getSelection();
      select.collapse(element.firstChild, character);
    }

  };

  /**
   * Check if string is a json
   *
   * @method isJSON
   * @static
   */
  CORE.$.isJSON = function(string) {

    try {
      JSON.parse(string);
    } catch (e) {
      return (false);
    }

    return (true);

  };

  /**
   * Is number a safe integer
   *
   * @method isSafeInteger
   * @static
   */
  CORE.$.isSafeInteger = function(number) {

    if (number >= 9E15) {
      if (number >= window.Number.MAX_SAFE_INTEGER) return (Number.MAX_SAFE_INTEGER - 1);
    }

    return (number);

  };