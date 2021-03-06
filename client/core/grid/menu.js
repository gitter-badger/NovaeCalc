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

  /**
   * Dynamically generate a menu
   *
   * @method generateMenu
   * @static
   */
  CORE.Grid.prototype.generateMenu = function() {

    var lastX = 0,
        lastY = 0;

    var width = this.Settings.x,
        height = this.Settings.y;

    /** View fix for the width */
    width += 1;

    /** View fix for the height */
    height += 1;

    /** Clean the whole menu */
    CORE.DOM.HorizontalMenu.innerHTML = CORE.DOM.VerticalMenu.innerHTML = "";

    for (var xx = 0; xx < width; ++xx) {

      for (var yy = 0; yy < height; ++yy) {

        /** Generate alphabetical menu (width) */
        if (xx > 0 ) {
          if (xx !== lastX) {
            lastX = xx;
            this.generateMenuNode(CORE.$.numberToAlpha(lastX + this.Settings.scrolledX), CORE.DOM.HorizontalMenu, xx, yy, "alpha");
          }
        }

        /** Generate numeric menu (height) */
        if (yy > 0) {
          if (yy > lastY) {
            lastY = yy;
            this.generateMenuNode( (lastY + this.Settings.scrolledY), CORE.DOM.VerticalMenu, xx, yy, "numeric");
          }
        }

      }

    }

  };

  /**
   * Dynamically generate a menu node
   *
   * @method generateMenuNode
   * @static
   */
  CORE.Grid.prototype.generateMenuNode = function(Letter, target, pos_x, pos_y, type) {

    var x, y = 0;

    var template = type === "numeric" ? this.Templates.Menu.Numeric : this.Templates.Menu.Alphabetical;

    var width = template.style.width,
        height = template.style.height;

    var style = null;

    /** Calculate position */
    x = this.CellTemplate.Width * pos_x;
    y = this.CellTemplate.Height * pos_y;

    /** Menu cell has a custom x position */
    if (type === "alpha" && this.customCellSizes.alphabetical[Letter]) {
      width += this.customCellSizes.alphabetical[Letter].Width;
    }

    /** Update x position of all menu cells after cells with a custom width */
    if (type === "alpha") {
      for (var customCell in this.customCellSizes.alphabetical) {
        /** Update x position of all menu cells behind a cell with a custom width */
        if (CORE.$.alphaToNumber(Letter) > CORE.$.alphaToNumber(customCell)) {
          x += this.customCellSizes.alphabetical[customCell].Width;
        }
        /** X-View was scrolled */
        if (this.Settings.scrolledX) {
          /** If custom cell is not in view anymore, adjust all cells behind the custom cells with its custom width */
          if (this.Settings.scrolledX >= CORE.$.alphaToNumber(customCell)) {
            x -= this.customCellSizes.alphabetical[customCell].Width;
          }
        }
      }
    }

    /** Menu cell has a custom y position */
    if (type === "numeric" && this.customCellSizes.numeric[Letter]) {
      height += this.customCellSizes.numeric[Letter].Height;
    }

    /** Update y position of all menu cells after cells with a custom height */
    if (type === "numeric") {
      for (var customCell in this.customCellSizes.numeric) {
        /** Update y position of all menu cells behind a cell with a custom height */
        if (Letter > customCell) {
          y += this.customCellSizes.numeric[customCell].Height;
        }
        /** X-View was scrolled */
        if (this.Settings.scrolledY) {
          /** If custom cell is not in view anymore, adjust all cells behind the custom cells with its custom height */
          if (this.Settings.scrolledY >= customCell) {
            y -= this.customCellSizes.numeric[customCell].Height;
          }
        }
      }
    }

    if (type === "numeric") {
      style = "height: " + height + "px; width: " + width + "px;";
      style += " left:" + x + "px; top: " + y + "px;";
    }
    /** Alphabetical menu border overlay fix by add 1 to the width */
    else if (type === "alpha") {
      style = "height: " + height + "px; width: " + (width + 1) + "px;";
      style += " left:" + x + "px; top: " + y + "px;";
    }

    /** Center vertical menu text */
    if (type === "numeric") {
      /** Center cell text vertically, do a small view fix */
      style += " line-height: " + ( height - 8 ) + "px;";
    }

    var element = null;

    /** Alphabetical menu */
    if (type === "alpha") element = this.createAlphabeticalMenuCell(Letter, style, template); 
    /** Numeric menu */
    else element = this.createNumericMenuCell(Letter, style, template);

    target.appendChild(element);

  };

  /**
   * Dynamically generate a alphabetical menu cell
   *
   * @method createAlphabeticalMenuCell
   * @static
   */
  CORE.Grid.prototype.createAlphabeticalMenuCell = function(Letter, style, template) {

    var self = this;

    /** Create dom ready element */
    var element = document.createElement(template.element);
        element.className = template.class;
        element.setAttribute("clicked", 0);
        element.setAttribute("style", style);
        element.setAttribute("timestamp", new Date().getTime());
        element.innerHTML = Letter;

    var mouseDownEvent = CORE.Settings.Mobile ? "touchstart" : "mousedown";
    var mouseUpEvent = CORE.Settings.Mobile ? "touchend" : "mouseup";
    var mouseOutEvent = CORE.Settings.Mobile ? "touchleave" : "mouseout";
    var mouseMoveEvent = CORE.Settings.Mobile ? "touchmove" : "mousemove";

        element.addEventListener(mouseDownEvent, function(e) {
          /** Double click */
          if (new Date().getTime() - parseInt(this.getAttribute("timestamp")) <= 150) {
            /** Do a master selection */
            CORE.Sheets[CORE.CurrentSheet].Selector.masterSelect(e.target.innerHTML);
          } else this.setAttribute("timestamp", e.timeStamp);
          this.setAttribute("clicked", 1);
          CORE.Sheets[CORE.CurrentSheet].Input.Mouse.CellResize = true;
        });

        element.addEventListener(mouseUpEvent, function(e) {
          this.setAttribute("clicked", 0);
          /** Re-render grid */
          CORE.Sheets[CORE.CurrentSheet].Input.lastAction.scrollY = false;
          this.setAttribute("timestamp", e.timeStamp);
        });

        element.addEventListener(mouseOutEvent, function(e) {
          this.setAttribute("clicked", 0);
        });

        /** User wants to change row size ? */
        element.addEventListener(mouseMoveEvent, function(e) {

          var x = 0;
          var y = 0;

          /** Desktop */
          if (!CORE.Settings.Mobile) {

            x = e.pageX - this.offsetLeft,
            y = e.pageY - this.offsetTop;

            if (e.pageX < self.mouseMoveDirection.oldX) self.mouseMoveDirection.directionX = "left";
            else if (e.pageX > self.mouseMoveDirection.oldX) self.mouseMoveDirection.directionX = "right";
            else self.mouseMoveDirection.directionX = null;

            self.mouseMoveDirection.oldX = e.pageX;

          /** Mobile */
          } else {

            x = e.touches[0].pageX - this.offsetLeft,
            y = e.touches[0].pageY - this.offsetTop;

            if (e.touches[0].pageX < self.mouseMoveDirection.oldX) self.mouseMoveDirection.directionX = "left";
            else if (e.touches[0].pageX > self.mouseMoveDirection.oldX) self.mouseMoveDirection.directionX = "right";
            else self.mouseMoveDirection.directionX = null;

            self.mouseMoveDirection.oldX = e.touches[0].pageX;

          }

          if ((x + y) >= -35) {
            e.target.style.cursor = "col-resize";
            if (e.target.getAttribute("clicked") === "1") {

              var name = e.target.innerHTML;

              /** Create custom cell scroll object */
              if (!self.customCellSizes.alphabetical[name]) {
                self.customCellSizes.alphabetical[name] = {
                  Width: 0,
                  Height: 0
                };
              }

              /** User scrolls cell to right */
              if (self.mouseMoveDirection.directionX === "right") {
                e.target.style.width = (parseInt(e.target.style.width) + 2) + "px";

                /** Update customized cell object */
                self.customCellSizes.alphabetical[name].Width += 2;

                /** Update total cell resize factor */
                self.Settings.cellResizedX += 2;

              }
              /** User scrolls cell to left */
              else if (self.mouseMoveDirection.directionX === "left") {
                if (parseInt(e.target.style.width) > self.CellTemplate.Width) {
                  e.target.style.width = (parseInt(e.target.style.width) - 2) + "px";
                  /** Update customized cell object */
                  self.customCellSizes.alphabetical[name].Width -= 2;

                  /** Update total cell resize factor */
                  self.Settings.cellResizedX -= 2;

                } else {
                  e.target.style.width = self.CellTemplate.Width + "px";

                  /** Update customized cell object */
                  self.customCellSizes.alphabetical[name].Width = 0;

                }
              }

            }
          }
          else e.target.style.cursor = "pointer";

        });

    return (element);

  };

  /**
   * Dynamically generate a numeric menu cell
   *
   * @method createNumericMenuCell
   * @static
   */
  CORE.Grid.prototype.createNumericMenuCell = function(Letter, style, template) {

    var self = this;

    /** Create dom ready element */
    var element = document.createElement(template.element);
        element.className = template.class;
        element.setAttribute("clicked", 0);
        element.setAttribute("style", style);
        element.setAttribute("timestamp", new Date().getTime());
        element.innerHTML = Letter;

    var mouseDownEvent = CORE.Settings.Mobile ? "touchstart" : "mousedown";
    var mouseUpEvent = CORE.Settings.Mobile ? "touchend" : "mouseup";
    var mouseOutEvent = CORE.Settings.Mobile ? "touchleave" : "mouseout";
    var mouseMoveEvent = CORE.Settings.Mobile ? "touchmove" : "mousemove";

        element.addEventListener(mouseDownEvent, function(e) {
          /** Double click */
          if (new Date().getTime() - parseInt(this.getAttribute("timestamp")) <= 150) {
            /** Do a master selection */
            CORE.Sheets[CORE.CurrentSheet].Selector.masterSelect(parseInt(e.target.innerHTML));
          } else this.setAttribute("timestamp", e.timeStamp);
          this.setAttribute("clicked", 1);
          CORE.Sheets[CORE.CurrentSheet].Input.Mouse.CellResize = true;
        });

        element.addEventListener(mouseUpEvent, function(e) {
          this.setAttribute("clicked", 0);
        });

        element.addEventListener(mouseOutEvent, function(e) {
          this.setAttribute("clicked", 0);
        });

        
        /** User wants to change row size ? */
        element.addEventListener(mouseMoveEvent, function(e) {

          var x = 0;
          var y = 0;

          /** Desktop */
          if (!CORE.Settings.Mobile) {

            x = e.pageX - this.offsetLeft,
            y = e.pageY - this.offsetTop;

            if (e.pageY < self.mouseMoveDirection.oldY) self.mouseMoveDirection.directionY = "up";
            else if (e.pageY > self.mouseMoveDirection.oldY) self.mouseMoveDirection.directionY = "down";
            else self.mouseMoveDirection.directionY = null;

            self.mouseMoveDirection.oldY = e.pageY;

          /** Mobile */
          } else {

            x = e.touches[0].pageX - this.offsetLeft,
            y = e.touches[0].pageY - this.offsetTop;

            if (e.touches[0].pageY < self.mouseMoveDirection.oldY) self.mouseMoveDirection.directionY = "up";
            else if (e.touches[0].pageY > self.mouseMoveDirection.oldY) self.mouseMoveDirection.directionY = "down";
            else self.mouseMoveDirection.directionY = null;

            self.mouseMoveDirection.oldY = e.touches[0].pageY;

          }

          if ((x + y) >= - 35) {
            e.target.style.cursor = "row-resize";
            if (e.target.getAttribute("clicked") === "1") {

              var name = e.target.innerHTML;

              /** Create custom cell scroll object */
              if (!self.customCellSizes.numeric[name]) {
                self.customCellSizes.numeric[name] = {
                  Width: 0,
                  Height: 0
                };
                self.customCellSizes.array.push(~~(name));
              }

              /** User scrolls cell up */
              if (self.mouseMoveDirection.directionY === "down") {
                e.target.style.height = (parseInt(e.target.style.height) + 2) + "px";

                /** Update customized cell object */
                self.customCellSizes.numeric[name].Height += 2;

                /** Update total cell resize factor */
                self.Settings.cellResizedY += 2;

              }
              /** User scrolls cell down */
              else if (self.mouseMoveDirection.directionY === "up") {
                if (parseInt(e.target.style.height) > self.CellTemplate.Height) {
                  e.target.style.height = (parseInt(e.target.style.height) - 2) + "px";
                  /** Update customized cell object */
                  self.customCellSizes.numeric[name].Height -= 2;

                  /** Update total cell resize factor */
                  self.Settings.cellResizedY -= 2;

                } else {
                  e.target.style.height = self.CellTemplate.Height + "px";

                  /** Update customized cell object */
                  self.customCellSizes.numeric[name].Height = 0;

                }
              }

            }
          }
          else e.target.style.cursor = "pointer";

        });

    return (element);

  };

  /**
   * Update the menu
   *
   * @method updateMenu
   * @static
   */
  CORE.Grid.prototype.updateMenu = function() {

    /** User resized some cells */
    if (this.Settings.cellResizedX || this.Settings.cellResizedY) {
      this.generateMenu();
    /** No resizes */
    } else this.updateMenuNoResizement();

  };

  /**
   * Update the menu, dont care about resizes
   *
   * @method updateMenuNoResizement
   * @static
   */
  CORE.Grid.prototype.updateMenuNoResizement = function() {

    /** Update vertical numeric menu */
    for (var yy = 0; yy < this.Settings.y; ++yy) {
      CORE.DOM.VerticalMenu.children[yy].innerHTML = (yy + this.Settings.scrolledY) + 1;
    }

    /** Update horizontal alphabetical menu */
    for (var xx = 0; xx < this.Settings.x; ++xx) {
      CORE.DOM.HorizontalMenu.children[xx].innerHTML = CORE.$.numberToAlpha( (xx + this.Settings.scrolledX) + 1);
    }

  };