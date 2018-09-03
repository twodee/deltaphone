var workspace = null;

var expressionColor = 270;
var statementColor = 180;

var durations = [
  [{"src": "images/note1.svg", "width": 13, "height": 5, "alt": "Whole"}, "1"],
  [{"src": "images/note2.svg", "width": 9, "height": 20, "alt": "Half"}, "2"],
  [{"src": "images/note4.svg", "width": 9, "height": 20, "alt": "Quarter"}, "4"],
  [{"src": "images/note8.svg", "width": 14, "height": 20, "alt": "Eighth"}, "8"],
  [{"src": "images/note16.svg", "width": 14, "height": 20, "alt": "Sixteenth"}, "16"],
  [{"src": "images/note32.svg", "width": 14, "height": 24, "alt": "Thirty-second"}, "32"],
];

var deltas = [
  ["-12", "-12"],
  ["-11", "-11"],
  ["-10", "-10"],
  ["-9", "-9"],
  ["-8", "-8"],
  ["-7", "-7"],
  ["-6", "-6"],
  ["-5", "-5"],
  ["-4", "-4"],
  ["-3", "-3"],
  ["-2", "-2"],
  ["-1", "-1"],
  ["0", "0"],
  ["+1", "+1"],
  ["+2", "+2"],
  ["+3", "+3"],
  ["+4", "+4"],
  ["+5", "+5"],
  ["+6", "+6"],
  ["+7", "+7"],
  ["+8", "+8"],
  ["+9", "+9"],
  ["+10", "+10"],
  ["+11", "+11"],
  ["+12", "+12"],
];

function ExpressionInteger(value) {
  this.value = value;
  this.evaluate = function(env) {
    return this.value;
  }
}

function ExpressionReal(value) {
  this.value = value;
  this.evaluate = function(env) {
    return this.value;
  }
}

function StatementNote(halfstep, duration) {
  this.halfstep = halfstep;
  this.duration = duration;
  this.evaluate = function(env) {
    env.halfstep = this.halfstep.evaluate(env);
    if (env.beats == 4) {
      env.sequence.push('|');
      env.beats = 0;
    }
    env.beats += 4 / duration;
    env.sequence.push(env.halfstep + '.3.' + duration);
  }
}

function StatementBlock(statements) {
  this.statements = statements;
  this.evaluate = function(env) {
    statements.forEach(statement => statement.evaluate(env));
  }
}

function StatementRepeat(count, block) {
  this.count = count;
  this.block = block;
  this.evaluate = function(env) {
    for (var i = 0; i < this.count.evaluate(env); ++i) {
      this.block.evaluate(env);
    }
  }
}

function StatementRepeat12(common, first, second) {
  this.common = common;
  this.first = first;
  this.second = second;
  this.evaluate = function(env) {
    this.common.evaluate(env);
    this.first.evaluate(env);
    this.common.evaluate(env);
    this.second.evaluate(env);
  }
}

function StatementDelta(delta) {
  this.delta = delta;
  this.evaluate = function(env) {
    env.halfstep += delta;
  }
}

function StatementNoteDelta(delta, duration) {
  this.delta = delta;
  this.duration = duration;
  this.evaluate = function(env) {
    if (env.beats == 4) {
      env.sequence.push('|');
      env.beats = 0;
    }
    env.halfstep += delta;
    env.beats += 4 / duration;
    env.sequence.push(env.halfstep + '.3.' + this.duration);
  }
}

var blockDefinitions = {
  // Primitives
  integer: {
    configuration: {
      colour: expressionColor,
      output: "Integer",
      message0: "%1",
      args0: [
        { type: "field_input", name: "value", text: "0" },
      ]
    },
    tree: function() {
      return new ExpressionInteger(parseInt(this.getFieldValue('value')));
    }
  },
  real: {
    configuration: {
      colour: expressionColor,
      output: "Real",
      message0: "%1",
      args0: [
        { type: "field_input", name: "value", text: "0.0" },
      ]
    },
    tree: function() {
      return new ExpressionInteger(parseInt(this.getFieldValue('value')));
    }
  },

  // Commands
  note: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      // inputsInline: true,
      message0: "note %1 %2",
      args0: [
        { "type": "input_value", "align": "RIGHT", "name": "halfstep" },
        { "type": "field_dropdown", "align": "RIGHT", "name": "duration", "options": durations },
      ]
    },
    tree: function(block) {
      var halfstepBlock = this.getInputTargetBlock('halfstep');
      var duration = parseInt(this.getFieldValue('duration'));
      return new StatementNote(halfstepBlock.tree(), duration);
    }
  },
  delta: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      // inputsInline: true,
      message0: "delta %1",
      args0: [
        { "type": "field_dropdown", "align": "RIGHT", "name": "delta", options: deltas },
      ]
    },
    tree: function() {
      var delta = parseInt(this.getFieldValue('delta'));
      return new StatementDelta(delta);
    }
  },
  notedelta: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      // inputsInline: true,
      message0: "delta note %1 %2",
      args0: [
        { "type": "field_dropdown", "align": "RIGHT", "name": "delta", options: deltas },
        { "type": "field_dropdown", "align": "RIGHT", "name": "duration", "options": durations },
      ]
    },
    tree: function() {
      var delta = parseInt(this.getFieldValue('delta'));
      var duration = parseInt(this.getFieldValue('duration'));
      return new StatementNoteDelta(delta, duration);
    }
  },

  // Control
  repeat: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: "repeat %1 %2",
      args0: [
        { "type": "input_value", "align": "RIGHT", "name": "count" },
        { "type": "input_statement", "align": "RIGHT", "name": "body" },
      ]
    },
    tree: function(block) {
      var countBlock = this.getInputTargetBlock('count');
      var bodyBlock = this.getInputTargetBlock('body');

      var statements = [];
      while (bodyBlock) {
        statements.push(bodyBlock.tree());
        bodyBlock = bodyBlock.getNextBlock();
      }
      var block = new StatementBlock(statements);

      return new StatementRepeat(countBlock.tree(), block);
    }
  },
  repeat12: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: "repeat %1 1. %2 2. %3",
      args0: [
        { "type": "input_statement", "align": "LEFT", "name": "common" },
        { "type": "input_statement", "align": "RIGHT", "name": "first" },
        { "type": "input_statement", "align": "RIGHT", "name": "second" },
      ]
    },
    tree: function(block) {
      var commonBlock = this.getInputTargetBlock('common');
      var firstBlock = this.getInputTargetBlock('first');
      var secondBlock = this.getInputTargetBlock('second');
      return new StatementRepeat(commonBlock.tree(), firstBlock.tree(), secondBlock.tree());
    }
  },
};

function initializeBlock(id) {
  Blockly.Blocks[id] = {
    init: function() {
      this.jsonInit(blockDefinitions[id].configuration);
    },
    tree: blockDefinitions[id].tree
  };
}

function setup() {
  // Initialize blocks.
  for (var id in blockDefinitions) {
    if (blockDefinitions.hasOwnProperty(id)) {
      initializeBlock(id);
    }
  }

  var options = {
    toolbox: document.getElementById('toolbox'),
    trashcan: true,
    comments: false,
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 3,
      minScale: 0.3,
      scaleSpeed: 1.2
    }
  };
  workspace = Blockly.inject('blocklyEditor', options);

  // $('#generateButton').click(function() {
    // var code = Blockly.Deltaphone.workspaceToCode(workspace);
    // console.log(code);
  // });

  $('#playButton').click(() => {
    $('#score').alphaTab('playPause');
  });

  $('#renderButton').click(() => {
    var xml = Blockly.Xml.workspaceToDom(workspace);
    xml = Blockly.Xml.domToText(xml);
    localStorage.setItem('last', xml);

    var roots = workspace.getTopBlocks();
    var env = {
      beats: 0,
      halfstep: 8,
      sequence: []
    };
    roots.forEach(root => {
      while (root) {
        root.tree().evaluate(env);
        root = root.getNextBlock();
      }
    });
    $('#scratch').val('\\instrument 0\n.\n' + env.sequence.join(' '));

    var myNode = document.getElementById("wrapper");
    while (myNode.firstChild) {
      myNode.removeChild(myNode.firstChild);
    }
    $('#wrapper').html('<div id="score" data-tex="true" data-player="general_user.sf2"></div>');
    $('#score').text($('#scratch').val());
    render();
  });

  var last = localStorage.getItem('last');
  if (last) {
    // console.log("last:", last);
    // console.log("loading");
    last = Blockly.Xml.textToDom(last);
    Blockly.Xml.domToWorkspace(last, workspace);
  }

  var importer = new alphaTab.importer.MusicXmlImporter();
  console.log("importer:", importer);
}

$(document).ready(setup);

function render() {
  var musicXML = $('#foo').val();
  console.log("musicXML:", musicXML);
  musicXML = new TextEncoder().encode(musicXML);

  $('#score').alphaTab({
    staves: 'score',
    file: musicXML,
    layout: {
      mode: 'page',
      additionalSettings: {
        hideTuning: true,
        hideTrackNames: true
      }
    }
  });
}
