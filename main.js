var workspace = null;

var expressionColor = 270;
var statementColor = 180;
var parameterColor = 330;

var letters = [
  ['C', '0'],
  ['D', '2'],
  ['E', '4'],
  ['F', '5'],
  ['G', '7'],
  ['A', '9'],
  ['B', '11'],
];

var octaves = [
  ['0', '0'],
  ['1', '1'],
  ['2', '2'],
  ['3', '3'],
  ['4', '4'],
  ['5', '5'],
  ['6', '6'],
  ['7', '7'],
  ['8', '8'],
  ['9', '9'],
  ['10', '10'],
  ['11', '11'],
  ['12', '12'],
];

var accidentals = [
  ['\u266f', '1'],
  ['\u266e', '0'],
  ['\u266d', '-1'],
];

var scales = [
  ['major', 'major'],
  ['minor', 'minor'],
];

var noteDurations = [
  [{'src': 'images/note1.svg', 'width': 13, 'height': 5, 'alt': 'Whole'}, '1'],
  [{'src': 'images/note2.svg', 'width': 9, 'height': 20, 'alt': 'Half'}, '2'],
  [{'src': 'images/note4.svg', 'width': 9, 'height': 20, 'alt': 'Quarter'}, '4'],
  [{'src': 'images/note8.svg', 'width': 14, 'height': 20, 'alt': 'Eighth'}, '8'],
  [{'src': 'images/note16.svg', 'width': 14, 'height': 20, 'alt': 'Sixteenth'}, '16'],
  [{'src': 'images/note32.svg', 'width': 14, 'height': 24, 'alt': 'Thirty-second'}, '32'],
];

var restDurations = [
  [{'src': 'images/rest1.svg', 'width': 15, 'height': 12, 'alt': 'Whole'}, '1'],
  [{'src': 'images/rest2.svg', 'width': 15, 'height': 12, 'alt': 'Half'}, '2'],
  [{'src': 'images/rest4.svg', 'width': 8, 'height': 20, 'alt': 'Quarter'}, '4'],
  [{'src': 'images/rest8.svg', 'width': 8, 'height': 16, 'alt': 'Eighth'}, '8'],
  [{'src': 'images/rest16.svg', 'width': 10, 'height': 20, 'alt': 'Sixteenth'}, '16'],
  [{'src': 'images/rest32.svg', 'width': 12, 'height': 25, 'alt': 'Thirty-second'}, '32'],
];

var deltaUnits = [
  ['keysteps', '0'],
  ['halfsteps', '1'],
];

var deltas = [
  ['+12', '+12'],
  ['+11', '+11'],
  ['+10', '+10'],
  ['+9', '+9'],
  ['+8', '+8'],
  ['+7', '+7'],
  ['+6', '+6'],
  ['+5', '+5'],
  ['+4', '+4'],
  ['+3', '+3'],
  ['+2', '+2'],
  ['+1', '+1'],
  ['+0', '+0'],
  ['-1', '-1'],
  ['-2', '-2'],
  ['-3', '-3'],
  ['-4', '-4'],
  ['-5', '-5'],
  ['-6', '-6'],
  ['-7', '-7'],
  ['-8', '-8'],
  ['-9', '-9'],
  ['-10', '-10'],
  ['-11', '-11'],
  ['-12', '-12'],
];

function ExpressionInteger(value) {
  this.value = value;
  this.evaluate = function(env) {
    return this.value;
  }
}

function ExpressionPosition(letter, accidental, octave) {
  this.letter = letter;
  this.accidental = accidental;
  this.octave = octave;
  this.evaluate = function(env) {
    env.halfstep = 12 * this.octave.evaluate(env) + this.letter.evaluate(env) + this.accidental.evaluate(env);
    return env.halfstep;
  }
}

function ExpressionDelta(deltaValue, deltaUnit) {
  this.deltaValue = deltaValue;
  this.deltaUnit = deltaUnit;
  this.evaluate = function(env) {
    var value = this.deltaValue.evaluate(env);
    var jump;
    if (this.deltaUnit.value == 1) {
      jump = value;
    } else {
      var majorScaleUp = [2, 0, 2, 0, 1, 2, 0, 2, 0, 2, 0, 1];
      var majorScaleDown = [-1, 0, -2, 0, -2, -1, 0, -2, 0, -2, 0, -2];
      var base = (env.halfstep - env.root + 12) % 12;
      jump = 0;
      if (value > 0) {
        for (var i = 0; i < value; ++i) {
          jump += majorScaleUp[base];
          base = (base + majorScaleUp[base]) % 12;
        }
      } else if (value < 0) {
        for (var i = 0; i < -value; ++i) {
          jump += majorScaleDown[base];
          base = (base + majorScaleDown[base] + 12) % 12;
        }
      }
    }
    env.halfstep += jump;
    return env.halfstep;
  }
}

function ExpressionScale(value) {
  this.value = value;
  this.evaluate = function(env) {
    return this.value;
  }
}

function ExpressionRandom(min, max) {
  this.min = min;
  this.max = max;
  this.evaluate = function(env) {
    var minValue = this.min.evaluate(env);
    var maxValue = this.max.evaluate(env);
    return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
  }
}

function ExpressionReal(value) {
  this.value = value;
  this.evaluate = function(env) {
    return this.value;
  }
}

function ExpressionChord(notes) {
  this.notes = notes;
  this.evaluate = function(env) {
    var ids = this.notes.map(note => note.evaluate(env));
    if (ids.length > 0) {
      env.halfstep = ids[0];
    }
    return ids;
  }
}

function emitNote(env, id, duration, isChord) {
  var alphas = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  var alpha = alphas[id % 12];
  var octave = Math.floor(id / 12);
  var alter;
  if (alpha.length > 1) {
    if (alpha[1] == '#') {
      alter = 1;
    } else {
      alter = -1;
    }
  } else {
    alter = 0;
  }
  // 1 -> 32  | 2 ^ 0 -> 2 ^ 5
  // 2 -> 16  | 2 ^ 1 -> 2 ^ 4
  // 4 -> 8   | 2 ^ 2 -> 2 ^ 3
  // 8 -> 4   | 2 ^ 3 -> 2 ^ 2
  // 16 -> 2  | 2 ^ 4 -> 2 ^ 1
  // 32 -> 1  | 2 ^ 5 -> 2 ^ 0
  // x' = 2 ^ (5 - log2(x))
  // var divisions = 1 << (5 - Math.log2(duration));
  var chord = isChord ? '<chord/>' : '';
  env.xml += '<note>' + chord + '<pitch><step>' + alpha[0] + '</step><alter>' + alter + '</alter><octave>' + octave + '</octave></pitch><type>' + durationToName(duration) + '</type></note>\n';
}

function emitNotes(env, ids, duration) {
  if (!env.hasFirstMeasure) {
    initialMeasure(env);
  }
  if (env.beats == env.beatsPerMeasure) {
    breakMeasure(env);
    env.beats = 0;
  }
  env.beats += 4 / duration;
  // 1 -> 32  | 2 ^ 0 -> 2 ^ 5
  // 2 -> 16  | 2 ^ 1 -> 2 ^ 4
  // 4 -> 8   | 2 ^ 2 -> 2 ^ 3
  // 8 -> 4   | 2 ^ 3 -> 2 ^ 2
  // 16 -> 2  | 2 ^ 4 -> 2 ^ 1
  // 32 -> 1  | 2 ^ 5 -> 2 ^ 0
  // x' = 2 ^ (5 - log2(x))
  // var divisions = 1 << (5 - Math.log2(duration));
  emitNote(env, ids[0], duration, false);
  for (var i = 1; i < ids.length; ++i) {
    emitNote(env, ids[i], duration, true);
  }
}

function durationToName(duration) {
  var durationName = null;
  if (duration == 1) {
    durationName = 'whole';
  } else if (duration == 2) {
    durationName = 'half';
  } else if (duration == 4) {
    durationName = 'quarter';
  } else if (duration == 8) {
    durationName = 'eighth';
  } else if (duration == 16) {
    durationName = '16th';
  } else if (duration == 32) {
    durationName = '32nd';
  }
  return durationName;
}

function StatementRest(duration) {
  this.duration = duration;
  this.evaluate = function(env) {
    if (env.beats == env.beatsPerMeasure) {
      breakMeasure(env);
      env.beats = 0;
    }
    var d = duration.evaluate(env);
    env.beats += 4 / d;
    env.xml += '<note><rest measure="yes"/><duration>' + d + '</duration></note>\n';
  }
}

function StatementReroot() {
  this.evaluate = function(env) {
    env.root = env.halfstep % 12;
  }
}

function StatementTimeSignature(beatsPerMeasure, beatNote) {
  this.beatsPerMeasure = beatsPerMeasure;
  this.beatNote = beatNote;
  this.evaluate = function(env) {
    env.beatsPerMeasure = beatsPerMeasure;
    env.beatNote = beatNote;
  }
}

function StatementKeySignature(letter, accidental, scale) {
  this.letter = letter;
  this.accidental = accidental;
  this.scale = scale;
  this.evaluate = function(env) {
    env.root = this.letter.evaluate(env) + this.accidental.evaluate(env);
    env.scale = this.scale.evaluate(env);
  }
}

function StatementBlock(statements) {
  this.statements = statements;
  this.evaluate = function(env) {
    statements.forEach(statement => statement.evaluate(env));
  }
}

function StatementProgram(block) {
  this.block = block;
  this.evaluate = function(env) {
    env.xml = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n';
    env.xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n';
    env.xml += '<score-partwise version="3.0">\n';
    env.xml += '  <part-list>\n';
    env.xml += '    <score-part id="P1">\n';
    env.xml += '      <part-name>Music</part-name>\n';
    env.xml += '    </score-part>\n';
    env.xml += '  </part-list>\n';
    env.xml += '  <part id="P1">\n';
    env.hasFirstMeasure = false;
    this.block.evaluate(env);
    env.xml += '    </measure>\n';
    env.xml += '  </part>\n';
    env.xml += '</score-partwise>\n';
    $('#scratch').val(env.xml);
  }
}

function initialMeasure(env) {
  env.hasFirstMeasure = true;
  env.xml += '    <measure number="1">\n';
  env.xml += '      <attributes>\n';
  env.xml += '        <divisions>8</divisions>\n';
  env.xml += '        <key>\n';
  env.xml += '          <fifths>0</fifths>\n';
  env.xml += '        </key>\n';
  env.xml += '        <time>\n';
  env.xml += '          <beats>' + env.beatsPerMeasure + '</beats>\n';
  env.xml += '          <beat-type>' + env.beatNote + '</beat-type>\n';
  env.xml += '        </time>\n';
  env.xml += '        <clef>\n';
  env.xml += '          <sign>G</sign>\n';
  env.xml += '          <line>2</line>\n';
  env.xml += '        </clef>\n';
  env.xml += '      </attributes>\n';
}

function StatementTo(block) {
  this.block = block;
  this.evaluate = function(env) {
  }
}

function StatementRepeat(block) {
  this.block = block;
  this.evaluate = function(env) {
    if (env.beats == env.beatsPerMeasure) {
      breakMeasure(env);
      env.beats = 0;
    }
    env.xml += '<barline location="left">\n';
    env.xml += '  <bar-style>heavy-light</bar-style>\n';
    env.xml += '  <repeat direction="forward"/>\n';
    env.xml += '</barline>';
    this.block.evaluate(env);
    env.xml += '<barline location="right">\n';
    env.xml += '  <bar-style>light-heavy</bar-style>\n';
    env.xml += '  <repeat direction="backward"/>\n';
    env.xml += '</barline>';
  }
}

function StatementX(count, block) {
  this.count = count;
  this.block = block;
  this.evaluate = function(env) {
    var n = this.count.evaluate(env);
    for (var i = 0; i < n; ++i) {
      this.block.evaluate(env);
    }
  }
}

function StatementRepeat12(common, first, second) {
  this.common = common;
  this.first = first;
  this.second = second;
  this.evaluate = function(env) {
    if (env.beats == env.beatsPerMeasure) {
      breakMeasure(env);
      env.beats = 0;
    }
    env.xml += '<barline location="left">\n';
    env.xml += '  <bar-style>heavy-light</bar-style>\n';
    env.xml += '  <repeat direction="forward"/>\n';
    env.xml += '</barline>';
    this.common.evaluate(env);
    this.first.evaluate(env);
    env.xml += '<barline location="left">\n';
    env.xml += '  <ending type="start" number="1"/>\n';
    env.xml += '</barline>';
    env.xml += '<barline location="right">\n';
    env.xml += '  <bar-style>light-heavy</bar-style>\n';
    env.xml += '  <repeat direction="backward"/>\n';
    env.xml += '</barline>';
    this.second.evaluate(env);
    env.xml += '<barline location="right">\n';
    env.xml += '  <ending type="discontinue" number="2"/>\n';
    env.xml += '</barline>';
  }
}

function deltaAt(env, delta) {
}

function StatementJump(note) {
  this.note = note;
  this.evaluate = function(env) {
    this.note.evaluate(env);
  }
}

function StatementPlayRelative(deltaValue, deltaUnit, duration) {
  this.deltaValue = deltaValue;
  this.deltaUnit = deltaUnit;
  this.duration = duration;
  this.evaluate = function(env) {
    var ids = new ExpressionDelta(this.deltaValue, this.deltaUnit).evaluate(env);
    if (!Array.isArray(ids)) {
      ids = [ids];
    }
    emitNotes(env, ids, this.duration.evaluate(env));
  }
}

function StatementPlayAbsolute(letter, accidental, octave, duration) {
  this.letter = letter;
  this.accidental = accidental;
  this.octave = octave;
  this.duration = duration;
  this.evaluate = function(env) {
    var ids = new ExpressionPosition(this.letter, this.accidental, this.octave).evaluate(env);
    if (!Array.isArray(ids)) {
      ids = [ids];
    }
    emitNotes(env, ids, this.duration.evaluate(env));
  }
}

function StatementJumpRelative(deltaValue, deltaUnit) {
  this.deltaValue = deltaValue;
  this.deltaUnit = deltaUnit;
  this.evaluate = function(env) {
    var id = new ExpressionDelta(this.deltaValue, this.deltaUnit).evaluate(env);
    env.halfstep = id;
  }
}

function StatementJumpAbsolute(letter, accidental, octave) {
  this.letter = letter;
  this.accidental = accidental;
  this.octave = octave;
  this.evaluate = function(env) {
    var id = new ExpressionPosition(this.letter, this.accidental, this.octave).evaluate(env);
    env.halfstep = id;
  }
}

function StatementPlay(note, duration) {
  this.note = note;
  this.duration = duration;
  this.evaluate = function(env) {
    var ids = this.note.evaluate(env);
    if (!Array.isArray(ids)) {
      ids = [ids];
    }
    emitNotes(env, ids, this.duration.evaluate(env));
  }
}

function slurpStatements(block) {
  var statements = [];
  while (block) {
    statements.push(block.tree());
    block = block.getNextBlock();
  }
  return statements;
}

function slurpBlock(block) {
  return new StatementBlock(slurpStatements(block));
}

function breakMeasure(env) {
  env.xml += '    </measure>\n';
  env.xml += '    <measure number="' + env.iMeasure + '">\n';
  env.xml += '      <attributes>\n';
  env.xml += '        <divisions>8</divisions>\n';
  env.xml += '      </attributes>\n';
  ++env.iMeasure;
}

var blockDefinitions = {
  // Primitives
  integer: {
    configuration: {
      colour: expressionColor,
      output: 'Integer',
      message0: '%1',
      args0: [
        { type: 'field_input', name: 'value', text: '0' },
      ]
    },
    tree: function() {
      return new ExpressionInteger(parseInt(this.getFieldValue('value')));
    }
  },
  delta: {
    configuration: {
      colour: expressionColor,
      output: 'Delta',
      inputsInline: true,
      message0: 'delta %1 %2',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'value' },
        { type: 'input_value', align: 'RIGHT', name: 'unit' },
      ]
    },
    tree: function() {
      return new ExpressionDelta(this.getInputTargetBlock('value').tree(),
                                 this.getInputTargetBlock('unit').tree());
    }
  },
  position: {
    configuration: {
      colour: expressionColor,
      output: 'Position',
      inputsInline: true,
      message0: 'note %1 %2 %3',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'letter' },
        { type: 'input_value', align: 'RIGHT', name: 'accidental' },
        { type: 'input_value', align: 'RIGHT', name: 'octave' },
      ]
    },
    tree: function() {
      var letter = this.getInputTargetBlock('letter').tree();
      var accidental = this.getInputTargetBlock('accidental').tree();
      var octave = this.getInputTargetBlock('octave').tree();
      return new ExpressionPosition(letter, accidental, octave);
    }
  },
  deltaValue: {
    configuration: {
      colour: expressionColor,
      output: 'Integer',
      message0: '%1',
      args0: [
        { type: 'field_dropdown', name: 'value', options: deltas },
      ]
    },
    tree: function() {
      return new ExpressionInteger(parseInt(this.getFieldValue('value')));
    }
  },
  deltaUnit: {
    configuration: {
      colour: expressionColor,
      output: 'DeltaUnit',
      message0: '%1',
      args0: [
        { type: 'field_dropdown', name: 'unit', options: deltaUnits },
      ]
    },
    tree: function() {
      return new ExpressionInteger(parseInt(this.getFieldValue('unit')));
    }
  },
  noteDuration: {
    configuration: {
      colour: expressionColor,
      output: 'NoteDuration',
      message0: '%1',
      args0: [
        { type: 'field_dropdown', name: 'value', options: noteDurations },
      ]
    },
    tree: function() {
      return new ExpressionInteger(parseInt(this.getFieldValue('value')));
    }
  },
  restDuration: {
    configuration: {
      colour: expressionColor,
      output: 'RestDuration',
      message0: '%1',
      args0: [
        { type: 'field_dropdown', name: 'value', options: restDurations },
      ]
    },
    tree: function() {
      return new ExpressionInteger(parseInt(this.getFieldValue('value')));
    }
  },
  accidental: {
    configuration: {
      colour: expressionColor,
      output: 'Accidental',
      message0: '%1',
      args0: [
        { type: 'field_dropdown', name: 'value', options: accidentals },
      ]
    },
    tree: function() {
      return new ExpressionInteger(parseInt(this.getFieldValue('value')));
    }
  },
  letter: {
    configuration: {
      colour: expressionColor,
      output: 'Letter',
      message0: '%1',
      args0: [
        { type: 'field_dropdown', name: 'value', options: letters },
      ]
    },
    tree: function() {
      return new ExpressionInteger(parseInt(this.getFieldValue('value')));
    }
  },
  scale: {
    configuration: {
      colour: expressionColor,
      output: 'Scale',
      message0: '%1',
      args0: [
        { type: 'field_dropdown', name: 'value', options: scales },
      ]
    },
    tree: function() {
      return new ExpressionInteger(parseInt(this.getFieldValue('value')));
    }
  },
  real: {
    configuration: {
      colour: expressionColor,
      output: 'Real',
      message0: '%1',
      args0: [
        { type: 'field_input', name: 'value', text: '0.0' },
      ]
    },
    tree: function() {
      return new ExpressionInteger(parseInt(this.getFieldValue('value')));
    }
  },
  random: {
    configuration: {
      colour: expressionColor,
      output: 'Integer',
      message0: 'random min %1 max %2',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'min' },
        { type: 'input_value', align: 'RIGHT', name: 'max' },
      ]
    },
    tree: function() {
      var min = this.getInputTargetBlock('min').tree();
      var max = this.getInputTargetBlock('max').tree();
      return new ExpressionRandom(min, max);
    }
  },

  // Commands
  timeSignature: {
    configuration: {
      colour: statementColor,
      nextStatement: null,
      inputsInline: true,
      message0: 'time signature %1',
      args0: [
        {
          type: 'field_dropdown',
          name: 'signature',
          options: [
            ['4/4', '4/4'],
            ['3/4', '3/4'],
          ],
        },
      ]
    },
    tree: function() {
      var beatsPerMeasure;
      var beatNote;
      var signature = this.getFieldValue('signature');
      if (signature == '4/4') {
        beatNote = 4;
        beatsPerMeasure = 4;
      } else if (signature == '3/4') {
        beatsPerMeasure = 3;
        beatNote = 4;
      }
      return new StatementTimeSignature(beatsPerMeasure, beatNote);
    }
  },
  keySignature: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      message0: 'key signature %1 %2 %3',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'letter' },
        { type: 'input_value', align: 'RIGHT', name: 'accidental' },
        { type: 'input_value', align: 'RIGHT', name: 'scale' },
      ]
    },
    tree: function() {
      var letter = this.getInputTargetBlock('letter').tree();
      var accidental = this.getInputTargetBlock('accidental').tree();
      var scale = this.getInputTargetBlock('scale').tree();
      return new StatementKeySignature(letter, accidental, scale);
    }
  },
  jump: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      message0: 'jump %1',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'note' },
      ]
    },
    tree: function() {
      var note = this.getInputTargetBlock('note').tree();
      return new StatementJump(note);
    }
  },
  play: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      message0: 'play %1 %2',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'note' },
        { type: 'input_value', align: 'RIGHT', name: 'duration' },
      ]
    },
    tree: function() {
      var note = this.getInputTargetBlock('note').tree();
      var duration = this.getInputTargetBlock('duration').tree();
      return new StatementPlay(note, duration);
    }
  },
  jumpAbsolute: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      message0: 'jump %1 %2 %3',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'letter', check: ['Letter']},
        { type: 'input_value', align: 'RIGHT', name: 'accidental', check: ['Accidental']},
        { type: 'input_value', align: 'RIGHT', name: 'octave', check: ['Integer']},
      ]
    },
    tree: function() {
      return new StatementJumpAbsolute(this.getInputTargetBlock('letter').tree(),
                                       this.getInputTargetBlock('accidental').tree(),
                                       this.getInputTargetBlock('octave').tree());
    }
  },
  jumpRelative: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      message0: 'jump %1 %2',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'deltaValue', check: ['DeltaValue', 'Integer']},
        { type: 'input_value', align: 'RIGHT', name: 'deltaUnit', check: ['DeltaUnit']},
      ]
    },
    tree: function() {
      return new StatementJumpRelative(this.getInputTargetBlock('deltaValue').tree(),
                                       this.getInputTargetBlock('deltaUnit').tree());
    }
  },
  playAbsolute: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      message0: 'play %1 %2 %3 %4',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'letter', check: ['Letter']},
        { type: 'input_value', align: 'RIGHT', name: 'accidental', check: ['Accidental']},
        { type: 'input_value', align: 'RIGHT', name: 'octave', check: ['Integer']},
        { type: 'input_value', align: 'RIGHT', name: 'duration' },
      ]
    },
    tree: function() {
      return new StatementPlayAbsolute(this.getInputTargetBlock('letter').tree(),
                                       this.getInputTargetBlock('accidental').tree(),
                                       this.getInputTargetBlock('octave').tree(),
                                       this.getInputTargetBlock('duration').tree());
    }
  },
  playRelative: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      message0: 'play %1 %2 %3',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'deltaValue', check: ['DeltaValue', 'Integer']},
        { type: 'input_value', align: 'RIGHT', name: 'deltaUnit', check: ['DeltaUnit']},
        { type: 'input_value', align: 'RIGHT', name: 'duration' },
      ]
    },
    tree: function() {
      return new StatementPlayRelative(this.getInputTargetBlock('deltaValue').tree(),
                                       this.getInputTargetBlock('deltaUnit').tree(),
                                       this.getInputTargetBlock('duration').tree());
    }
  },
  rest: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      message0: 'rest %1',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'duration' },
      ]
    },
    tree: function() {
      var duration = this.getInputTargetBlock('duration').tree();
      return new StatementRest(duration);
    }
  },
  formalParameter: {
    configuration: {
      isMovable: false,
      colour: parameterColor,
      output: null,
      inputsInline: true,
      mutator: 'configureFormal',
      message0: '%1 %2',
      args0: [
        { type: 'field_input', name: 'identifier', text: '' },
        { type: 'field_label', name: 'modeArrow', text: '\u2190' },
      ]
    },
    deltaphone: {
      mode: null, // action or value
    },
  },
  actualParameter: {
    configuration: {
      colour: expressionColor,
      output: null,
      inputsInline: true,
      message0: '%1',
      mutator: 'configureActual',
      args0: [
        { type: 'field_label', name: 'identifier', text: '' },
      ]
    },
    deltaphone: {
      formalBlockId: null,
      identifier: null,
      mode: null,
    },
  },

  // Control
  to: {
    configuration: {
      colour: statementColor,
      // previousStatement: null,
      // nextStatement: null,
      message0: 'to %1',
      args0: [
        { type: 'field_input', name: 'identifier', text: '' },
      ],
      message1: '%1',
      args1: [
        { type: 'input_statement', name: 'body' },
      ],
      mutator: 'setParameters',
      extensions: ['parameterize'],
      inputsInline: true,
    },
    deltaphone: {
    },
    initializeState: function() {
      console.log("INITING................................................");
      this.deltaphone.parameters = [];
    },
    tree: function() {
      var bodyBlock = this.getInputTargetBlock('body');
      return new StatementTo(slurpBlock(bodyBlock));
    }
  },
  repeat: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'repeat %1',
      args0: [
        { type: 'input_statement', name: 'body' },
      ]
    },
    tree: function() {
      var bodyBlock = this.getInputTargetBlock('body');
      return new StatementRepeat(slurpBlock(bodyBlock));
    }
  },
  chord: {
    configuration: {
      colour: expressionColor,
      output: 'Chord',
      message0: 'chord %1 %2 %3',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'element0', check: ['Delta', 'Position'] },
        { type: 'input_value', align: 'RIGHT', name: 'element1', check: ['Delta', 'Position'] },
        { type: 'input_value', align: 'RIGHT', name: 'element2', check: ['Delta', 'Position'] },
      ],
      mutator: 'setArity',
      extensions: ['addArityMenuItem'],
    },
    deltaphone: {
      arity: 3,
      elementType: 'Chord',
    },
    tree: function() {
      var deltas = [];
      for (var i = 0; i < this.deltaphone.arity; ++i) {
        var element = this.getInputTargetBlock('element' + i);
        deltas.push(element.tree());
      }
      return new ExpressionChord(deltas);
    }
  },
  repeat12: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'repeat %1 1. %2 2. %3',
      args0: [
        { type: 'input_statement', align: 'LEFT', name: 'common' },
        { type: 'input_statement', align: 'RIGHT', name: 'first' },
        { type: 'input_statement', align: 'RIGHT', name: 'second' },
      ]
    },
    tree: function() {
      var commonBlock = slurpBlock(this.getInputTargetBlock('common'));
      var firstBlock = slurpBlock(this.getInputTargetBlock('first'));
      var secondBlock = slurpBlock(this.getInputTargetBlock('second'));
      return new StatementRepeat12(commonBlock, firstBlock, secondBlock);
    }
  },
  reroot: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'reroot',
    },
    tree: function() {
      return new StatementReroot();
    }
  },
  ditto: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      message0: 'ditto %1 %2',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'count' },
        { type: 'input_statement', align: 'RIGHT', name: 'body' },
      ]
    },
    tree: function() {
      var countBlock = this.getInputTargetBlock('count');
      var bodyBlock = this.getInputTargetBlock('body');
      return new StatementX(countBlock.tree(), slurpBlock(bodyBlock));
    }
  },
};

function formalize(identifier) {
  return '_' + identifier;
}

function initializeBlock(id) {
  var definition = blockDefinitions[id];
  Blockly.Blocks[id] = {
    init: function() {
      this.jsonInit(definition.configuration);
      if (definition.configuration.hasOwnProperty('isMovable')) {
        this.setMovable(definition.configuration.isMovable);
      }
      if (definition.hasOwnProperty('deltaphone') ||
          definition.hasOwnProperty('initializeState')) {
        this.deltaphone = Object.assign({}, definition.deltaphone);
        if (definition.hasOwnProperty('initializeState')) {
          definition.initializeState.apply(this);
        }
      }
    },
    tree: definition.tree
  };
}

function mutateUndoably(block, mutate, callback = null) {
  console.log("undoably");
  var oldMutation = block.mutationToDom();
  mutate();
  var newMutation = block.mutationToDom();
  block.domToMutation(newMutation);
  console.log("done mut");
  var event = new Blockly.Events.BlockChange(block, 'mutation', null, Blockly.Xml.domToText(oldMutation), Blockly.Xml.domToText(newMutation));
  Blockly.Events.fire(event);
  console.log("callback");
  if (callback) {
    callback();
  }
}

function triggerArity(block, arity) {
  mutateUndoably(block, () => {
    block.deltaphone.arity = arity;
  });
}

function addParameter(block, mode) {
  var identifier = 'newparam';

  mutateUndoably(block, () => {
    block.deltaphone.parameters.push({identifier: identifier, mode: mode});
  }, () => {
    var parameterBlock = workspace.newBlock('formalParameter');
    parameterBlock.getField('identifier').setText(identifier);

    parameterBlock.deltaphone.mode = mode;
    syncModeArrow(parameterBlock);

    var input = block.getInput(formalize(identifier));
    input.connection.connect(parameterBlock.outputConnection);

    parameterBlock.initSvg();
    parameterBlock.render();
    parameterBlock.select();
    parameterBlock.getField('identifier').showEditor_();
  });
}

function syncModeArrow(block) {
  var arrow = block.deltaphone.mode == 'action' ? '\u2193' : '\u2190';
  // var arrow = '\uFF0B';
  block.getField('modeArrow').setText(arrow);
}

function syncActual(block) {
  if (block.deltaphone.mode == 'action') {
    block.setOutput(false);
    block.setPreviousStatement(true);
    block.setNextStatement(true);
    block.setColour(statementColor);
  } else {
    block.setOutput(true);
    block.setPreviousStatement(false);
    block.setNextStatement(false);
    block.setColour(expressionColor);
  }
}

function setup() {
  // Initialize blocks.
  for (var id in blockDefinitions) {
    if (blockDefinitions.hasOwnProperty(id)) {
      initializeBlock(id);
    }
  }

  Blockly.Extensions.register('parameterize', function() {
    var block = this;
    this.mixin({
      customContextMenu: function(options) {
        var option = {
          enabled: true,
          text: 'Add value parameter...',
          callback: function() {
            addParameter(block, 'value');
          }
        };
        options.push(option);

        var option = {
          enabled: true,
          text: 'Add action parameter...',
          callback: function() {
            addParameter(block, 'action');
          }
        };
        options.push(option);
      }
    });
  });

  Blockly.Extensions.register('addArityMenuItem', function() {
    var block = this;
    this.mixin({
      customContextMenu: function(options) {
        var option = {
          enabled: true,
          text: 'Change number...',
          callback: function() {
            var size = prompt('How many notes are in the chord?');
            if (new RegExp(/^\d+/).test(size)) {
              triggerArity(block, parseInt(size));
            }
          }
        };
        options.push(option);
      }
    });
  });

  Blockly.Extensions.registerMutator('setParameters', {
    mutationToDom: function() {
      var parametersNode = document.createElement('parameters');

      for (var parameter of this.deltaphone.parameters) {
        var parameterNode = document.createElement('parameter');
        parameterNode.setAttribute('identifier', parameter.identifier);
        parameterNode.setAttribute('mode', parameter.mode);
        parametersNode.appendChild(parameterNode);
      }

      var container = document.createElement('mutation');
      container.appendChild(parametersNode);
      return container;
    },
    // From XML to blocks.
    domToMutation: function(xml) {
      this.deltaphone.parameters = [];

      // Populate metadata model.
      for (var child of xml.children) {
        if (child.nodeName.toLowerCase() == 'parameters') {
          for (var parameterNode of child.children) {
            var identifier = parameterNode.getAttribute('identifier');
            var mode = parameterNode.getAttribute('mode');
            this.deltaphone.parameters.push({ identifier: identifier, mode: mode });
          }
        }
      }

      // Remove any existing inputs, but save the block in case it
      // will need to get reconnected.
      var oldFormalBlocks = [];
      while (this.inputList.length > 2) {
        var input = this.inputList[this.inputList.length - 2];
        oldFormalBlocks.push(input.connection.targetBlock());
        this.removeInput(input.name);
      }

      // Add inputs from model.
      for (var parameter of this.deltaphone.parameters) {
        var input = this.appendValueInput(formalize(parameter.identifier));
        this.moveNumberedInputBefore(this.inputList.length - 1, this.inputList.length - 2);
      }

      // Traverse previous blocks, disposing of unused ones and reconnecting
      // persistent ones.
      for (var oldFormalBlock of oldFormalBlocks) {
        var identifier = oldFormalBlock.getField('identifier').getText();
        if (this.getInput(formalize(identifier))) {
          this.getInput(formalize(identifier)).connection.connect(oldFormalBlock.outputConnection);
        } else {
          oldFormalBlock.dispose();
        }
      }
    },
  });

  Blockly.Extensions.registerMutator('configureFormal', {
    mutationToDom: function() {
      var container = document.createElement('mutation');
      container.setAttribute('mode', this.deltaphone.mode);
      return container;
    },
    domToMutation: function(xml) {
      this.deltaphone.mode = xml.getAttribute('mode');
      syncModeArrow(this);
    }
  });

  Blockly.Extensions.registerMutator('configureActual', {
    mutationToDom: function() {
      var container = document.createElement('mutation');
      container.setAttribute('mode', this.deltaphone.mode);
      container.setAttribute('identifier', this.deltaphone.identifier);
      console.log("container:", container);
      return container;
    },
    domToMutation: function(xml) {
      console.log("xml:", xml);
      this.deltaphone.mode = xml.getAttribute('mode');
      this.deltaphone.identifier = xml.getAttribute('identifier');
      this.getField('identifier').setText(this.deltaphone.identifier);
      syncActual(this);
    }
  });

  Blockly.Extensions.registerMutator('setArity', {
    mutationToDom: function() {
      var container = document.createElement('mutation');
      container.setAttribute('arity', this.deltaphone.arity);
      return container;
    },
    domToMutation: function(xml) {
      var expectedArity = xml.getAttribute('arity');
      var actualArity = this.getInput('empty') ? 0 : this.inputList.length;
      this.deltaphone.arity = expectedArity;

      if (expectedArity > 0 && actualArity == 0) {
        this.removeInput('empty');
      } else if (expectedArity == 0 && actualArity > 0) {
        this.appendDummyInput('empty')
            .appendField(this.type);
      }

      // Currently there are more than we need. Trim off extras.
      if (actualArity > expectedArity) {
        for (var i = actualArity - 1; i >= expectedArity; --i) {
          this.removeInput('element' + i);
        }
      }
      
      // Currently there are fewer than we need. Add missing.
      else if (actualArity < expectedArity) {
        for (var i = actualArity; i < expectedArity; ++i) {
          var input = this.appendValueInput('element' + i, );
          if (i == 0) {
            input.appendField(this.type);
          }
          if (this.deltaphone.elementType) {
            input.setCheck(this.deltaphone.elementType);
          }
        }
      }
    }
  });

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
  
  // Blockly recently added support for custom context menus. See
  // https://github.com/google/blockly/pull/1710 for details.
  workspace.configureContextMenu = options => {
    var option = {
      enabled: true,
      text: 'Copy',
      callback: copyWorkspace,
    };
    options.push(option);

    var option = {
      enabled: true,
      text: 'Paste',
      callback: pasteWorkspace,
    };
    options.push(option);
  };

  $('#playButton').click(() => {
    $('#score').alphaTab('playPause');
  });

  var last = localStorage.getItem('last');
  if (last) {
    last = Blockly.Xml.textToDom(last);
    console.log("last:", last);
    Blockly.Xml.domToWorkspace(last, workspace);
  }

  $('#score').alphaTab({
    staves: 'score',
    displayTranspositionPitches: [12],
    layout: {
      mode: 'page',
      additionalSettings: {
        hideTuning: true,
        hideTrackNames: true
      }
    }
  });

  workspace.addChangeListener(event => {
    if (event.type == Blockly.Events.CHANGE && event.element == 'field') {
      var block = workspace.getBlockById(event.blockId); 
      if (block.type == 'formalParameter') {
        renameFormal(block, event.oldValue, event.newValue);
      }
    }

    // We want to handle a selection of a formal parameter by generating an
    // actual parameter that can be referenced in the body. The event we care
    // about has some compound logic to it. It must be a UI selected element
    // event. The selection is being made if its newValue property is set,
    // which is the ID of the formal parameter block. But formal parameters
    // selected right after they are added, so we further require that a
    // gesture be in progress. No gesture is in progress when a parameter is
    // freshly added.
    else if (event.type == Blockly.Events.UI) {
      if (event.hasOwnProperty('element') && event.element == 'selected') {
        if (event.newValue && workspace.currentGesture_ && workspace.currentGesture_.startField_ == null) {
          var formalBlock = workspace.getBlockById(event.newValue); 
          if (formalBlock.type == 'formalParameter') {
            var identifier = formalBlock.getField('identifier').getText();
            var actualBlock = workspace.newBlock('actualParameter');

            actualBlock.deltaphone.mode = formalBlock.deltaphone.mode;
            actualBlock.deltaphone.identifier = identifier;
            syncActual(actualBlock);

            actualBlock.getField('identifier').setText(identifier);
            actualBlock.deltaphone.formalBlockId = event.newValue;

            var actualLocation = actualBlock.getRelativeToSurfaceXY();
            var mouse = workspace.currentGesture_.mouseDownXY_;

            var point = Blockly.utils.mouseToSvg({clientX: mouse.x, clientY: mouse.y}, workspace.getParentSvg(), workspace.getInverseScreenCTM());
            var rel = workspace.getOriginOffsetInPixels();
            var mouseX = (point.x - rel.x) / workspace.scale;
            var mouseY = (point.y - rel.y) / workspace.scale;

            actualBlock.initSvg();
            actualBlock.render();
            actualBlock.select();
            actualBlock.bringToFront();

            actualBlock.moveBy(mouseX - actualLocation.x - actualBlock.width / 2, mouseY - actualLocation.y - actualBlock.height / 2);

            workspace.currentGesture_.setStartBlock(actualBlock);
            workspace.currentGesture_.setTargetBlock_(actualBlock);
          }
        }
      }
    }
    
    if (event.type == Blockly.Events.BLOCK_CHANGE ||
        event.type == Blockly.Events.BLOCK_DELETE ||
        event.type == Blockly.Events.BLOCK_CREATE ||
        event.type == Blockly.Events.BLOCK_MOVE) {
      saveLocal();
      // console.log('reinterpret');
      // interpret();
    }
  });
}

function renameFormal(formalBlock, oldIdentifier, newIdentifier) {
  var parent = formalBlock.getParent();

  // Rename parent's input.
  for (var i = 1; i < parent.inputList.length - 1; ++i) {
    if (parent.inputList[i].name == formalize(oldIdentifier)) {
      parent.inputList[i].name = formalize(newIdentifier);
    }
  }

  // Update parent's meta.
  for (var parameter of parent.deltaphone.parameters) {
    if (parameter.identifier == oldIdentifier) {
      parameter.identifier = newIdentifier;
      break;
    }
  }

  // Rename all actualParameter children
  for (var root of workspace.getTopBlocks()) {
    renameActuals(root, formalBlock.id, newIdentifier);
  }
}

function renameActuals(root, formalBlockId, newIdentifier) {
  if (root.type == 'actualParameter' && root.deltaphone.formalBlockId == formalBlockId) {
    root.getField('identifier').setText(newIdentifier);
  } else {
    for (var child of root.getChildren()) {
      renameActuals(child, formalBlockId, newIdentifier);
    }
  }
}

$(document).ready(setup);

function saveLocal() {
  var xml = Blockly.Xml.workspaceToDom(workspace);
  xml = Blockly.Xml.domToPrettyText(xml);
  console.log('xml:', xml);
  localStorage.setItem('last', xml);
}

function interpret() {
  saveLocal();

  var roots = workspace.getTopBlocks();
  var statements = [];
  roots.forEach(root => {
    while (root) {
      statements.push(root.tree());
      root = root.getNextBlock();
    }
  });
  var program = new StatementProgram(new StatementBlock(statements));

  var env = {
    isChord: false,
    root: 0,
    scale: 'major',
    iMeasure: 2,
    beats: 0,
    halfstep: 48,
    beatsPerMeasure: 4,
    beatNote: 4,
  };
  program.evaluate(env);
  render();
}

function render() {
  var musicXML = $('#scratch').val();
  musicXML = new TextEncoder().encode(musicXML);
  $('#score').alphaTab('load', musicXML);
  // $('#score').alphaTab('load', 'foo.xml');
}

function workspaceToXml() {
  var xml = Blockly.Xml.workspaceToDom(workspace);
  return Blockly.Xml.domToPrettyText(xml);
}

function copyWorkspace() {
  // var staging = document.createElement('textarea');
  // staging.value = workspaceToXml();
  // document.body.appendChild(staging);
  // staging.focus();
  // staging.select();
  // try {
    // var isSuccessful = document.execCommand('copy');
    // console.log('isSuccessful:', isSuccessful);
  // } catch (error) {
    // console.log('error:', error);
  // }
  // document.body.removeChild(staging);
  
  // The clipboard API is new. See https://developers.google.com/web/updates/2018/03/clipboardapi.
  var xml = workspaceToXml();
  navigator.clipboard.writeText(xml)
    .then(() => {
      console.log('Copied.');
    })
    .catch(error => {
      console.log('error:', error);
    });
}

function pasteWorkspace() {
  navigator.clipboard.readText()
    .then(xml => {
      console.log('xml:', xml);
      var dom = Blockly.Xml.textToDom(xml);
      Blockly.Xml.domToWorkspace(dom, workspace);
    })
    .catch(error => {
      console.log('error:', error);
    });
}
