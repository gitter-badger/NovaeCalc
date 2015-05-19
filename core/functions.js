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

  /** Create Functions Object */
  CORE.$ = {};

  /**
   * Initialise everything
   *
   * @method init
   * @static
   */
  CORE.$.init = function() {

    /** Generate the alphabet */
    CORE.$.generateAlphabet();

    /** Mobile device check */
    CORE.$.isMobile();

    /** Calculate scroll amount */
    CORE.Settings.Scroll.Vertical = CORE.$.calculateScrollAmount();

    /** Fastclick if we're on mobile */
    if (CORE.Settings.Mobile) FastClick.attach(document.body);

    /** Initialize File Plugin */
    CORE.File = new CORE.File();

    /** Initialize Awakener Plugin */
    CORE.Awakener = new CORE.Awakener();

    /** Initialize Grid Plugin */
    CORE.Grid = new CORE.Grid();

    /** Calculate Grid sizes */
    CORE.Grid.calculateGrid();

    /** Initialize Selector Plugin */
    CORE.Selector = new CORE.Selector();

    /** Initialize all event listeners */
    CORE.Event.init();

    /** Begin the magic */
    CORE.Event.resize();

    /** Define first cell in grid as parent cell */
    CORE.Selector.parentSelectedCell = "A1";

    /** Select major first cell in the grid */
    CORE.Selector.selectCell("A1");

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
    return (Math.floor((Math.pow(CORE.Settings.Height, Math.floor(Math.log(CORE.Settings.Height) / Math.log(CORE.Settings.Height))) / 100) / 2));
  };

  /**
   * Generate the alphabet
   *
   * @method generateAlphabet
   * @static
   */
  CORE.$.generateAlphabet = function() {
    for (var a = 65, z = 91; a < z; ++a) CORE.Alphabet.push(String.fromCharCode(a));
  };

  /**
   * Single letter to multiple letter conversion
   *
   * @method singleToMultipleLetter
   * @static
   */
  CORE.$.singleToMultipleLetter = function(letter, times) {

    var output = "";

    if (times === 1) output = letter + letter;
    else if (times > 1) for (var ii = 0; ii < times; ++ii) output += letter;
    else output = letter;

    return (output);

  };

  /**
   * Number to alphabetical letter conversion
   *
   * @method numberToAlpha
   * @static
   */
  CORE.$.numberToAlpha = function(integer) {

    /** Alphabetical start position fix */
    integer -= 1;

    /** Everything same or below zero is invalid and will be converted to A */
    if (integer <= 0) return (CORE.Alphabet[0]); 

    /** Default position in alphabet */
    if (CORE.Alphabet[integer]) return (CORE.Alphabet[integer]);

    /**
     * Higher alphabet position than 26
     * Catch modulo to get the alphabetical letter
     * Get length of number to calculate letter repeatment times
     */
    if (integer % 26 <= 26 && integer % 26 >= 0) {
      return (this.singleToMultipleLetter(CORE.Alphabet[integer % 26], Math.floor(integer / 26) + 1));
    }

  };

  /**
   * Alphabetical letter to number conversion
   *
   * @method alphaToNumber
   * @static
   */
  CORE.$.alphaToNumber = function(letter) {

    for (var ii = 0; ii < CORE.Alphabet.length; ++ii) {
      if (CORE.Alphabet[ii] === letter[0]) {
        /** Alphabetical start position fix */
        ii += 1;
        /** Detect multiple letters */
        if (letter.length > 1) {
          ii = ( (letter.length - 1) * CORE.Alphabet.length) + ii;
        }
        return (ii);
      }
    }

  };

  /**
   * Get a specific cell
   *
   * @method getCell
   * @static
   */
  CORE.$.getCell = function(name) {

    var letter = name.match(CORE.REGEX.numbers).join(""),
        number = parseInt(name.match(CORE.REGEX.letters).join("")),
        jumps = ((CORE.Grid.Settings.y * (CORE.$.alphaToNumber(letter) - 1) ) + number - 1 - CORE.Grid.Settings.scrolledY) - (CORE.Grid.Settings.y * CORE.Grid.Settings.scrolledX);

    if (CORE.DOM.Output.children[jumps] && CORE.$.isInView(letter, jumps)) return (jumps);
    else return void 0;

  };

  /**
   * Check if a cell is in its correct row
   *
   * @method isInView
   * @static
   */
  CORE.$.isInView = function(letter, jumps) {

    var row = CORE.$.alphaToNumber(letter);
        row = row <= 1 ? 1 : row;

    if (jumps < ( (CORE.$.alphaToNumber(letter) * CORE.Grid.Settings.y) - CORE.Grid.Settings.y ) - (CORE.Grid.Settings.y * CORE.Grid.Settings.scrolledX) ) return (false);
    else if (jumps >= (CORE.$.alphaToNumber(letter) * CORE.Grid.Settings.y) - (CORE.Grid.Settings.y * CORE.Grid.Settings.scrolledX) ) return (false);
    return (true);

  };

  /**
   * Update a specific cells content
   *
   * @method updateCell
   * @static
   */
  CORE.$.updateCell = function(name, content) {

    var letter = name.match(CORE.REGEX.numbers).join(""),
        number = parseInt(name.match(CORE.REGEX.letters).join("")),
        jumps = ((CORE.Grid.Settings.y * (CORE.$.alphaToNumber(letter) - 1) ) + number - 1 - CORE.Grid.Settings.scrolledY) - (CORE.Grid.Settings.y * CORE.Grid.Settings.scrolledX);

    /** Found the cell, replace its content */
    if (CORE.DOM.Output.children[jumps]) {
      CORE.DOM.Output.children[jumps].innerHTML = content;
    }

    return void 0;

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
    if (CORE.Selector.Selected.First.Letter && (CORE.Selector.Selected.First.Number >= 0) ) {

      var letter = CORE.Selector.Selected.First.Letter,
          number = CORE.Selector.Selected.First.Number;

      /** Valid cell selection */
      if (letter && number > 0) {
        /** Cell is not used yet */
        if (!CORE.Cells.Used[letter + number]) {
          CORE.Cells.Used[letter + number] = new CORE.Grid.Cell();
        }
        /** Cell was successfully registered ? */
        if (CORE.Cells.Used[letter + number]) return (true);
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
    for (var ii = 0; ii < CORE.Selector.SelectedCells.length; ++ii) {
      if (!CORE.Cells.Used[CORE.Selector.SelectedCells[ii]]) {
        CORE.Cells.Used[CORE.Selector.SelectedCells[ii]] = new CORE.Grid.Cell();
      }
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

}).call(this);