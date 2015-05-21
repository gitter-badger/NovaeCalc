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
   * The Parser
   *
   * @class PARSER
   * @static
   */
  ENGEL.PARSER = function() {

    /** Global block object */
    this.block = null;

    /** Current block global block object */
    this.currentBlock = null;

    /** Reserved functions */
    this.ReservedFunctions = ["LX_CONNECT"];

  };

  ENGEL.PARSER.prototype = ENGEL;

  /**
   * Evaluate the token list and generate an AST from it
   *
   * @method parse
   * @return {object} AST
   * @static
   */
  ENGEL.PARSER.prototype.parse = function(input) {

    return (this.createAST(input));

  };

  /**
   * Create an AST
   *
   * @method createAST
   * @return {object} AST
   * @static
   */
  ENGEL.PARSER.prototype.createAST = function(block) {

    if (!block[0]) return (block);

    /** Global access */
    this.block = block;

    /** Detected variable */
    if (this.block[0].type === "LX_VAR") return(this.variable());

  };

  /**
   * Create an variable AST
   *
   * @method variable
   * @return {object} variable AST
   * @static
   */
  ENGEL.PARSER.prototype.variable = function() {

    /** Shorter syntax */
    var block = this.block;

    /** Variable assignment template */
    var node = {
      AssignmentExpression: {
        id: {
          type: "Identifier",
          name: block[0].value
        },
        init: null,
        kind: "var"
      }
    };

    /** Direct scope for shorter syntax */
    var directScope = node.AssignmentExpression;

    /** Save variable */
    var variable = block[0].type === "LX_VAR" ? block[0].value : "undefined";

    /** Delete variable block */
    if (block[0].type === "LX_VAR") block.shift();

    /** Variable assignment starts */
    if (block[0] && block[0].type === "LX_ASSIGN") {

      this.shift();

      /** Only shift, if we got no function call */
      if (this.ReservedFunctions.indexOf(block[0].type) <= -1) {
        directScope.init = this.expressionStatement();
        return (node);
      }

      /** Function call variable assignment */
      if (this.ReservedFunctions.indexOf(block[0].type) >= 0) {
        directScope.init = this.functionAssignment();
        return (node);
      }

    }

  };

  /**
   * Create an variable expression statement AST
   *
   * @method expressionStatement
   * @return {object} expression statement AST
   * @static
   */
  ENGEL.PARSER.prototype.expressionStatement = function() {

    /** Shorter syntax */
    var block = this.block;

    /** Variable assignment template */
    var ExpressionStatement = null;

    /** Add semicolon the end */
    if (block[block.length - 1] && 
      block[block.length - 1].type !== "LX_SEMIC") this.addSemicolon();

    this.shift();

    ExpressionStatement = this.ruleExpression();

    return ({ ExpressionStatement });

  };

  /**
   * Create an variable function assignment AST
   *
   * @method functionAssignment
   * @return {object} function Assignment AST
   * @static
   */
  ENGEL.PARSER.prototype.functionAssignment = function() {

    /** Shorter syntax */
    var block = this.block;

    /** Call expression template */
    var CallExpression = {
      callee: {
        Identifier: block[0].value
      },
      arguments: []
    };

    this.shift();

    /** Direct scope for shorter syntax */
    var directScope = CallExpression;

    /** Read arguments */
    if (block[0].type === "LX_LPAR") directScope.arguments = this.readFunctionArguments();

    return ({ CallExpression });

  };

  /**
   * Read a functions arguments
   *
   * @method readFunctionArguments
   * @return {array} function arguments array
   * @static
   */
  ENGEL.PARSER.prototype.readFunctionArguments = function() {

    /** Shorter syntax */
    var block = this.block;

    var parentArray = [],
        array = [],
        argumentArray = [];

    /** To ignore parentheses */
    var jumper = 0;

    while (block[0]) {

      if (block[0].type === "LX_LPAR") jumper++;
      else if (block[0].type === "LX_RPAR") jumper--;

      if (block[0].type === "LX_COMMA") {
        parentArray.push(array);
        array = [];
      } else if (block[0].type === "LX_RPAR") {
        if (jumper <= 0) {
          parentArray.push(array);
          jumper = 0;
          break;
        }
      }

      if (block[0].type !== "LX_COMMA") {
        array.push(block[0]);
      }

      block.shift();

    }

    for (var ii = 0; ii < parentArray.length; ++ii) {

      this.block = block = parentArray[ii];
      this.shift();

      /** Add semicolon the end */
      this.addSemicolon();

      /** Generate AST of function parameters */
      argumentArray.push(this.ruleExpression());

    }

    return (argumentArray);

  };

  /**
   * Add a semicolon to a block end
   *
   * @method addSemicolon
   * @static
   */
  ENGEL.PARSER.prototype.addSemicolon = function() {

    this.block.push({
      type: "LX_SEMIC",
      value: ";"
    });

  };

}).call(this);