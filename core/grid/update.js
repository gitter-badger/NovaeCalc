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
   * Update the grid height
   *
   * @method updateHeight
   * @static
   */
  CORE.Grid.prototype.updateHeight = function(dir, scrollAmount) {

    var width = this.Settings.x,
        height = this.Settings.y,
        br = this.Settings.y,
        helper = 0,
        calculation = 0,
        customAlphaCell = this.customCellSizes.alphabetical,
        /** Total amount of shifting cell columns to left */
        totalLeftShift = 0,
        totalLeftShiftHelper = 0,
        lastLetter = null,
        /** Cell name attributes */
        Letter = null,
        Number = 0;

    /** Speed optimization, avoid using regular expressions */
    if (this.Settings.scrolledX <= 0) Letter = CORE.DOM.Output.children[0].getAttribute("name").match(CORE.REGEX.numbers).join("");
    else Letter = CORE.$.numberToAlpha(this.Settings.scrolledX + 1);

    for (var ii = 0; ii < width * height; ++ii) {

      /** Scroll Down */
      if (dir === "down") {
        Number = (this.Settings.scrolledY - scrollAmount) + 1;
        calculation = ( ( ii + scrollAmount ) - helper + Number);
      /** Scroll Up */
      } else if (dir === "up") {
        Number = (this.Settings.scrolledY + scrollAmount) + 1;
        calculation = ( ( ii - scrollAmount ) - helper + Number);
      /** Scroll to Default */
      } else {
        Number = 1;
        calculation = ( ( ii + this.Settings.scrolledY ) - helper + Number);
      }

      CORE.DOM.Output.children[ii].setAttribute("name", Letter + calculation);

      /** Check if cell has custom content */
      if (CORE.Cells.Used[Letter + calculation]) {
        CORE.DOM.Output.children[ii].innerHTML = CORE.Cells.Used[Letter + calculation].Content;
      } else {
        CORE.DOM.Output.children[ii].innerHTML = "";
      }

      this.resizeHorizontal(Letter, ii);
      this.resizeVertical(calculation, ii);

      if ( (ii + 1) % br === 0) {
        Letter = CORE.$.numberToAlpha(CORE.$.alphaToNumber(Letter) + 1);
        helper = ii + 1;
      }

    }

  };

  /**
   * Update the grid width
   *
   * @method updateWidth
   * @static
   */
  CORE.Grid.prototype.updateWidth = function(dir) {

    var lastX = 0,
        lastY = 0;

    var width = this.Settings.x,
        height = this.Settings.y,
        br = this.Settings.y,
        ii = 0;

    var calculation = 0;

    var Letter = null,
        Number = 0;

    /** View fix for the width */
    width += 1;

    /** View fix for the height */
    height += 1;

    for (var xx = 0; xx < width; ++xx) {

      for (var yy = 0; yy < height; ++yy) {

        if (xx > 0) {
          if (xx !== lastX) {
            lastX = xx;
            for (var kk = 0; kk < height; ++kk) {
              /** Calculate cell node position */
              calculation = (kk + ii - (lastX) - height);
              if (CORE.DOM.Output.children[calculation]) {

                /** Calculate cell number */
                if (kk === 0) Number = (height - 1) + this.Settings.scrolledY;
                else Number = kk + this.Settings.scrolledY;

                CORE.DOM.Output.children[calculation].setAttribute("name", Letter + calculation);

                /** Check if cell has custom content */
                if (CORE.Cells.Used[Letter + calculation]) {
                  CORE.DOM.Output.children[calculation].innerHTML = CORE.Cells.Used[Letter + calculation].Content;
                } else {
                  CORE.DOM.Output.children[calculation].innerHTML = "";
                }

              }
            }
          }
        }

        ii += 1;

        if (dir === "right" || dir === "left") {
          if (lastX === 0) Letter = CORE.$.numberToAlpha(this.Settings.scrolledX + 1);
          else Letter = CORE.$.numberToAlpha(lastX + (this.Settings.scrolledX + 1));
        }
        else {
          if (this.Settings.scrolledX === 0) {
            Letter = CORE.$.numberToAlpha(this.Settings.scrolledX + 1);
          } else if (this.Settings.scrolledX === 1) {
            /** Default 0 position */
            Letter = CORE.$.numberToAlpha(this.Settings.scrolledX);
          }
          else Letter = CORE.$.numberToAlpha(this.Settings.scrolledX + 1);
        }

      }

    }

    this.updateHeight("default", CORE.Settings.Scroll.Vertical);

  };

}).call(this);