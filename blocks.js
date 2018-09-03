/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Helper functions for generating Deltaphone for blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Deltaphone');

goog.require('Blockly.Generator');


/**
 * Deltaphone code generator.
 * @type {!Blockly.Generator}
 */
Blockly.Deltaphone = new Blockly.Generator('Deltaphone');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Deltaphone.addReservedWords(
  'forward,backward'
);

Blockly.Deltaphone.ORDER_ATOMIC = 0;            // 0 "" ...
Blockly.Deltaphone.ORDER_COLLECTION = 1;        // tuples, lists, dictionaries
Blockly.Deltaphone.ORDER_STRING_CONVERSION = 1; // `expression...`
Blockly.Deltaphone.ORDER_MEMBER = 2.1;          // . []
Blockly.Deltaphone.ORDER_FUNCTION_CALL = 2.2;   // ()
Blockly.Deltaphone.ORDER_EXPONENTIATION = 3;    // **
Blockly.Deltaphone.ORDER_UNARY_SIGN = 4;        // + -
Blockly.Deltaphone.ORDER_BITWISE_NOT = 4;       // ~
Blockly.Deltaphone.ORDER_MULTIPLICATIVE = 5;    // * / // %
Blockly.Deltaphone.ORDER_ADDITIVE = 6;          // + -
Blockly.Deltaphone.ORDER_BITWISE_SHIFT = 7;     // << >>
Blockly.Deltaphone.ORDER_BITWISE_AND = 8;       // &
Blockly.Deltaphone.ORDER_BITWISE_XOR = 9;       // ^
Blockly.Deltaphone.ORDER_BITWISE_OR = 10;       // |
Blockly.Deltaphone.ORDER_RELATIONAL = 11;       // in, not in, is, is not,
                                            //     <, <=, >, >=, <>, !=, ==
Blockly.Deltaphone.ORDER_LOGICAL_NOT = 12;      // not
Blockly.Deltaphone.ORDER_LOGICAL_AND = 13;      // and
Blockly.Deltaphone.ORDER_LOGICAL_OR = 14;       // or
Blockly.Deltaphone.ORDER_CONDITIONAL = 15;      // if else
Blockly.Deltaphone.ORDER_LAMBDA = 16;           // lambda
Blockly.Deltaphone.ORDER_NONE = 99;             // (...)

Blockly.Deltaphone.ORDER_OVERRIDES = [
  // (foo()).bar -> foo().bar
  // (foo())[0] -> foo()[0]
  // [Blockly.Deltaphone.ORDER_FUNCTION_CALL, Blockly.Deltaphone.ORDER_MEMBER],
  // (foo())() -> foo()()
  // [Blockly.Deltaphone.ORDER_FUNCTION_CALL, Blockly.Deltaphone.ORDER_FUNCTION_CALL],
  // (foo.bar).baz -> foo.bar.baz
  // (foo.bar)[0] -> foo.bar[0]
  // (foo[0]).bar -> foo[0].bar
  // (foo[0])[1] -> foo[0][1]
  // [Blockly.Deltaphone.ORDER_MEMBER, Blockly.Deltaphone.ORDER_MEMBER],
  // (foo.bar)() -> foo.bar()
  // (foo[0])() -> foo[0]()
  // [Blockly.Deltaphone.ORDER_MEMBER, Blockly.Deltaphone.ORDER_FUNCTION_CALL],

  // not (not foo) -> not not foo
  // [Blockly.Deltaphone.ORDER_LOGICAL_NOT, Blockly.Deltaphone.ORDER_LOGICAL_NOT],
  // a and (b and c) -> a and b and c
  // [Blockly.Deltaphone.ORDER_LOGICAL_AND, Blockly.Deltaphone.ORDER_LOGICAL_AND],
  // a or (b or c) -> a or b or c
  // [Blockly.Deltaphone.ORDER_LOGICAL_OR, Blockly.Deltaphone.ORDER_LOGICAL_OR]
];

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Deltaphone.init = function(workspace) {
  /**
   * Empty loops or conditionals are not allowed in Deltaphone.
   */
  // Create a dictionary of definitions to be printed before the code.
  Blockly.Deltaphone.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  Blockly.Deltaphone.functionNames_ = Object.create(null);

  if (!Blockly.Deltaphone.variableDB_) {
    Blockly.Deltaphone.variableDB_ = new Blockly.Names(Blockly.Deltaphone.RESERVED_WORDS_);
  } else {
    Blockly.Deltaphone.variableDB_.reset();
  }

  Blockly.Deltaphone.variableDB_.setVariableMap(workspace.getVariableMap());

  var defvars = [];
  // Add developer variables (not created or named by the user).
  var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (var i = 0; i < devVarList.length; i++) {
    defvars.push(Blockly.Deltaphone.variableDB_.getName(devVarList[i], Blockly.Names.DEVELOPER_VARIABLE_TYPE) + ' = None');
  }

  // Add user variables, but only ones that are being used.
  var variables = Blockly.Variables.allUsedVarModels(workspace);
  for (var i = 0; i < variables.length; i++) {
    defvars.push(Blockly.Deltaphone.variableDB_.getName(variables[i].getId(), Blockly.Variables.NAME_TYPE) + ' = None');
  }

  Blockly.Deltaphone.definitions_['variables'] = defvars.join('\n');
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Deltaphone.finish = function(code) {
  // Convert the definitions dictionary into a list.
  // var imports = [];
  // var definitions = [];
  // for (var name in Blockly.Deltaphone.definitions_) {
    // var def = Blockly.Deltaphone.definitions_[name];
    // if (def.match(/^(from\s+\S+\s+)?import\s+\S+/)) {
      // imports.push(def);
    // } else {
      // definitions.push(def);
    // }
  // }
  // Clean up temporary data.
  delete Blockly.Deltaphone.definitions_;
  delete Blockly.Deltaphone.functionNames_;
  Blockly.Deltaphone.variableDB_.reset();
  // var allDefs = imports.join('\n') + '\n\n' + definitions.join('\n\n');
  // return allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n') + code;
  return code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Deltaphone.scrubNakedValue = function(line) {
  return line + '\n';
};

/**
 * Encode a string as a properly escaped Deltaphone string, complete with quotes.
 * @param {string} string Text to encode.
 * @return {string} Deltaphone string.
 * @private
 */
Blockly.Deltaphone.quote_ = function(string) {
  // Can't use goog.string.quote since % must also be escaped.
  string = string.replace(/\\/g, '\\\\')
                 .replace(/\n/g, '\\\n')
                 .replace(/\%/g, '\\%');

  // Follow the CDeltaphone behaviour of repr() for a non-byte string.
  var quote = '\'';
  if (string.indexOf('\'') !== -1) {
    if (string.indexOf('"') === -1) {
      quote = '"';
    } else {
      string = string.replace(/'/g, '\\\'');
    }
  };
  return quote + string + quote;
};

/**
 * Common tasks for generating Deltaphone from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Deltaphone code created for this block.
 * @return {string} Deltaphone code with comments and subsequent blocks added.
 * @private
 */
Blockly.Deltaphone.scrub_ = function(block, code) {
  var commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    var comment = block.getCommentText();
    comment = Blockly.utils.wrap(comment, Blockly.Deltaphone.COMMENT_WRAP - 3);
    if (comment) {
      if (block.getProcedureDef) {
        // Use a comment block for function comments.
        commentCode += '"""' + comment + '\n"""\n';
      } else {
        commentCode += Blockly.Deltaphone.prefixLines(comment + '\n', '# ');
      }
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (var i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == Blockly.INPUT_VALUE) {
        var childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          var comment = Blockly.Deltaphone.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.Deltaphone.prefixLines(comment, '# ');
          }
        }
      }
    }
  }
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  var nextCode = Blockly.Deltaphone.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};
