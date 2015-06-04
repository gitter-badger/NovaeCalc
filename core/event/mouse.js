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

"use strict";

  /**
   * Listen for mouse double clicks
   *
   * @method mouseDoubleClick
   * @static
   */
  CORE.Event.mouseDoubleClick = function (e) {

    /** Valid cell ? */
    if (e.target.parentNode.id === CORE.DOM.Output.id) {

      /** Get grid number and fix it */
      var attribute = e.target.getAttribute("name");

      /** Clean old double click selection */
      CORE.Grid.cleanEditSelection();

      CORE.Selector.cellFocusSwitch = false;

      CORE.Grid.getEditSelection(attribute);

    }

  };

  /**
   * Listen for mouse click
   *
   * @method mouseDown
   * @static
   */
  CORE.Event.mouseDown = function (e) {

    /** Only accept left click, prevent multiple mousedown event */
    if (e.button === 1 || /** Middle click */
        e.button === 2 || /** Right click */
        e.which  === 3 || /** Right click */
        e.which  === 2 || /** Middle click */
        CORE.Input.Mouse.Pressed) {
          e.preventDefault();
          return void 0;
        }

    /** Update empty timestamp */
    if (!this.lastMouseDown) this.lastMouseDown = e.timeStamp;

    /** Handle timestamps */
    if (this.lastMouseDown > 0) {

      /** Calculate difference between this and last timestamp */
      var difference = e.timeStamp - this.lastMouseDown;

      /** Max delay of 250 milliseconds */
      if (difference && difference <= 250) {
        if (e.target.parentNode.id === CORE.DOM.Output.id) {
          /** Prevent double mouse clicks between multiple cells */
          if (e.target.getAttribute("name") === this.lastMouseDownCell) {
            CORE.Event.mouseDoubleClick(e);
            return void 0;
          }
        }
      }

    }

    /** Cell formula input field clicked */
    if (e.target.id === "cell_input") {

      /** User selected a cell */
      if (CORE.Cells.Select.Letter && CORE.Cells.Select.Number) {
        CORE.eval();
        CORE.Grid.cleanEditSelection();
        CORE.Grid.getEditSelection(CORE.Cells.Select);
      }

      /** Dont loose selection */
      CORE.Selector.getSelection();

      return void 0;

    }

    /** Vertical menu clicked */
    if (e.target.parentNode.id === CORE.DOM.VerticalMenu.id) return void 0;

    /** Horizontal menu clicked */
    if (e.target.parentNode.id === CORE.DOM.HorizontalMenu.id) return void 0;

    /** Valid cell ? */
    if (e.target.parentNode.id === CORE.DOM.Output.id) {

      /** User aborted live cell edit */
      CORE.Input.Mouse.LiveCellEdit = false;

      /** User aborted master selection */
      CORE.Selector.masterSelected.Current = null;

      /** Hide live cell container */
      CORE.DOM.LiveCellContainer.style.display = "none";

      var name = e.target.getAttribute("name");
      var letter = CORE.$.alphaToNumber(name.match(CORE.REGEX.numbers).join(""));
      var number = ~~(name.match(CORE.REGEX.letters).join(""));

      var cellName = (CORE.$.numberToAlpha(letter)) + number;

      CORE.Event.lastMouseDownCell.Letter = letter;
      CORE.Event.lastMouseDownCell.Number = number;

      CORE.Cells.Select = CORE.Event.lastMouseDownCell;

        CORE.Cells.Selected.First = {
          Letter: letter,
          Number: number
        };

        CORE.Cells.Selected.Last = CORE.Cells.Selected.First;

        /** Update parent cell, so keypress only moving will work */
        CORE.Selector.parentSelectedCell = CORE.Cells.Selected.First;
        CORE.Grid.Settings.keyScrolledX = CORE.Grid.Settings.keyScrolledY = 0;

        /** Two selected cell coordinates */
        if (CORE.Cells.Selected.First.Letter &&
            CORE.Cells.Selected.First.Number &&
            CORE.Cells.Selected.Last.Letter &&
            CORE.Cells.Selected.Last.Number) {
          /** Only execute selection if user doesnt edit a cell at the moment */
          CORE.Selector.getSelection();
        }

        /** User edits a cell and clicked on another cell which was also edited */
        if ( CORE.Input.Mouse.Edit &&
             CORE.Cells.Edit !== CORE.Cells.Selected.First ||
             CORE.Cells.Edit !== CORE.Cells.Selected.Last  && 
             CORE.Cells.Selected.First === CORE.Cells.Selected.Last) {
          CORE.eval();
          CORE.Grid.cleanEditSelection();
        }

        /** Clean edited cells only if the current selected cell isn't edited */
        if (CORE.Cells.Used[CORE.$.numberToAlpha(letter)]) {
          if (!CORE.Cells.Used[CORE.$.numberToAlpha(letter)][cellName]) CORE.Grid.cleanEditSelection();
        }

    /** User selected another cell, delete edited cell */
    } else if (CORE.Input.Mouse.Edit) {
      /** User clicked inside the cell grid */
      if (e.target.parentNode.id === CORE.DOM.Output.id) {
        CORE.Grid.cleanEditSelection();
      /** User chose the dark space */
      } else {
        CORE.Selector.getSelection();
        CORE.Grid.getEditSelection(CORE.Cells.Edit);
      }
    }

    this.lastMouseDown = e.timeStamp;

    CORE.Input.Mouse.Pressed = true;

  };

  /** Listen for mouse release */
  CORE.Event.mouseUp = function (e) {
  
    CORE.Input.Mouse.Pressed = false;

    /** Clean Selected Cells */
    CORE.Cells.Selected.First = {
      Letter: CORE.Cells.Select.Letter,
      Number: CORE.Cells.Select.Number
    };

    /** User resized something */
    if (CORE.Input.Mouse.CellResize) {
      CORE.Grid.updateWidth();
      CORE.Grid.generateMenu();
      CORE.Selector.getSelection();
      CORE.Input.Mouse.CellResize = false;
    }

  };

  /**
   * Listen for mouse wipe
   *
   * @method mouseWipe
   * @static
   */
  CORE.Event.mouseWipe = function (e) {

    /** Dont execute mousemove event multiple times if position did not changed */
    if (CORE.Input.Mouse.lastMousePosition.x === e.pageX &&
        CORE.Input.Mouse.lastMousePosition.y === e.pageY) return void 0;

    /** User is wiping? */
    if (CORE.Input.Mouse.Pressed) {
      /** Valid cell ? */
      if (e.target.parentNode.id === CORE.DOM.Output.id) {

        var name = e.target.getAttribute("name");
        var letter = CORE.$.alphaToNumber(name.match(CORE.REGEX.numbers).join(""));
        var number = ~~(name.match(CORE.REGEX.letters).join(""));
        var cellName = (CORE.$.numberToAlpha(letter)) + number;

        /** Make sure the first property gets updated a maximum of 1 time per wipe */
        if (!CORE.Cells.Selected.First.Letter && !CORE.Cells.Selected.First.Number) {

          CORE.Cells.Selected.First = {
            Letter: letter,
            Number: number
          }

        }

        /** Calm Down, dont overwrite stack value with same value again */
        if ( (CORE.$.numberToAlpha(CORE.Cells.Selected.Last.Letter) + CORE.Cells.Selected.Last.Number) === cellName) return void 0;

        CORE.Cells.Selected.Last = {
          Letter: letter,
          Number: number
        }

        /** Two selected cell coordinates */
        if (CORE.Cells.Selected.First.Letter &&
            CORE.Cells.Selected.First.Number &&
            CORE.Cells.Selected.Last.Letter &&
            CORE.Cells.Selected.Last.Number) {
          /** Cell was never edited */
          if (!CORE.Cells.Used[CORE.$.numberToAlpha(letter)]) CORE.Selector.getSelection();
          else if (!CORE.Cells.Used[CORE.$.numberToAlpha(letter)][cellName]) CORE.Selector.getSelection();
          /** Cell is in edited state */
          else {
            CORE.Grid.cleanEditSelection();
            CORE.Selector.getSelection();
          }
        }

        /** Clean edited cells only if the current selected cell isn't edited */
        if (CORE.Cells.Used[CORE.$.numberToAlpha(letter)]) {
          if (CORE.Cells.Used[CORE.$.numberToAlpha(letter)][cellName]) CORE.Grid.cleanEditSelection();
        }

      }

    }

    /** Update mouse position */
    CORE.Input.Mouse.lastMousePosition.x = e.pageX;
    CORE.Input.Mouse.lastMousePosition.y = e.pageY;

  };

  /**
   * Listen for grid scrolling
   *
   * @method scroll
   * @static
   */
  CORE.Event.scroll = function(e) {

    /** Update empty timestamp */
    if (!this.lastMouseScroll) this.lastMouseScroll = e.timeStamp;

    /** Abort if [STRG] key pressed */
    if (CORE.Input.Keyboard.Strg) return void 0;

    var calcDifference = Math.floor(CORE.Grid.Settings.y * 1.5);

    /** Handle timestamps */
    if (this.lastMouseScroll > 0) {

       /** Calculate difference between this and last timestamp */
      var difference = e.timeStamp - this.lastMouseScroll;

      /** Scroll increment, if user scrolls fast */
      if (difference <= calcDifference) {
        CORE.Settings.Scroll.Vertical += Math.floor(CORE.Settings.Scroll.OriginalVertical * 1.5);
      /** Otherwise, reset scroll amount */
      } else {
        CORE.Settings.Scroll.Vertical = CORE.Settings.Scroll.OriginalVertical;
      }

    }

    var direction = 0;

    /** Make sure the grid was scrolled */
    if (e.target.parentNode.id === CORE.DOM.Output.id) {
      /** IE */
      if (e.wheelDelta) {
        if (e.wheelDelta * ( -120 ) > 0) direction = 1;
      /** Chrome, Firefox */
      } else {
        /** Chrome */
        if (e.deltaY > 0) {
          direction = 1;
        /** Firefox */
        } else if (e.detail * ( -120 ) > 0) {
          direction = 0;
        /** Firefox */
        } else if (e.detail * ( -120 ) < 0) {
          direction = 1;
        } else direction = 0;
      }

      direction = direction ? "down" : "up";

      /** User scrolled up or down, dont redraw */
      CORE.Event.lastAction.scrollY = true;

      if (direction === "down") {
        CORE.Grid.Settings.scrolledY += CORE.Settings.Scroll.Vertical;
        CORE.Grid.Settings.lastScrollY = CORE.Settings.Scroll.Vertical;

        /** Animate */
        if (difference > calcDifference * 2) {
          CORE.DOM.Output.classList.remove("moveDown");
          CORE.DOM.VerticalMenu.classList.remove("moveDown");
          CORE.DOM.Output.classList.remove("moveUp");
          CORE.DOM.VerticalMenu.classList.remove("moveUp");
          setTimeout( function() {
            CORE.DOM.Output.classList.add("moveUp");
            CORE.DOM.VerticalMenu.classList.add("moveUp");
          }, 55);
        }

        CORE.Grid.updateHeight("down", CORE.Settings.Scroll.Vertical);
      }
      else if (direction === "up") {
        if (CORE.Grid.Settings.scrolledY - CORE.Settings.Scroll.Vertical <= 0) {
          CORE.Grid.Settings.scrolledY = 0;
          CORE.Grid.Settings.lastScrollY = 0;
          CORE.Grid.updateHeight("default", CORE.Settings.Scroll.Vertical);

          /** Animate */
          CORE.DOM.Output.classList.remove("moveDown");
          CORE.DOM.VerticalMenu.classList.remove("moveDown");
          CORE.DOM.Output.classList.remove("moveUp");
          CORE.DOM.VerticalMenu.classList.remove("moveUp");
          CORE.DOM.Output.style.top = "0px";
          CORE.DOM.VerticalMenu.style.top = "100px";

        }
        else if (CORE.Grid.Settings.scrolledY - CORE.Settings.Scroll.Vertical >= 0) {
          CORE.Grid.Settings.scrolledY -= CORE.Settings.Scroll.Vertical;
          CORE.Grid.Settings.lastScrollY = CORE.Settings.Scroll.Vertical;
          CORE.Grid.updateHeight("up", CORE.Settings.Scroll.Vertical);

          /** Animate */
          if (difference > calcDifference * 2) {
            CORE.DOM.Output.classList.remove("moveDown");
            CORE.DOM.VerticalMenu.classList.remove("moveDown");
            CORE.DOM.Output.classList.remove("moveUp");
            CORE.DOM.VerticalMenu.classList.remove("moveUp");
            setTimeout( function() {
              CORE.DOM.Output.classList.add("moveDown");
              CORE.DOM.VerticalMenu.classList.add("moveDown");
              CORE.DOM.Output.style.top = "-25px";
              CORE.DOM.VerticalMenu.style.top = "75px";
            }, 1);
          }

        }

      }

      /** Make sure user scrolled */
      if (direction) {
        /** Update menu, get new selection */
        CORE.Grid.updateMenu();
        CORE.Selector.getSelection();

        /** Simulate mouse move to display the scrolled selection */
        CORE.Input.Mouse.lastMousePosition.x = Math.random();
        CORE.Input.Mouse.lastMousePosition.y = Math.random();
        CORE.Event.mouseWipe(e);
      }

      this.lastMouseScroll = e.timeStamp;

    }

  };