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
   * The Lexer
   *
   * @class LEXER
   * @static
   */
  ENGEL.LEXER = function() {

    /** Token list */
    this.Tokens = [];

    /** Precompile lexical regular expressions */
    this.KeyWords = [

      /** Statements */
      { name: "LX_IF",     rx: /^(wenn|if)(?![a-zA-Z0-9_])/    },
      { name: "LX_ELSE",   rx: /^(sonst|else)(?![a-zA-Z0-9_])/ },

      /** Brackets */
      { name: "LX_LPAR",   rx: /^[\\(]()+/ },
      { name: "LX_RPAR",   rx: /^[\\)]()+/ },
      { name: "LX_LBRAC",  rx: /^[\\{]+/   },
      { name: "LX_RBRAC",  rx: /^[\\}]+/   },
      { name: "LX_LHBRAC", rx: /^\[.*?/    },
      { name: "LX_RHBRAC", rx: /^\].*?/    },
      { name: "LX_SEMIC",  rx: /^[;]+/     },

      /** Comparison */
      { name: "LX_EQ",  rx: /^==/          },
      { name: "LX_NEQ", rx: /^!=/          },
      { name: "LX_AND", rx: /^(&&)/        },
      { name: "LX_OR",  rx: /^([\\|\\|])+/ },
      { name: "LX_GRE", rx: /^>=/          },
      { name: "LX_LWE", rx: /^<=/          },
      { name: "LX_GR",  rx: /^>/           },
      { name: "LX_LW",  rx: /^</           },

      /** Assignment */
      { name: "LX_ASSIGN", rx: /^=/ },

      /** Comma */
      { name: "LX_COMMA", rx: /^,/ },

      /** Instructions */
      { name: "LX_JSON",      rx: /^(JSON)/     },
      { name: "LX_JSON_CALL", rx: /^->/         },

      /** Math functions */
      { name: "LX_MATH", rx: /^(roundTo|asin|sin|acos|cos|atan|atan2|tan|sqrt|cbrt|exp|random|min|max|round|floor|ceil)/ },

      /** Connect function */
      { name: "LX_CONNECT", rx: /^(verbinden|connect)/ },

      /** Types */
      { name: "LX_VAR",    rx: /^[a-zA-Z_][a-zA-Z0-9_]*/                 },
      { name: "LX_NUMBER", rx: /^[-]?[0-9]+(\.\d+[0-9]*)?/               },
      { name: "LX_STRING", rx: /^"(\\\\"|[^"])(.*?)"|'"'(\\\\'|[^'])*'"/ },

      /** Operators */
      { name: "LX_PLUS",  rx: /^\+(?!\+)/ },
      { name: "LX_MINUS", rx: /^\-(?!-)/  },
      { name: "LX_MULT",  rx: /^[*]+/     },
      { name: "LX_DIV",   rx: /^[/]+/     },
      { name: "LX_POW",   rx: /^[^]/      }

    ];

    /** Reserved words in javascript */
    this.reservedKeyWords = [
      "INFINITY",
      "NAN"
    ];

    /** Precompile regex */
    this.isVariable = /^[A-Z]+[0-9]+$/;

    /** Precompile regex */
    this.blank = /^[ \t\v\f]+/;

    /** Precompile regex */
    this.notBlank = /^\S+/;

    /** Precompile regex */
    this.lineBreak = /^[\r\n]+/;

    /** Is blank */
    this.isBlank = function() { return arguments[0e0].match(this.blank); };

    /** Is not blank */
    this.isNotBlank = function() { return arguments[0e0].match(this.notBlank); };

    /** Is line break */
    this.isLineBreak = function() { return arguments[0e0].match(this.lineBreak); };

    /** Is valid variable */
    this.isValidVariable = function() { return arguments[0e0].match(this.isVariable); };

  };

  ENGEL.LEXER.prototype = ENGEL.LEXER;

  /**
   * Lexical analysis a string and generates a list of tokens
   *
   * @method lex
   * @return {array} of Tokens
   * @static
   */
  ENGEL.LEXER.prototype.lex = function(input) {

    /** Clean tokens */
    this.Tokens = [];

    /** Scan the input stream */
    while (input) {

      /** Ignore blanks */
      var match = this.isLineBreak(input) || this.isBlank(input);

      for (var ii = 0e0; !match && ii < this.KeyWords.length; ++ii) {

        /** Matches with a keyword regex */
        if (match = input.match(this.KeyWords[ii].rx)) {

          /** Optimize math, display function and operator precedences */
          if (["LX_UPLUS", "LX_UMINUS"].indexOf(this.KeyWords[ii].name) >= 0) {
            match[0] = match[0].slice(0, -1);
          }

          /** Turn variables automatically uppercase */
          if (this.KeyWords[ii].name === "LX_VAR") { 
            match[0] = (match[0]).toUpperCase();
            /** Check if variable is a reserved word */
            if (this.reservedKeyWords.indexOf(match[0]) >= 0) {
              console.log(match[0] + " is a reserved word and shall not be used!");
            }
            /** Check if variable is valid */
            if (!this.isValidVariable(match[0])) {
              console.log(match[0] + " is a invalid variable name!");
            }
          }

          /** Special case, user wrote a subtraction without spaces */
          if (this.KeyWords[ii].name === "LX_NUMBER") {
            /** Create difference between negative numbers and subtraction order */
            if (this.Tokens[this.Tokens.length - 1].type === "LX_NUMBER") {
              /** Negative number */
              if (parseFloat(match[0]) < 0) {
                this.Tokens.push({
                  type:  "LX_MINUS",
                  value: "-"
                });
                match[0] = match[0].slice(0, 1);
                break;
              }
            }
          }

          /** Parentheses operator precedence */
          if (["LX_MINUS", "LX_PLUS"].indexOf(this.KeyWords[ii].name) >= 0) {
            /** Last token was a number, variable or a string */
            if (["LX_NUMBER", "LX_VAR", "LX_STRING", "LX_RPAR"].indexOf(this.Tokens[this.Tokens.length - 1].type) <= -1) {
              /** Check if left opening parentheses is following */
              if (input.substring(match[0e0].length)[0] === "(") {
                switch (this.KeyWords[ii].name) {
                  case "LX_PLUS":
                    this.Tokens.push({
                      type:  "LX_UPLUS",
                      value: match[0].trim()
                    });
                    break;
                  case "LX_MINUS":
                    this.Tokens.push({
                      type:  "LX_UMINUS",
                      value: match[0].trim()
                    });
                    break;
                }
                match[0] = match[0].slice(0, 1);
                break;
              }
            }
          }

          this.Tokens.push({
            type:  this.KeyWords[ii].name,
            value: match[0].trim()
          });

        }

      }

      /** Doesnt match with any regex */
      if (!match) {
        console.log(input[0] + " is not defined!");
        break;
      }

      /** Continue if stream goes on */
      if (match || this.notBlank(input)) input = input.substring(match[0e0].length);
      else break;

    }

    return (this.Tokens);

  };