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

Import.scripts = [
  /** Libraries */
  "lib/fastclick.min.js",
  "lib/ajax.min.js",
  "lib/eight-bit-color-picker.min.js",
  "lib/socket.io.min.js",
  "style/mui/js/mui.min.js",
  "compiled.js"
];

Import.after = function() {
  ENGEL.init();
  CORE_UI.init();
  /** Add fade out animation, hide element */
  document.querySelector("#loader").classList.add("fadeOut");
  setTimeout( function() { CORE.$.init(); }, 250);
  setTimeout( function() { document.querySelector("#loader").style.display = "none"; }, 750);
};

Import.each = function(percent) {
  /** Update percentage in document */
  document.querySelector(".loader-title").innerHTML = percent + "%";
  if (percent >= 99) document.querySelector(".loader-wrapper").classList.add("fadeOut");
};

Import.me();