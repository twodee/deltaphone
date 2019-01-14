let workspace = null;

let expressionColor = 270;
let statementColor = 180;
let parameterColor = 330;
let lastWarnedBlock = null;
let scoreRoot;

let letters = [
  ['C', '0'],
  ['D', '2'],
  ['E', '4'],
  ['F', '5'],
  ['G', '7'],
  ['A', '9'],
  ['B', '11'],
];

let octaves = [
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

let accidentals = [
  ['\u266f', '1'],
  ['\u266e', '0'],
  ['\u266d', '-1'],
];

let scales = [
  ['major', 'major'],
  ['minor', 'minor'],
];

let noteDurations = [
  [{'src': 'images/music/note1.svg', 'width': 13, 'height': 5, 'alt': 'Whole'}, '1'],
  [{'src': 'images/music/note2.svg', 'width': 9, 'height': 20, 'alt': 'Half'}, '2'],
  [{'src': 'images/music/note4.svg', 'width': 9, 'height': 20, 'alt': 'Quarter'}, '4'],
  [{'src': 'images/music/note8.svg', 'width': 14, 'height': 20, 'alt': 'Eighth'}, '8'],
  [{'src': 'images/music/note16.svg', 'width': 14, 'height': 20, 'alt': 'Sixteenth'}, '16'],
  [{'src': 'images/music/note32.svg', 'width': 14, 'height': 24, 'alt': 'Thirty-second'}, '32'],
  [{'src': 'images/music/note2_dotted.svg', 'width': 9, 'height': 20, 'alt': 'Dotted Half'}, '-2'],
  [{'src': 'images/music/note4_dotted.svg', 'width': 9, 'height': 20, 'alt': 'Dotted Quarter'}, '-4'],
  [{'src': 'images/music/note8_dotted.svg', 'width': 14, 'height': 20, 'alt': 'Dotted Eighth'}, '-8'],
  [{'src': 'images/music/note16_dotted.svg', 'width': 14, 'height': 20, 'alt': 'Dotted Sixteenth'}, '-16'],
  [{'src': 'images/music/note32_dotted.svg', 'width': 14, 'height': 24, 'alt': 'Dotted Thirty-second'}, '-32'],
];

let restDurations = [
  [{'src': 'images/rest1.svg', 'width': 15, 'height': 12, 'alt': 'Whole'}, '1'],
  [{'src': 'images/rest2.svg', 'width': 15, 'height': 12, 'alt': 'Half'}, '2'],
  [{'src': 'images/rest4.svg', 'width': 8, 'height': 20, 'alt': 'Quarter'}, '4'],
  [{'src': 'images/rest8.svg', 'width': 8, 'height': 16, 'alt': 'Eighth'}, '8'],
  [{'src': 'images/rest16.svg', 'width': 10, 'height': 20, 'alt': 'Sixteenth'}, '16'],
  [{'src': 'images/rest32.svg', 'width': 12, 'height': 25, 'alt': 'Thirty-second'}, '32'],
];

let deltaUnits = [
  ['keysteps', '0'],
  ['halfsteps', '1'],
];

let deltas = [
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

class Song {
  constructor() {
    this.items = [];
  }

  toXML(env) {
    let xml = '';
    xml  = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n';
    xml += '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n';
    xml += '<score-partwise version="3.0">\n';
    xml += '  <part-list>\n';
    xml += '    <score-part id="P1">\n';
    xml += '      <part-name>Music</part-name>\n';
    xml += '    </score-part>\n';
    xml += '  </part-list>\n';
    xml += '  <part id="P1">\n';
    xml += '    <measure number="1">\n';
    xml += '      <attributes>\n';
    xml += '        <divisions>8</divisions>\n';
    xml += '        <key>\n';
    xml += '          <fifths>0</fifths>\n';
    xml += '        </key>\n';
    xml += '        <time>\n';
    xml += '          <beats>' + env.beatsPerMeasure + '</beats>\n';
    xml += '          <beat-type>' + env.beatNote + '</beat-type>\n';
    xml += '        </time>\n';
    xml += '        <clef>\n';
    xml += '          <sign>G</sign>\n';
    xml += '          <line>2</line>\n';
    xml += '        </clef>\n';
    xml += '      </attributes>\n';

    for (let item of this.items) {
      xml += item.toXML(env);
    }

    xml += '    </measure>\n';
    xml += '  </part>\n';
    xml += '</score-partwise>\n';

    return xml;
  }

  push(item) {
    this.items.push(item);
  }
}

class Sequence {
  constructor() {
    this.items = [];
  }

  toXML(env) {
    let xml = '';

    if (env.beats == env.beatsPerMeasure) {
      xml += breakMeasure(env);
      env.beats = 0;
    }

    for (let item of this.items) {
      xml += item.toXML(env);
    }

    return xml;
  }

  push(item) {
    this.items.push(item);
  }

  markFirstNote(item) {
    for (let item of this.items) {
      if (item.markFirstNote()) {
        return true;
      }
    }
    return false;
  }

  markLastNote(item) {
    for (let i = this.items.length - 1; i >= 0; --i) {
      let item = this.items[i];
      if (item.markLastNote()) {
        return true;
      }
    }
    return false;
  }

  markMiddleNotes(item) {
    for (let item of this.items) {
      item.markMiddleNotes();
    }
  }
}

class Slur {
  constructor() {
    this.items = [];
  }

  toXML(env) {
    let xml = '';

    if (env.beats == env.beatsPerMeasure) {
      xml += breakMeasure(env);
      env.beats = 0;
    }

    this.markFirstNote();
    this.markLastNote();
    this.markMiddleNotes();

    env.isSlur = true;
    for (let item of this.items) {
      xml += item.toXML(env);
    }
    env.isSlur = false;

    return xml;
  }

  push(item) {
    this.items.push(item);
  }

  markFirstNote(item) {
    for (let item of this.items) {
      if (item.markFirstNote()) {
        return true;
      }
    }
    return false;
  }

  markLastNote(item) {
    for (let i = this.items.length - 1; i >= 0; --i) {
      let item = this.items[i];
      if (item.markLastNote()) {
        return true;
      }
    }
    return false;
  }

  markMiddleNotes(item) {
    for (let item of this.items) {
      item.markMiddleNotes();
    }
  }
}

class Repeat12 {
  constructor(common, first, second) {
    this.items = [];
    this.common = common;
    this.first = first;
    this.second = second;
  }

  toXML(env) {
    let xml = '';

    if (env.beats == env.beatsPerMeasure) {
      xml += breakMeasure(env);
      env.beats = 0;
    }

    xml += '<barline location="left">\n';
    xml += '  <bar-style>heavy-light</bar-style>\n';
    xml += '  <repeat direction="forward"/>\n';
    xml += '</barline>';

    xml += this.common.toXML(env);

    if (env.beats == env.beatsPerMeasure) {
      xml += breakMeasure(env);
      env.beats = 0;
    }

    xml += '<barline location="left">\n';
    xml += '  <ending type="start" number="1"/>\n';
    xml += '</barline>';

    xml += this.first.toXML(env);

    xml += '<barline location="right">\n';
    xml += '  <bar-style>light-heavy</bar-style>\n';
    xml += '  <repeat direction="backward"/>\n';
    xml += '</barline>';

    xml += this.second.toXML(env);

    xml += '<barline location="right">\n';
    xml += '  <ending type="discontinue" number="2"/>\n';
    xml += '</barline>';

    return xml;
  }
}

class Repeat {
  constructor() {
    this.items = [];
  }

  toXML(env) {
    let xml = '';

    if (env.beats == env.beatsPerMeasure) {
      xml += breakMeasure(env);
      env.beats = 0;
    }

    xml += '<barline location="left">\n';
    xml += '  <bar-style>heavy-light</bar-style>\n';
    xml += '  <repeat direction="forward"/>\n';
    xml += '</barline>';

    for (let item of this.items) {
      xml += item.toXML(env);
    }

    xml += '<barline location="right">\n';
    xml += '  <bar-style>light-heavy</bar-style>\n';
    xml += '  <repeat direction="backward"/>\n';
    xml += '</barline>';

    return xml;
  }

  push(item) {
    this.items.push(item);
  }
}

class Chord {
  constructor(notes) {
    this.notes = notes;
    for (let note of notes.slice(1)) {
      note.isChord = true;
    }
  }

  toXML(env) {
    return this.notes.map(note => note.toXML(env)).join('\n');
  }
}

class Note {
  constructor(id, duration) {
    this.id = id;
    this.isDotted = duration < 0;
    this.duration = Math.abs(duration);
    this.isChord = false;
    this.isFirstNote = false;
    this.isLastNote = false;
    this.isMiddleNote = false;
  }

  toXML(env) {
    let xml = '';

    if (!this.isChord) {
      if (env.beats == env.beatsPerMeasure) {
        xml += breakMeasure(env);
        env.beats = 0;
      }
      env.beats += 4 / this.duration;
      if (this.isDotted) {
        // 4 -> 4 / 4 + 4 / (4 * 2) -> 1 + 0.5
        env.beats += 4 / (this.duration * 2);
      }
    }

    let alphas = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
    let alpha = alphas[this.id % 12];
    let octave = Math.floor(this.id / 12);
    let alter;
    if (alpha.length > 1) {
      if (alpha[1] == '#') {
        alter = 1;
      } else {
        alter = -1;
      }
    } else {
      alter = 0;
    }

    xml += '<note><pitch><step>' + alpha[0] + '</step><alter>' + alter + '</alter><octave>' + octave + '</octave></pitch><type>' + durationToName(this.duration) + '</type>';

    if (this.isChord) {
      xml += '<chord/>';
    }

    if (this.isDotted) {
      xml += '<dot/>';
    }

    if (env.isSlur) {
      if (this.isFirstNote) {
        xml += '<notations><slur type="start"/></notations>';
      } else if (this.isMiddleNote) {
        xml += '<notations><slur type="continue"/></notations>';
      } else if (this.isLastNote) {
        xml += '<notations><slur type="stop"/></notations>';
      }
    }

    xml += '</note>\n';

    return xml;
  }

  markFirstNote(item) {
    this.isFirstNote = true;
    return true;
  }

  markLastNote(item) {
    this.isLastNote = true;
    return true;
  }

  markMiddleNotes(item) {
    this.isMiddleNote = !this.isFirstNote && !this.isLastNote;
  }
}

class Rest {
  constructor(duration) {
    this.duration = duration;
  }

  toXML(env) {
    let xml = '';
    if (env.beats == env.beatsPerMeasure) {
      xml += breakMeasure(env);
      env.beats = 0;
    }
    env.beats += 4 / duration;
    xml += '<note><rest measure="yes"/><duration>' + duration + '</duration></note>\n';
    return xml;
  }
}

class ExpressionBoolean {
  constructor(value) {
    this.value = value;
  }

  evaluate(env) {
    return this;
  }

  toInteger() {
    return this.value ? 1 : 0;
  }

  toBoolean() {
    return this.value;
  }

  toString() {
    return '' + this.value;
  }
}

class ExpressionInteger {
  constructor(value) {
    this.value = value;
  }

  evaluate(env) {
    return this;
  }

  toInteger() {
    return this.value;
  }

  toBoolean() {
    return this.value == 0 ? false : true;
  }

  toString() {
    return '' + this.value;
  }
}

class ExpressionPosition {
  constructor(letter, accidental, octave) {
    this.letter = letter;
    this.accidental = accidental;
    this.octave = octave;
  }

  evaluate(env) {
    env.halfstep = 12 * this.octave.evaluate(env).toInteger() + this.letter.evaluate(env).toInteger() + this.accidental.evaluate(env).toInteger();
    return new ExpressionInteger(env.halfstep);
  }
}

class ExpressionDelta {
  constructor(deltaValue, deltaUnit) {
    this.deltaValue = deltaValue;
    this.deltaUnit = deltaUnit;
  }

  evaluate(env) {
    let value = this.deltaValue.evaluate(env).toInteger();
    let jump;
    if (this.deltaUnit.value == 1) {
      jump = value;
    } else {
      let majorScaleUp = [2, 0, 2, 0, 1, 2, 0, 2, 0, 2, 0, 1];
      let majorScaleDown = [-1, 0, -2, 0, -2, -1, 0, -2, 0, -2, 0, -2];
      let base = (env.halfstep - env.root + 12) % 12;
      jump = 0;
      if (value > 0) {
        for (let i = 0; i < value; ++i) {
          jump += majorScaleUp[base];
          base = (base + majorScaleUp[base]) % 12;
        }
      } else if (value < 0) {
        for (let i = 0; i < -value; ++i) {
          jump += majorScaleDown[base];
          base = (base + majorScaleDown[base] + 12) % 12;
        }
      }
    }
    env.halfstep += jump;
    return new ExpressionInteger(env.halfstep);
  }
}

class ExpressionScale {
  constructor(value) {
    this.value = value;
  }

  evaluate(env) {
    return this;
  }

  toInteger() {
    return this.value == 'major' ? 0 : 1;
  }
}

class ExpressionAdd {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  evaluate(env) {
    let valueA = this.a.evaluate(env).toInteger();
    let valueB = this.b.evaluate(env).toInteger();
    return new ExpressionInteger(valueA + valueB);
  }
}

class ExpressionSubtract {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  evaluate(env) {
    let valueA = this.a.evaluate(env).toInteger();
    let valueB = this.b.evaluate(env).toInteger();
    return new ExpressionInteger(valueA - valueB);
  }
}

class ExpressionMultiply {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  evaluate(env) {
    let valueA = this.a.evaluate(env).toInteger();
    let valueB = this.b.evaluate(env).toInteger();
    return new ExpressionInteger(valueA * valueB);
  }
}

class ExpressionDivide {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  evaluate(env) {
    let valueA = this.a.evaluate(env).toInteger();
    let valueB = this.b.evaluate(env).toInteger();
    return new ExpressionInteger(Math.floor(valueA / valueB));
  }
}

class ExpressionRemainder {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  evaluate(env) {
    let valueA = this.a.evaluate(env).toInteger();
    let valueB = this.b.evaluate(env).toInteger();
    return new ExpressionInteger(valueA % valueB);
  }
}

class ExpressionPower {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  evaluate(env) {
    let valueA = this.a.evaluate(env).toInteger();
    let valueB = this.b.evaluate(env).toInteger();
    return new ExpressionInteger(Math.pow(valueA, valueB));
  }
}

// Logic ----------------------------------------------------------------------

class ExpressionLess {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  evaluate(env) {
    let valueA = this.a.evaluate(env).toInteger();
    let valueB = this.b.evaluate(env).toInteger();
    return new ExpressionBoolean(valueA < valueB);
  }
}

class ExpressionLessEqual {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  evaluate(env) {
    let valueA = this.a.evaluate(env).toInteger();
    let valueB = this.b.evaluate(env).toInteger();
    return new ExpressionBoolean(valueA <= valueB);
  }
}

class ExpressionMore {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  evaluate(env) {
    let valueA = this.a.evaluate(env).toInteger();
    let valueB = this.b.evaluate(env).toInteger();
    return new ExpressionBoolean(valueA > valueB);
  }
}

class ExpressionMoreEqual {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  evaluate(env) {
    let valueA = this.a.evaluate(env).toInteger();
    let valueB = this.b.evaluate(env).toInteger();
    return new ExpressionBoolean(valueA >= valueB);
  }
}

class ExpressionEqual {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  evaluate(env) {
    let valueA = this.a.evaluate(env).toInteger();
    let valueB = this.b.evaluate(env).toInteger();
    return new ExpressionBoolean(valueA == valueB);
  }
}

class ExpressionNotEqual {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  evaluate(env) {
    let valueA = this.a.evaluate(env).toInteger();
    let valueB = this.b.evaluate(env).toInteger();
    return new ExpressionBoolean(valueA != valueB);
  }
}

// ----------------------------------------------------------------------------

class ExpressionRandom {
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }

  evaluate(env) {
    let minValue = this.min.evaluate(env).toInteger();
    let maxValue = this.max.evaluate(env).toInteger();
    return new ExpressionInteger(Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue);
  }
}

class ExpressionReal {
  constructor(value) {
    this.value = value;
  }

  evaluate(env) {
    return this;
  }

  toReal(env) {
    return this.value;
  }

  toString() {
    return '' + this.value;
  }
}

class ExpressionChord {
  constructor(notes) {
    this.notes = notes;
  }

  evaluate(env) {
    let ids = this.notes.map(note => note.evaluate(env).toInteger());
    if (ids.length > 0) {
      env.halfstep = ids[0];
    }
    return ids;
  }
}

function durationToName(duration) {
  let durationName = null;
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

class StatementPrint {
  constructor(message) {
    this.message = message;
  }

  evaluate(env) {
    console.log(this.message.evaluate(env).toString());
  }
}

class StatementRest {
  constructor(duration) {
    this.duration = duration;
  }

  evaluate(env) {
    let durationValue = this.duration.evaluate(env).toInteger();
    env.emit(new Rest(durationValue));
  }
}

class StatementReroot {
  constructor() {
  }

  evaluate(env) {
    env.root = env.halfstep % 12;
  }
}

class StatementMark {
  constructor() {
  }

  evaluate(env) {
    env.marks.push(env.halfstep);
  }
}

class StatementBack {
  constructor() {
  }

  evaluate(env) {
    env.halfstep = env.marks[env.marks.length - 1];
  }
}

class StatementUnmark {
  constructor() {
  }

  evaluate(env) {
    env.marks.pop();
  }
}

class StatementTimeSignature {
  constructor(beatsPerMeasure, beatNote) {
    this.beatsPerMeasure = beatsPerMeasure;
    this.beatNote = beatNote;
  }

  evaluate(env) {
    env.beatsPerMeasure = this.beatsPerMeasure;
    env.beatNote = this.beatNote;
  }
}

class StatementKeySignature {
  constructor(letter, accidental, scale) {
    this.letter = letter;
    this.accidental = accidental;
    this.scale = scale;
  }

  evaluate(env) {
    env.root = this.letter.evaluate(env).toInteger() + this.accidental.evaluate(env).toInteger();
    env.scale = this.scale.evaluate(env);
  }
}

class StatementBlock {
  constructor(statements) {
    this.statements = statements;
  }

  evaluate(env) {
    for (let statement of this.statements) {
      statement.evaluate(env);
    }
  }
}

class StatementProgram {
  constructor(block) {
    this.block = block;
  }

  evaluate(env) {
    env.push(new Song());
    this.block.evaluate(env);
  }
}

class StatementGet {
  constructor(identifier) {
    this.identifier = identifier;
  }

  evaluate(env) {
    return env.bindings[this.identifier].value;
  }
}

class StatementReturn {
  constructor(value) {
    this.value = value;
  }

  evaluate(env) {
    throw new Return(this.value.evaluate(env));
  }
}

class StatementSet {
  constructor(identifier, value) {
    this.identifier = identifier;
    this.value = value;
  }

  evaluate(env) {
    env.bindings[this.identifier] = {
      identifier: this.identifier,
      value: this.value,
    };
  }
}

class StatementTo {
  constructor(identifier, parameters, body) {
    this.identifier = identifier;
    this.parameters = parameters;
    this.body = body;
  }

  evaluate(env) {
    env.bindings[this.identifier] = {
      identifier: this.identifier,
      parameters: this.parameters,
      body: this.body,
    };
  }
}

class StatementVariableGetter {
  constructor(identifier) {
    this.identifier = identifier;
  }

  evaluate(env) {
    return env.bindings[this.identifier].value.evaluate(env);
  }
}

class StatementCall {
  constructor(identifier, actualParameters) {
    this.identifier = identifier;
    this.actualParameters = actualParameters;
  }

  evaluate(env) {
    let define = env.bindings[this.identifier];
    // let subBindings = {};
    for (let actualParameter of this.actualParameters) {
      let value;
      if (actualParameter.mode == 'value') {
        value = actualParameter.expression.evaluate(env);
      } else {
        value = actualParameter.expression;
      }

      env.bindings[actualParameter.identifier] = {
        identifier: actualParameter.identifier,
        value: value,
      };
    }
    // let oldBindings = env.bindings;
    // env.bindings = subBindings;
    let body = env.bindings[this.identifier].body;

    let result;
    try {
      result = body.evaluate(env);
    } catch (e) {
      if (e instanceof Return) {
        result = e.value;
      } else {
        throw e;
      }
    }

    // env.bindings = oldBindings;
    return result;
  }
}

class StatementForRange {
  constructor(identifier, lo, hi, by, isInclusive, body, block) {
    this.identifier = identifier;
    this.lo = lo;
    this.hi = hi;
    this.by = by;
    this.isInclusive = isInclusive;
    this.body = body;
    this.block = block;
  }

  evaluate(env) {
    let start = this.lo.evaluate(env).toInteger();
    let stop = this.hi.evaluate(env).toInteger();
    if (!this.isInclusive) {
      stop -= 1;
    }

    let delta = this.by.evaluate(env).toInteger();

    if (delta == 0 ||
        (delta > 0 && stop < start) ||
        (delta < 0 && stop > start)) {
      throw new RuntimeException(this.block, 'I saw that this loop will run forever. I refuse to operate under these conditions.');
    }

    for (let i = start; i <= stop; i += delta) {
      env.bindings[this.identifier] = {
        identifier: this.identifier,
        value: new ExpressionInteger(i),
      };
      this.body.evaluate(env);
    }
  }
}

class StatementIf {
  constructor(conditions, thenBodies, elseBody) {
    this.conditions = conditions;
    this.thenBodies = thenBodies;
    this.elseBody = elseBody;
  }

  evaluate(env) {
    for (let [i, condition] of this.conditions.entries()) {
      if (condition.evaluate(env).toBoolean()) {
        this.thenBodies[i].evaluate(env);
        return;
      }
    }

    if (this.elseBody) {
      this.elseBody.evaluate(env);
    }
  }
}

class StatementRepeat {
  constructor(block) {
    this.block = block;
  }

  evaluate(env) {
    env.push(new Repeat());
    this.block.evaluate(env);
    let sequence = env.pop();
    env.emit(sequence);
  }
}

class StatementSlur {
  constructor(block) {
    this.block = block;
  }

  evaluate(env) {
    env.push(new Slur());
    this.block.evaluate(env);
    let sequence = env.pop();
    env.emit(sequence);
  }
}

class StatementX {
  constructor(count, block) {
    this.count = count;
    this.block = block;
  }

  evaluate(env) {
    let n = this.count.evaluate(env).toInteger();
    for (let i = 0; i < n; ++i) {
      this.block.evaluate(env);
    }
  }
}

class StatementRepeat12 {
  constructor(common, first, second) {
    this.common = common;
    this.first = first;
    this.second = second;
  }

  evaluate(env) {
    env.push(new Sequence());
    this.common.evaluate(env);
    let commonSequence = env.pop();

    env.push(new Sequence());
    this.first.evaluate(env);
    let firstEndingSequence = env.pop();

    env.push(new Sequence());
    this.second.evaluate(env);
    let secondEndingSequence = env.pop();

    env.emit(new Repeat12(commonSequence, firstEndingSequence, secondEndingSequence));
  }
}

class StatementJump {
  constructor(note) {
    this.note = note;
  }

  evaluate(env) {
    env.halfstep = this.note.evaluate(env).toInteger();
  }
}

class StatementPlayRelative {
  constructor(deltaValue, deltaUnit, duration) {
    this.deltaValue = deltaValue;
    this.deltaUnit = deltaUnit;
    this.duration = duration;
  }

  evaluate(env) {
    let id = new ExpressionDelta(this.deltaValue, this.deltaUnit).evaluate(env).toInteger();
    let durationValue = this.duration.evaluate(env).toInteger();
    env.emit(new Note(id, durationValue));
  }
}

class StatementPlayAbsolute {
  constructor(letter, accidental, octave, duration) {
    this.letter = letter;
    this.accidental = accidental;
    this.octave = octave;
    this.duration = duration;
  }

  evaluate(env) {
    let id = new ExpressionPosition(this.letter, this.accidental, this.octave).evaluate(env).toInteger();
    let durationValue = this.duration.evaluate(env).toInteger();
    env.emit(new Note(id, durationValue));
  }
}

class StatementJumpRelative {
  constructor(deltaValue, deltaUnit) {
    this.deltaValue = deltaValue;
    this.deltaUnit = deltaUnit;
  }

  evaluate(env) {
    let id = new ExpressionDelta(this.deltaValue, this.deltaUnit).evaluate(env).toInteger();
    env.halfstep = id;
  }
}

class StatementJumpAbsolute {
  constructor(letter, accidental, octave) {
    this.letter = letter;
    this.accidental = accidental;
    this.octave = octave;
  }

  evaluate(env) {
    let id = new ExpressionPosition(this.letter, this.accidental, this.octave).evaluate(env).toInteger();
    env.halfstep = id;
  }
}

class StatementPlay {
  constructor(note, duration) {
    this.note = note;
    this.duration = duration;
  }

  evaluate(env) {
    let durationValue = this.duration.evaluate(env).toInteger();
    let ids = this.note.evaluate(env);
    if (Array.isArray(ids)) {
      env.emit(new Chord(ids.map(id => new Note(id, durationValue))));
    } else {
      env.emit(new Note(ids, durationValue));
    }
  }
}

class ParseException extends Error {
  constructor(block, message) {
    super(message);
    this.block = block;
  }
}

class RuntimeException extends Error {
  constructor(block, message) {
    super(message);
    this.block = block;
  }
}

class Return {
  constructor(value) {
    this.value = value;
  }
}

function slurpStatements(block) {
  let statements = [];
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
  let xml = '';

  xml += '    </measure>\n';
  xml += '    <measure number="' + env.iMeasure + '">\n';
  xml += '      <attributes>\n';
  xml += '        <divisions>8</divisions>\n';
  xml += '      </attributes>\n';
  ++env.iMeasure;

  return xml;
}

function childToTree(identifier) {
  let childBlock = this.getInputTargetBlock(identifier);
  if (childBlock == null) {
    throw new ParseException(this, 'This block is missing its \'' + identifier + '\' parameter.');
  } else {
    return childBlock.tree();
  }
}

let blockDefinitions = {
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
  logic2: {
    configuration: {
      colour: expressionColor,
      output: ['Integer', 'Real'],
      inputsInline: true,
      message0: '%1 %2 %3',
      args0: [
        {
          type: 'input_value',
          name: 'a',
          check: ['Integer', 'Real', 'Boolean', 'Scale'],
        },
        {
          type: 'field_dropdown',
          name: 'operator',
          options: [
            ['>', '>'],
            ['>=', '>='],
            ['<', '<'],
            ['<=', '<='],
            ['equals', '=='],
            ['doesn\'t equal', '!='],
          ]
        },
        {
          type: 'input_value',
          name: 'b',
          check: ['Integer', 'Real', 'Boolean', 'Scale'],
        },
      ]
    },
    tree: function() {
      let operator = this.getFieldValue('operator');
      let a = childToTree.call(this, 'a');
      let b = childToTree.call(this, 'b');
      if (operator == '<') {
        return new ExpressionLess(a, b);
      } else if (operator == '<=') {
        return new ExpressionLessEqual(a, b);
      } else if (operator == '>') {
        return new ExpressionMore(a, b);
      } else if (operator == '>=') {
        return new ExpressionMoreEqual(a, b);
      } else if (operator == '==') {
        return new ExpressionEqual(a, b);
      } else if (operator == '!=') {
        return new ExpressionNotEqual(a, b);
      } else {
        throw 'Bad operator: ' + operator;
      }
    }
  },
  arithmetic2: {
    configuration: {
      colour: expressionColor,
      output: ['Integer', 'Real'],
      inputsInline: true,
      message0: '%1 %2 %3',
      args0: [
        {
          type: 'input_value',
          name: 'a',
          check: ['Integer', 'Real'],
        },
        {
          type: 'field_dropdown',
          name: 'operator',
          options: [
            ['+', '+'],
            ['-', '-'],
            ['*', '*'],
            ['/', '/'],
            ['%', '%'],
            ['^', '^'],
          ]
        },
        {
          type: 'input_value',
          name: 'b',
          check: ['Integer', 'Real'],
        },
      ]
    },
    tree: function() {
      let operator = this.getFieldValue('operator');
      let a = childToTree.call(this, 'a');
      let b = childToTree.call(this, 'b');
      if (operator == '+') {
        return new ExpressionAdd(a, b);
      } else if (operator == '-') {
        return new ExpressionSubtract(a, b);
      } else if (operator == '*') {
        return new ExpressionMultiply(a, b);
      } else if (operator == '/') {
        return new ExpressionDivide(a, b);
      } else if (operator == '%') {
        return new ExpressionRemainder(a, b);
      } else if (operator == '^') {
        return new ExpressionPower(a, b);
      } else {
        throw 'Bad operator: ' + operator;
      }
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
      return new ExpressionDelta(childToTree.call(this, 'value'),
                                 childToTree.call(this, 'unit'));
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
      let letter = childToTree.call(this, 'letter');
      let accidental = childToTree.call(this, 'accidental');
      let octave = childToTree.call(this, 'octave');
      return new ExpressionPosition(letter, accidental, octave);
    }
  },
  truefalse: {
    configuration: {
      colour: expressionColor,
      output: 'Integer',
      message0: '%1',
      args0: [
        { type: 'field_dropdown', name: 'value', options: [['true', 'true'], ['false', 'false']] },
      ]
    },
    tree: function() {
      return new ExpressionBoolean(this.getFieldValue('value') == 'true' ? true : false);
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
      return new ExpressionScale(this.getFieldValue('value'));
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
      let min = childToTree.call(this, 'min');
      let max = childToTree.call(this, 'max');
      return new ExpressionRandom(min, max);
    }
  },

  // Commands
  timeSignature: {
    configuration: {
      colour: statementColor,
      // nextStatement: null,
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
      let beatsPerMeasure;
      let beatNote;
      let signature = this.getFieldValue('signature');
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
      let letter = childToTree.call(this, 'letter');
      let accidental = childToTree.call(this, 'accidental');
      let scale = childToTree.call(this, 'scale');
      return new StatementKeySignature(letter, accidental, scale);
    }
  },
  print: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      message0: 'print %1',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'message' },
      ]
    },
    tree: function() {
      let message = childToTree.call(this, 'message');
      let print = new StatementPrint(message);
      return print;
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
      let note = childToTree.call(this, 'note');
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
      let note = childToTree.call(this, 'note');
      let duration = childToTree.call(this, 'duration');
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
      return new StatementJumpAbsolute(childToTree.call(this, 'letter'),
                                       childToTree.call(this, 'accidental'),
                                       childToTree.call(this, 'octave'));
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
      return new StatementJumpRelative(childToTree.call(this, 'deltaValue'),
                                       childToTree.call(this, 'deltaUnit'));
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
      return new StatementPlayAbsolute(childToTree.call(this, 'letter'),
                                       childToTree.call(this, 'accidental'),
                                       childToTree.call(this, 'octave'),
                                       childToTree.call(this, 'duration'));
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
      return new StatementPlayRelative(childToTree.call(this, 'deltaValue'),
                                       childToTree.call(this, 'deltaUnit'),
                                       childToTree.call(this, 'duration'));
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
      let duration = childToTree.call(this, 'duration');
      return new StatementRest(duration);
    }
  },
  setIdentifier: {
    configuration: {
      isMovable: false,
      colour: parameterColor,
      output: null,
      inputsInline: true,
      message0: '%1 %2',
      args0: [
        { type: 'field_input', name: 'identifier', text: '' },
        { type: 'field_label', name: 'modeArrow', text: '\u2190' },
      ]
    },
    deltaphone: {
      mode: 'value',
    },
  },
  formalParameter: {
    configuration: {
      isMovable: false,
      colour: parameterColor,
      output: null,
      inputsInline: true,
      extensions: ['extendFormal'],
      mutator: 'formalMutator',
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
  variableGetter: {
    configuration: {
      colour: expressionColor,
      output: null,
      inputsInline: true,
      message0: '%1',
      mutator: 'variableGetterMutator',
      args0: [
        { type: 'field_label', name: 'identifier', text: '' },
      ]
    },
    deltaphone: {
      sourceBlockId: null,
      identifier: null,
      mode: null,
    },
    tree: function() {
      let identifier = this.getField('identifier').getText();
      return new StatementVariableGetter(identifier);
    }
  },

  // Control
  call: {
    configuration: {
      colour: statementColor,
      message0: '',
      args0: [],
      inputsInline: false,
      mutator: 'callMutator',
      extensions: ['extendCall'],
    },
    deltaphone: {
      identifier: null,
      sourceBlockId: null,
      mode: null,
    },
    tree: function() {
      let identifier = this.deltaphone.identifier;
      let actualParameters = [];
      for (let input of this.inputList) {
        if (input.name.startsWith('_')) {
          let targetBlock = input.connection.targetBlock();
          if (targetBlock != null) {
            if (input.type == Blockly.INPUT_VALUE) {
              actualParameters.push({
                identifier: unformalize(input.name),
                mode: 'value',
                expression: targetBlock.tree(),
              });
            } else {
              actualParameters.push({
                identifier: unformalize(input.name),
                mode: 'action',
                expression: slurpBlock(targetBlock),
              });
            }
          } else {
            throw new ParseException(this, 'I am missing my \'' + unformalize(input.name) + '\' parameter.');
          }
        }
      }
      return new StatementCall(identifier, actualParameters);
    }
  },
  get: {
    configuration: {
      colour: expressionColor,
      output: null,
      message0: '',
      args0: [],
      inputsInline: false,
      mutator: 'getMutator',
    },
    deltaphone: {
      identifier: null,
      setBlockId: null,
    },
    tree: function() {
      let identifier = this.deltaphone.identifier;
      return new StatementGet(identifier);
    }
  },
  forRange: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'for %1 from %2 %3 %4 %5',
      args0: [
        { type: 'input_value', name: 'identifier' },
        { type: 'input_value', align: 'RIGHT', name: 'lo', check: ['Integer', 'Position'] },
        { type: 'field_dropdown', name: 'inclusivity', options: [['to', 'to'], ['through', 'through']] },
        { type: 'input_value', align: 'RIGHT', name: 'hi', check: ['Integer', 'Position'] },
        { type: 'input_statement', align: 'RIGHT', name: 'body' },
      ],
      extensions: ['extendForRange'],
      mutator: 'forRangeMutator',
      inputsInline: true,
    },
    deltaphone: {
      hasBy: false,
    },
    tree: function() {
      let identifier = this.getInputTargetBlock('identifier').getField('identifier').getText();
      let lo = childToTree.call(this, 'lo');
      let hi = childToTree.call(this, 'hi');

      let by;
      if (this.deltaphone.hasBy) {
        by = childToTree.call(this, 'by');
      } else {
        by = new ExpressionInteger(1);
      }

      let isInclusive = this.getFieldValue('inclusivity') == 'through';
      let body = slurpBlock(this.getInputTargetBlock('body'));
      return new StatementForRange(identifier, lo, hi, by, isInclusive, body, this);
    }
  },
  set: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'set %1 to %2',
      args0: [
        { type: 'input_value', name: 'identifier' },
        { type: 'input_value', align: 'RIGHT', name: 'value' },
      ],
      extensions: ['extendSet'],
      inputsInline: true,
    },
    deltaphone: {
    },
    tree: function() {
      let identifier = this.getInputTargetBlock('identifier').getFieldValue('identifier');
      let value = childToTree.call(this, 'value');
      return new StatementSet(identifier, value);
    }
  },
  returnFromTo: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'return %1',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'value' },
      ],
      inputsInline: true,
    },
    tree: function() {
      let value = childToTree.call(this, 'value');
      return new StatementReturn(value);
    }
  },
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
      mutator: 'toMutator',
      extensions: ['parameterize'],
      inputsInline: true,
    },
    deltaphone: {
    },
    initializeState: function() {
      this.deltaphone.parameters = [];
    },
    tree: function() {
      let identifier = this.getField('identifier').getText();
      let parameters = [];
      for (let i = 1; i < this.inputList.length - 1; ++i) {
        parameters.push({ identifier: this.inputList[i].name });
      }
      let bodyBlock = this.getInputTargetBlock('body');
      return new StatementTo(identifier, parameters, slurpBlock(bodyBlock));
    }
  },
  multif: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      message0: 'if %1 %2',
      mutator: 'ifMutator',
      extensions: ['extendIf'],
      args0: [
        { type: 'input_value', name: 'condition0' },
        { type: 'input_statement', name: 'then0' },
      ]
    },
    deltaphone: {
      arity: 1,
      hasElse: false,
    },
    tree: function() {
      let conditions = [];
      let thenBodies = [];
      for (let i = 0; i < this.deltaphone.arity; ++i) {
        conditions.push(childToTree.call(this, 'condition' + i));
        thenBodies.push(slurpBlock(this.getInputTargetBlock('then' + i)));
      }

      let elseBody = null;
      if (this.deltaphone.hasElse) {
        elseBody = slurpBlock(this.getInputTargetBlock('else'));
      }

      return new StatementIf(conditions, thenBodies, elseBody);
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
      let bodyBlock = this.getInputTargetBlock('body');
      return new StatementRepeat(slurpBlock(bodyBlock));
    }
  },
  slur: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'slur %1',
      args0: [
        { type: 'input_statement', name: 'body' },
      ]
    },
    tree: function() {
      let bodyBlock = this.getInputTargetBlock('body');
      return new StatementSlur(slurpBlock(bodyBlock));
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
      mutator: 'arityMutator',
      extensions: ['extendArity'],
    },
    deltaphone: {
      arity: 3,
      elementType: 'Chord',
    },
    tree: function() {
      let deltas = [];
      for (let i = 0; i < this.deltaphone.arity; ++i) {
        let element = childToTree.call(this, 'element' + i);
        deltas.push(element);
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
      let commonBlock = slurpBlock(this.getInputTargetBlock('common'));
      let firstBlock = slurpBlock(this.getInputTargetBlock('first'));
      let secondBlock = slurpBlock(this.getInputTargetBlock('second'));
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
  mark: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'mark',
    },
    tree: function() {
      return new StatementMark();
    }
  },
  back: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'back',
    },
    tree: function() {
      return new StatementBack();
    }
  },
  unmark: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'unmark',
    },
    tree: function() {
      return new StatementUnmark();
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
      let countBlock = childToTree.call(this, 'count');
      let bodyBlock = this.getInputTargetBlock('body');
      return new StatementX(countBlock, slurpBlock(bodyBlock));
    }
  },
};

function formalize(identifier) {
  return '_' + identifier;
}

function unformalize(identifier) {
  return identifier.substring(1, identifier.length);
}

function initializeBlock(id) {
  let definition = blockDefinitions[id];
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
  Blockly.Events.disable();
  let oldMutation = block.mutationToDom();
  mutate();
  let newMutation = block.mutationToDom();

  block.domToMutation(newMutation);
  Blockly.Events.enable();

  let event = new Blockly.Events.BlockChange(block, 'mutation', null, Blockly.Xml.domToText(oldMutation), Blockly.Xml.domToText(newMutation));
  Blockly.Events.fire(event);

  if (callback) {
    callback();
  }
}

function triggerArity(block, arity) {
  mutateUndoably(block, () => {
    block.deltaphone.arity = arity;
  });
}

function deleteTo(toBlock) {
  for (let root of workspace.getTopBlocks()) {
    removeCalls(root, toBlock.id);
  }
  toBlock.dispose();
}

function removeCalls(root, sourceBlockId) {
  if (root.type == 'call' && root.deltaphone.sourceBlockId == sourceBlockId) {
    root.dispose();
  } else {
    for (let child of root.getChildren()) {
      removeCalls(child, sourceBlockId);
    }
  }
}

// Variables ------------------------------------------------------------------

function spawnGet(setBlock) {
  let getBlock = workspace.newBlock('get');
  shapeGetFromSet(setBlock, getBlock);
  getBlock.initSvg();
  getBlock.render();
  getBlock.select();
}

function shapeGetFromSet(setBlock, getBlock) {
  let identifier = setBlock.getField('identifier').getText();
  shapeGet(getBlock, setBlock.id, identifier);
}

function shapeGet(getBlock, setBlockId, identifier) {
  getBlock.deltaphone.identifier = identifier;
  getBlock.deltaphone.setBlockId = setBlockId;
  let input = getBlock.appendDummyInput();
  input.appendField(identifier);
}

// function renameVariable(sourceBlock, oldIdentifier, newIdentifier) {
  // for (let root of workspace.getTopBlocks()) {
    // syncGetsToSet(root, sourceBlock);
  // }
// }

function syncGetsToSet(root, sourceBlock) {
  if (root.type == 'variableGetter' && root.deltaphone.sourceBlockId == sourceBlock.id) {
    setGetToSet(sourceBlock, root);
  }

  for (let child of root.getChildren()) {
    syncGetsToSet(child, sourceBlock);
  }
}

function syncGetToSet(setBlock, getBlock) {
  shapeGetFromSet(setBlock, getBlock);
}

// Calls ----------------------------------------------------------------------

function spawnCall(toBlock, mode) {
  let callBlock = workspace.newBlock('call');
  callBlock.deltaphone.mode = mode;
  shapeCallFromTo(toBlock, callBlock);
  callBlock.initSvg();
  callBlock.render();
  callBlock.select();
}

function shapeCallFromTo(toBlock, callBlock) {
  let identifier = toBlock.getField('identifier').getText();
  shapeCall(callBlock, toBlock.id, identifier, toBlock.deltaphone.parameters);
}

function shapeCall(callBlock, sourceBlockId, identifier, parameters) {
  callBlock.deltaphone.identifier = identifier;
  callBlock.deltaphone.sourceBlockId = sourceBlockId;
  syncMode(callBlock);

  if (parameters.length == 0) {
    let input = callBlock.appendDummyInput();
    input.appendField(identifier);
  } else {
    for (let [index, parameter] of parameters.entries()) {
      let input;
      if (parameter.mode == 'action') {
        input = callBlock.appendStatementInput(formalize(parameter.identifier));
      } else {
        input = callBlock.appendValueInput(formalize(parameter.identifier));
      }
      
      // Tack on the function name for first row.
      if (index == 0) {
        input.appendField(identifier);
      }

      // Only name parameters when there are multiple.
      if (parameters.length > 1) {
        input.appendField(parameter.identifier).setAlign(Blockly.ALIGN_RIGHT);
      }
    }
  }
}

function removeParameterReferences(root, sourceBlockId) {
  if (root.type == 'variableGetter' && root.deltaphone.sourceBlockId == sourceBlockId) {
    root.dispose();
  } else {
    for (let child of root.getChildren()) {
      removeParameterReferences(child, sourceBlockId);
    }
  }
}

function removeParameter(formalBlock) {
  let identifier = formalBlock.getField('identifier').getText();
  let toBlock = formalBlock.getParent();

  // Remove parameter from parent's metadata.
  let i = toBlock.deltaphone.parameters.findIndex(parameter => parameter.identifier == identifier);
  if (i >= 0) {
    toBlock.deltaphone.parameters.splice(i, 1);
  }

  // Dispose of parent's input, block itself, and any parameter references.
  toBlock.removeInput(formalize(identifier));
  formalBlock.dispose();
  for (let root of workspace.getTopBlocks()) {
    removeParameterReferences(root, formalBlock.id);
    syncCallsToTo(root, toBlock);
  }
}

function addParameter(toBlock, mode) {
  let identifier = 'newparam';

  mutateUndoably(toBlock, () => {
    toBlock.deltaphone.parameters.push({identifier: identifier, mode: mode});
  }, () => {
    let parameterBlock = workspace.newBlock('formalParameter');
    parameterBlock.getField('identifier').setText(identifier);

    parameterBlock.deltaphone.mode = mode;
    syncModeArrow(parameterBlock);

    let input = toBlock.getInput(formalize(identifier));
    input.connection.connect(parameterBlock.outputConnection);

    parameterBlock.initSvg();
    parameterBlock.render();
    parameterBlock.select();
    parameterBlock.getField('identifier').showEditor_();

    // Add input to all calls.
    for (let root of workspace.getTopBlocks()) {
      syncCallsToTo(root, toBlock);
    }
  });
}

function syncCallToTo(toBlock, callBlock) {
  // Remove all inputs from call, but hang on to them just in case we need to
  // reconnect them later.
  let oldActuals = new Map();
  for (let i = callBlock.inputList.length - 1; i >= 0; --i) {
    let callInput = callBlock.inputList[i];
    if (callInput.name.startsWith('_')) {
      let actualBlock = callBlock.getInputTargetBlock(callInput.name);
      if (actualBlock) {
        oldActuals.set(callInput.name, actualBlock);
      }
    }
    callBlock.removeInput(callInput.name);
  }

  shapeCallFromTo(toBlock, callBlock);

  // Restore any actual parameter blocks that persisted across the shape change.
  for (let [name, actualBlock] of oldActuals) {
    let identifier = name.substring(1, name.length);
    let formalParameter = toBlock.deltaphone.parameters.find(parameter => parameter.identifier == identifier);
    if (formalParameter) {
      if (formalParameter.mode == 'value' && actualBlock.outputConnection) {
        callBlock.getInput(name).connection.connect(actualBlock.outputConnection);
      } else if (formalParameter.mode == 'action' && actualBlock.previousConnection) {
        callBlock.getInput(name).connection.connect(actualBlock.previousConnection);
      }
    }
  }
}

function syncCallsToTo(root, toBlock) {
  if (root.type == 'call' && root.deltaphone.sourceBlockId == toBlock.id) {
    syncCallToTo(toBlock, root);
  }

  for (let child of root.getChildren()) {
    syncCallsToTo(child, toBlock);
  }
}

function syncModeArrow(block) {
  let arrow = block.deltaphone.mode == 'action' ? '\u2193' : '\u2190';
  block.getField('modeArrow').setText(arrow);
}

function syncMode(block) {
  if (block.deltaphone.mode == 'action') {
    block.setOutput(false);
    block.setPreviousStatement(true);
    block.setNextStatement(true);
    block.setColour(statementColor);
  } else {
    block.setPreviousStatement(false);
    block.setNextStatement(false);
    block.setOutput(true);
    block.setColour(expressionColor);
  }
}

// --------------------------------------------------------------------------- 

function addBy(block) {
  mutateUndoably(block, () => {
    block.deltaphone.hasBy = true;
  });
}

function removeBy(block) {
  mutateUndoably(block, () => {
    block.deltaphone.hasBy = false;
  });
}

function shapeForRange(block) {
  // TODO add check
  if (block.deltaphone.hasBy && block.getInput('by') == null) {
    let input = block.appendValueInput('by').appendField('by');
    let i = block.inputList.length - 1;
    block.moveNumberedInputBefore(i, i - 1);
  } else if (!block.deltaphone.hasBy && block.getInput('by') != null) {
    block.removeInput('by');
  }
}

// If -------------------------------------------------------------------------

function addThen(block) {
  mutateUndoably(block, () => {
    block.deltaphone.arity += 1;
  });
}

function removeThen(block) {
  mutateUndoably(block, () => {
    block.deltaphone.arity -= 1;
  });
}

function addElse(block) {
  mutateUndoably(block, () => {
    block.deltaphone.hasElse = true;
  });
}

function removeElse(block) {
  mutateUndoably(block, () => {
    block.deltaphone.hasElse = false;
  });
}

function shapeIf(block) {
  // Cache old inputs to be reconnected later.
  let oldInputs = {};
  for (let input of block.inputList) {
    oldInputs[input.name] = input.connection.targetBlock();
  }

  // Remove all inputs but first then block.
  while (block.inputList.length > 2) {
    let input = block.inputList[block.inputList.length - 1];
    block.removeInput(input.name);
  }

  for (let i = 1; i < block.deltaphone.arity; ++i) {
    let input = block.appendValueInput('condition' + i).appendField('else if');
    if (oldInputs.hasOwnProperty('condition' + i) && oldInputs['condition' + i]) {
      input.connection.connect(oldInputs['condition' + i].outputConnection);
    }

    input = block.appendStatementInput('then' + i);
    if (oldInputs.hasOwnProperty('then' + i) && oldInputs['then' + i]) {
      input.connection.connect(oldInputs['then' + i].previousConnection);
    }
  }

  if (block.deltaphone.hasElse) {
    let input = block.appendStatementInput('else').appendField('else');
    if (oldInputs.hasOwnProperty('else') && oldInputs['else']) {
      input.connection.connect(oldInputs['else'].previousConnection);
    }
  }
}

function addSeparator(options) {
  let option = {
    enabled: false,
    text: '',
  };

  for (let i = 0; i < 2; ++i) {
    options.push(option);
  }
}

// ----------------------------------------------------------------------------

function setup() {
  // Initialize blocks.
  for (let id in blockDefinitions) {
    if (blockDefinitions.hasOwnProperty(id)) {
      initializeBlock(id);
    }
  }

  Blockly.Extensions.register('extendCall', function() {
    let block = this;
    this.mixin({
      customContextMenu: function(options) {
        let option = {
          enabled: true,
          text: 'Convert to ' + (block.deltaphone.mode == 'action' ? 'value' : 'action'),
          callback: function() {
            block.deltaphone.mode = block.deltaphone.mode == 'action' ? 'value' : 'action';
            syncMode(block);
          }
        };
        options.push(option);
      }
    });
  });

  Blockly.Extensions.register('extendIf', function() {
    let block = this;
    this.mixin({
      customContextMenu: function(options) {
        addSeparator(options);

        let option = {
          enabled: true,
          text: 'Add then',
          callback: function() {
            addThen(block);
          }
        };
        options.push(option);

        if (block.deltaphone.arity > 1) {
          option = {
            enabled: true,
            text: 'Remove last then',
            callback: function() {
              removeThen(block);
            }
          };
          options.push(option);
        }

        addSeparator(options);

        if (this.deltaphone.hasElse) {
          option = {
            enabled: true,
            text: 'Remove else',
            callback: function() {
              removeElse(block);
            }
          };
          options.push(option);
        } else {
          option = {
            enabled: true,
            text: 'Add else',
            callback: function() {
              addElse(block);
            }
          };
          options.push(option);
        }
      }
    });
  });

  Blockly.Extensions.register('extendFormal', function() {
    let block = this;
    this.mixin({
      customContextMenu: function(options) {
        let option = {
          enabled: true,
          text: 'Delete parameter',
          callback: function() {
            removeParameter(block);
          }
        };
        options.push(option);
      }
    });
  });

  Blockly.Extensions.register('extendForRange', function() {
    let block = this;
    this.mixin({
      customContextMenu: function(options) {
        if (block.deltaphone.hasBy) {
          option = {
            enabled: true,
            text: 'Remove by',
            callback: function() {
              removeBy(block);
            }
          };
          options.push(option);
        } else {
          option = {
            enabled: true,
            text: 'Add by',
            callback: function() {
              addBy(block);
            }
          };
          options.push(option);
        }

        option = {
          enabled: true,
          text: 'Delete loop',
          callback: function() {
            deleteSet(block);
          }
        };
        options.push(option);
      }
    });
  });

  Blockly.Extensions.register('extendSet', function() {
    let block = this;
    this.mixin({
      customContextMenu: function(options) {
        let option = {
          enabled: true,
          text: 'Delete variable and getters',
          callback: function() {
            deleteSet(block);
          }
        };
        options.push(option);
      }
    });
  });


  Blockly.Extensions.register('parameterize', function() {
    let block = this;
    this.mixin({
      customContextMenu: function(options) {
        let option = {
          enabled: true,
          text: 'Add value parameter',
          callback: function() {
            addParameter(block, 'value');
          }
        };
        options.push(option);

        option = {
          enabled: true,
          text: 'Add action parameter',
          callback: function() {
            addParameter(block, 'action');
          }
        };
        options.push(option);

        option = {
          enabled: true,
          text: 'Spawn value call',
          callback: function() {
            spawnCall(block, 'value');
          }
        };
        options.push(option);

        option = {
          enabled: true,
          text: 'Spawn action call',
          callback: function() {
            spawnCall(block, 'action');
          }
        };
        options.push(option);

        option = {
          enabled: true,
          text: 'Delete action and calls',
          callback: function() {
            deleteTo(block);
          }
        };
        options.push(option);
      }
    });
  });

  Blockly.Extensions.register('extendArity', function() {
    let block = this;
    this.mixin({
      customContextMenu: function(options) {
        let option = {
          enabled: true,
          text: 'Change number...',
          callback: function() {
            let size = prompt('How many notes are in the chord?');
            if (new RegExp(/^\d+/).test(size)) {
              triggerArity(block, parseInt(size));
            }
          }
        };
        options.push(option);
      }
    });
  });

  Blockly.Extensions.registerMutator('toMutator', {
    mutationToDom: function() {
      let parametersNode = document.createElement('parameters');

      for (let parameter of this.deltaphone.parameters) {
        let parameterNode = document.createElement('parameter');
        parameterNode.setAttribute('identifier', parameter.identifier);
        parameterNode.setAttribute('mode', parameter.mode);
        parametersNode.appendChild(parameterNode);
      }

      let container = document.createElement('mutation');
      container.appendChild(parametersNode);
      return container;
    },
    // From XML to blocks.
    domToMutation: function(xml) {
      this.deltaphone.parameters = [];

      // Populate metadata model.
      for (let child of xml.children) {
        if (child.nodeName.toLowerCase() == 'parameters') {
          for (let parameterNode of child.children) {
            let identifier = parameterNode.getAttribute('identifier');
            let mode = parameterNode.getAttribute('mode');
            this.deltaphone.parameters.push({ identifier: identifier, mode: mode });
          }
        }
      }

      // Remove any existing inputs, but save the block in case it
      // will need to get reconnected.
      let oldFormalBlocks = [];
      while (this.inputList.length > 2) {
        let input = this.inputList[this.inputList.length - 2];
        oldFormalBlocks.push(input.connection.targetBlock());
        this.removeInput(input.name);
      }

      // Add inputs from model.
      for (let parameter of this.deltaphone.parameters) {
        let input = this.appendValueInput(formalize(parameter.identifier));
        this.moveNumberedInputBefore(this.inputList.length - 1, this.inputList.length - 2);
      }

      // Traverse previous blocks, disposing of unused ones and reconnecting
      // persistent ones.
      for (let oldFormalBlock of oldFormalBlocks) {
        let identifier = oldFormalBlock.getField('identifier').getText();
        if (this.getInput(formalize(identifier))) {
          this.getInput(formalize(identifier)).connection.connect(oldFormalBlock.outputConnection);
        } else {
          oldFormalBlock.dispose();
        }
      }
    },
  });

  Blockly.Extensions.registerMutator('ifMutator', {
    mutationToDom: function() {
      let container = document.createElement('mutation');
      container.setAttribute('arity', this.deltaphone.arity);
      container.setAttribute('else', this.deltaphone.hasElse);
      return container;
    },
    domToMutation: function(xml) {
      this.deltaphone.arity = parseInt(xml.getAttribute('arity'));
      this.deltaphone.hasElse = xml.getAttribute('else') == 'true';
      shapeIf(this);
    }
  });

  Blockly.Extensions.registerMutator('forRangeMutator', {
    mutationToDom: function() {
      let container = document.createElement('mutation');
      container.setAttribute('hasBy', this.deltaphone.hasBy);
      return container;
    },
    domToMutation: function(xml) {
      this.deltaphone.hasBy = xml.getAttribute('hasby') == 'true';
      shapeForRange(this);
    }
  });

  Blockly.Extensions.registerMutator('getMutator', {
    mutationToDom: function() {
      let setBlock = workspace.getBlockById(this.deltaphone.setBlockId);
      if (!setBlock) {
        return;
      }

      let container = document.createElement('mutation');

      let setElement = document.createElement('set');
      setElement.setAttribute('id', setBlock.id);
      setElement.setAttribute('identifier', setBlock.getField('identifier').getText());
      container.appendChild(setElement);

      return container;
    },
    domToMutation: function(xml) {
      let setBlockId = null;
      let setIdentifier = null;

      for (let child of xml.children) {
        if (child.nodeName.toLowerCase() == 'set') {
          setBlockId = child.getAttribute('id');
          setIdentifier = child.getAttribute('identifier');
        }
      }

      shapeGet(this, setBlockId, setIdentifier);
    }
  });

  Blockly.Extensions.registerMutator('callMutator', {
    mutationToDom: function() {
      let toBlock = workspace.getBlockById(this.deltaphone.sourceBlockId);
      if (!toBlock) {
        return;
      }

      let container = document.createElement('mutation');
      container.setAttribute('mode', this.deltaphone.mode);

      let toElement = document.createElement('to');
      toElement.setAttribute('id', toBlock.id);
      toElement.setAttribute('identifier', toBlock.getField('identifier').getText());
      container.appendChild(toElement);

      let parametersElement = document.createElement('parameters');
      for (let parameter of toBlock.deltaphone.parameters) {
        let parameterElement = document.createElement('parameter');
        parameterElement.setAttribute("identifier", parameter.identifier);
        parameterElement.setAttribute("mode", parameter.mode);
        parametersElement.appendChild(parameterElement);
      } 

      container.appendChild(parametersElement);

      return container;
    },
    domToMutation: function(xml) {
      let sourceBlockId = null;
      let toIdentifier = null;
      let parameters = [];

      this.deltaphone.mode = xml.getAttribute('mode');

      for (let child of xml.children) {
        if (child.nodeName.toLowerCase() == 'to') {
          sourceBlockId = child.getAttribute('id');
          toIdentifier = child.getAttribute('identifier');
        } else if (child.nodeName.toLowerCase() == 'parameters') {
          for (let parameterNode of child.children) {
            let identifier = parameterNode.getAttribute('identifier');
            let mode = parameterNode.getAttribute('mode');
            parameters.push({ identifier: identifier, mode: mode });
          }
        }
      }

      shapeCall(this, sourceBlockId, toIdentifier, parameters);
    }
  });

  Blockly.Extensions.registerMutator('formalMutator', {
    mutationToDom: function() {
      let container = document.createElement('mutation');
      container.setAttribute('mode', this.deltaphone.mode);
      return container;
    },
    domToMutation: function(xml) {
      this.deltaphone.mode = xml.getAttribute('mode');
      syncModeArrow(this);
    }
  });

  Blockly.Extensions.registerMutator('variableGetterMutator', {
    mutationToDom: function() {
      let container = document.createElement('mutation');
      container.setAttribute('mode', this.deltaphone.mode);
      container.setAttribute('identifier', this.deltaphone.identifier);
      container.setAttribute('sourceblockid', this.deltaphone.sourceBlockId);
      return container;
    },
    domToMutation: function(xml) {
      this.deltaphone.mode = xml.getAttribute('mode');
      this.deltaphone.sourceBlockId = xml.getAttribute('sourceblockid');
      this.deltaphone.identifier = xml.getAttribute('identifier');
      this.getField('identifier').setText(this.deltaphone.identifier);
      syncMode(this);
    }
  });

  Blockly.Extensions.registerMutator('arityMutator', {
    mutationToDom: function() {
      let container = document.createElement('mutation');
      container.setAttribute('arity', this.deltaphone.arity);
      return container;
    },
    domToMutation: function(xml) {
      let expectedArity = xml.getAttribute('arity');
      let actualArity = this.getInput('empty') ? 0 : this.inputList.length;
      this.deltaphone.arity = expectedArity;

      if (expectedArity > 0 && actualArity == 0) {
        this.removeInput('empty');
      } else if (expectedArity == 0 && actualArity > 0) {
        this.appendDummyInput('empty')
            .appendField(this.type);
      }

      // Currently there are more than we need. Trim off extras.
      if (actualArity > expectedArity) {
        for (let i = actualArity - 1; i >= expectedArity; --i) {
          this.removeInput('element' + i);
        }
      }
      
      // Currently there are fewer than we need. Add missing.
      else if (actualArity < expectedArity) {
        for (let i = actualArity; i < expectedArity; ++i) {
          let input = this.appendValueInput('element' + i, );
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

  let options = {
    toolbox: document.getElementById('toolbox'),
    trashcan: true,
    comments: false,
    media: 'blockly/media/',
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
    let option = {
      enabled: true,
      text: 'Copy',
      callback: copyWorkspace,
    };
    options.push(option);

    option = {
      enabled: true,
      text: 'Paste',
      callback: pasteWorkspace,
    };
    options.push(option);
  };

  document.getElementById('playButton').addEventListener('click', () => {
    $('#score').alphaTab('playPause');
  });

  document.getElementById('scorifyButton').addEventListener('click', () => {
    interpret();
  });

  let last = localStorage.getItem('last');
  if (last) {
    last = Blockly.Xml.textToDom(last);
    console.log("last:", last);
    Blockly.Xml.domToWorkspace(last, workspace);
  }

  $('#score').alphaTab({
    width: -1,
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
      let block = workspace.getBlockById(event.blockId); 
      if (block.type == 'formalParameter') {
        renameFormal(block, event.oldValue, event.newValue);
      } else if (block.type == 'to') {
        renameTo(block, event.oldValue, event.newValue);
      } else if (block.type == 'setIdentifier') {
        renameVariable(block, event.oldValue, event.newValue);
      }
    }

    // We want to handle a selection of a formal parameter by generating an
    // parameter reference that can be used in the body. The event we care
    // about has some compound logic to it. It must be a UI selected element
    // event. The selection is being made if its newValue property is set,
    // which is the ID of the formal parameter block. But formal parameters are
    // selected right after they are added, so we further require that a
    // gesture be in progress. No gesture is in progress when a parameter is
    // freshly added.
    else if (event.type == Blockly.Events.UI) {
      if (event.hasOwnProperty('element') && event.element == 'selected') {
        if (event.newValue && workspace.currentGesture_ && workspace.currentGesture_.startField_ == null) {
          let identifierBlock = workspace.getBlockById(event.newValue); 

          if (identifierBlock.type == 'formalParameter' || identifierBlock.type == 'setIdentifier') {
            let identifier = identifierBlock.getField('identifier').getText();
            let getterBlock = workspace.newBlock('variableGetter');

            getterBlock.deltaphone.mode = identifierBlock.deltaphone.mode;
            getterBlock.deltaphone.identifier = identifier;
            syncMode(getterBlock);

            getterBlock.getField('identifier').setText(identifier);

            if (identifierBlock.type == 'formalParameter') {
              getterBlock.deltaphone.sourceBlockId = workspace.getBlockById(event.newValue).getParent().id;
            } else {
              getterBlock.deltaphone.sourceBlockId = event.newValue;
            }

            let referenceLocation = getterBlock.getRelativeToSurfaceXY();
            let mouse = workspace.currentGesture_.mouseDownXY_;

            let point = Blockly.utils.mouseToSvg({clientX: mouse.x, clientY: mouse.y}, workspace.getParentSvg(), workspace.getInverseScreenCTM());
            let rel = workspace.getOriginOffsetInPixels();
            let mouseX = (point.x - rel.x) / workspace.scale;
            let mouseY = (point.y - rel.y) / workspace.scale;

            getterBlock.initSvg();
            getterBlock.render();
            getterBlock.select();
            getterBlock.bringToFront();

            getterBlock.moveBy(mouseX - referenceLocation.x - getterBlock.width / 2, mouseY - referenceLocation.y - getterBlock.height / 2);

            workspace.currentGesture_.setStartBlock(getterBlock);
            workspace.currentGesture_.setTargetBlock_(getterBlock);
          }
        }
      }
    }

    if (event.type == Blockly.Events.BLOCK_CREATE) {
      rescopeSetters(workspace.getBlockById(event.blockId));
    }
    
    if (event.type == Blockly.Events.BLOCK_CHANGE ||
        event.type == Blockly.Events.BLOCK_DELETE ||
        event.type == Blockly.Events.BLOCK_CREATE ||
        event.type == Blockly.Events.BLOCK_MOVE) {
      saveLocal();
      interpret();
    }
  });

  let directions = new Map();
  directions.set('horizontal', ['right', 'left']);
  directions.set('vertical', ['top', 'bottom']);

  for (let [direction, sides] of directions) {
    for (let side of sides) {
      let resizables = document.querySelectorAll('.resizable-' + side);
      for (let resizable of resizables) {
        let div = document.createElement('div');
        div.classList.add('resizer', 'resizer-' + direction, 'resizer-' + side);
        resizable.appendChild(div);
        div.addEventListener('mousedown', buildResizer(side, resizable));
      }
    }
  }
}

function registerResizeListener(bounds, gap, resize) {
  let unlistener = function(event) {
    document.removeEventListener('mousemove', moveListener);
    document.removeEventListener('mouseup', unlistener);
    document.removeEventListener('mousedown', unlistener);
  };
  let moveListener = function(event) {
    event.preventDefault();
    if (event.buttons !== 1) {
      unlistener();
    } else {
      resize(event, bounds, gap);

      // Force Blockly to update.
      Blockly.svgResize(workspace);

      // Force AlphaTab to update.
      window.dispatchEvent(new Event('resize'));
    }
  }
  document.addEventListener('mousemove', moveListener, false);
  document.addEventListener('mouseup', unlistener, false);
  document.addEventListener('mousedown', unlistener, false);
}

function buildResizer(side, element) {
  let measureGap;
  let resize;

  if (side === 'right') {
    measureGap = (event, bounds) => event.clientX - bounds.right;
    resize = (event, bounds, gap) => {
      let width = event.clientX - bounds.x - gap;
      element.style.width = width + 'px';
    };
  } else if (side === 'left') {
    measureGap = (event, bounds) => event.clientX - bounds.left;
    resize = (event, bounds, gap) => {
      let width = bounds.right - event.clientX - gap;
      element.style.width = width + 'px';
    };
  } else if (side === 'top') {
    measureGap = (event, bounds) => event.clientY - bounds.top;
    resize = (event, bounds, gap) => {
      let height = bounds.bottom - event.clientY;
      messagerContainer.style.height = height + 'px';
    };
  } else if (side === 'bottom') {
    measureGap = (event, bounds) => event.clientY - bounds.bottom;
    resize = (event, bounds, gap) => {
      let height = bounds.bottom - event.clientY;
      messagerContainer.style.height = height + 'px';
    };
  } else {
    throw 'Resizing ' + side + ' not supported yet.';
  }

  return function(event) {
    if (event.buttons === 1) {
      event.stopPropagation();
      event.preventDefault();
      let bounds = element.getBoundingClientRect();
      let gap = measureGap(event, bounds);
      registerResizeListener(bounds, gap, resize);
    }
  }
}

function rescopeSetters(block) {
  if (block.type == 'forRange') {
    let identifierBlock = block.getInputTargetBlock('identifier');
    let identifier = identifierBlock.getField('identifier').getText();
    for (let child of block.getChildren()) {
      reattachReferences(child, identifier, identifierBlock);
    }
  } else if (block.type == 'set') {
    let identifierBlock = block.getInputTargetBlock('identifier');
    let identifier = identifierBlock.getField('identifier').getText();
    for (let child of block.getChildren()) {
      reattachReferences(child, identifier, identifierBlock);
    }
  } else if (block.type == 'to') {
    // Reattach calls.
    let identifier = block.getField('identifier').getText();
    for (let child of block.getChildren()) {
      reattachReferences(child, identifier, block);
    }

    // Reattach formals.
    for (let formal of block.deltaphone.parameters) {
      console.log("formal.identifier:", formal.identifier);
      for (let child of block.getChildren()) {
        reattachReferences(child, formal.identifier, block);
      }
    }
  }

  for (let child of block.getChildren()) {
    rescopeSetters(child);
  }
}

function reattachReferences(root, identifier, sourceBlock) {
  if (root.type == 'variableGetter') {
    if (root.deltaphone.identifier == identifier) {
      root.deltaphone.sourceBlockId = sourceBlock.id;
    }
  } else {
    for (let child of root.getChildren()) {
      reattachReferences(child, identifier, sourceBlock);
    }
  }
}

function renameTo(toBlock, oldIdentifier, newIdentifier) {
  for (let root of workspace.getTopBlocks()) {
    syncCallsToTo(root, toBlock);
  }
}

function renameVariable(sourceBlock, oldIdentifier, newIdentifier) {
  for (let root of workspace.getTopBlocks()) {
    renameVariableGetters(root, sourceBlock.id, oldIdentifier, newIdentifier);
  }
}

function renameFormal(formalBlock, oldIdentifier, newIdentifier) {
  let parent = formalBlock.getParent();

  // Rename parent's input.
  for (let i = 1; i < parent.inputList.length - 1; ++i) {
    if (parent.inputList[i].name == formalize(oldIdentifier)) {
      parent.inputList[i].name = formalize(newIdentifier);
    }
  }

  // Update parent's meta.
  for (let parameter of parent.deltaphone.parameters) {
    if (parameter.identifier == oldIdentifier) {
      parameter.identifier = newIdentifier;
      break;
    }
  }

  // Rename all variableGetter children.
  for (let root of workspace.getTopBlocks()) {
    renameVariableGetters(root, formalBlock.getParent().id, oldIdentifier, newIdentifier);
    renameActuals(root, parent, oldIdentifier, newIdentifier);
  }
}

function renameActuals(root, toBlock, oldIdentifier, newIdentifier) {
  if (root.type == 'call' && root.deltaphone.sourceBlockId == toBlock.id) {
    let input = root.getInput(formalize(oldIdentifier));
    input.name = formalize(newIdentifier);
    syncCallToTo(toBlock, root);
  }

  for (let child of root.getChildren()) {
    renameActuals(child, toBlock, oldIdentifier, newIdentifier);
  }
}

function renameVariableGetters(root, sourceBlockId, oldIdentifier, newIdentifier) {
  if (root.type == 'variableGetter' && root.deltaphone.sourceBlockId == sourceBlockId && root.getField('identifier').getText() == oldIdentifier) {
    root.getField('identifier').setText(newIdentifier);
    root.deltaphone.identifier = newIdentifier;
  }

  for (let child of root.getChildren()) {
    renameVariableGetters(child, sourceBlockId, oldIdentifier, newIdentifier);
  }
}

function saveLocal() {
  let xml = Blockly.Xml.workspaceToDom(workspace);
  xml = Blockly.Xml.domToPrettyText(xml);
  localStorage.setItem('last', xml);
}

function dumpXML() {
  let xml = Blockly.Xml.workspaceToDom(workspace);
  xml = Blockly.Xml.domToPrettyText(xml);
  console.log(xml);
}

function interpret() {
  // We must also check that the workspace is valid we may be trying to set the
  // warning text of disposed block.
  if (lastWarnedBlock && lastWarnedBlock.workspace) {
    lastWarnedBlock.setWarningText(null);
    lastWarnedBlock = null;
  }

  saveLocal();

  try {
    let statements = [];

    // Grab functions first.
    for (let root of workspace.getTopBlocks()) {
      if (root.type == 'to') {
        statements.push(root.tree());
      }
    }

    // And everything else second.
    for (let root of workspace.getTopBlocks()) {
      if (root.type != 'to') {
        while (root) {
          if (root.outputConnection) {
            throw new ParseException(root, 'I found this stray value block and I wasn\'t sure what to do with it.');
          } else {
            statements.push(root.tree());
            root = root.getNextBlock();
          }
        }
      }
    }

    let program = new StatementProgram(new StatementBlock(statements));

    let env = {
      isChord: false,
      root: 0,
      scale: 'major',
      iMeasure: 2,
      beats: 0,
      halfstep: 48,
      beatsPerMeasure: 4,
      beatNote: 4,
      bindings: {},
      marks: [],
      sequences: [],
      isSlur: false,
      push: function(item) {
        this.sequences.push(item);
      },
      pop: function(item) {
        return this.sequences.pop(item);
      },
      emit: function(item) {
        return this.sequences[this.sequences.length - 1].push(item);
      },
    };
    program.evaluate(env);

    if (env.sequences[0].items.length > 0) {
      $('#score').show();
      let xml = env.sequences[0].toXML(env);
      document.getElementById('scratch').value = xml;
      render();
    } else {
      $('#score').hide();
    }
  } catch (e) {
    lastWarnedBlock = e.block;
    if (e.hasOwnProperty('block')) {
      e.block.select();
      e.block.setWarningText(wrap(e.message, 15));
    } else {
      throw e;
    }
  }
}

function wrap(s, lineLength) {
  let pattern = '(.{' + lineLength + ',}?)(\\s+)';
  return s.replace(new RegExp(pattern, 'g'), '$1\n');
}

function render() {
  let musicXML = document.getElementById('scratch').value;
  if (musicXML.length > 0) {
    musicXML = new TextEncoder().encode(musicXML);
    $('#score').alphaTab('load', musicXML);
  }
}

function workspaceToXml() {
  let xml = Blockly.Xml.workspaceToDom(workspace);
  return Blockly.Xml.domToPrettyText(xml);
}

// Blockly.duplicate_ = function(block) {
  // Save the clipboard.
  // var clipboardXml = Blockly.clipboardXml_;
  // var clipboardSource = Blockly.clipboardSource_;

  // Create a duplicate via a copy/paste operation.
  // Blockly.copy_(block);
  // console.log("Blockly.clipboardXml_:", Blockly.clipboardXml_);
  // block.workspace.paste(Blockly.clipboardXml_);

  // Restore the clipboard.
  // Blockly.clipboardXml_ = clipboardXml;
  // Blockly.clipboardSource_ = clipboardSource;
// };

// let oldOld = Blockly.Xml.domToBlockHeadless_;
// Blockly.Xml.domToBlockHeadless_ = function(xmlBlock, workspace) {
  // var id = xmlBlock.getAttribute('id');
  // console.log("xmlBlock:", xmlBlock);
  // console.log("id:", id);
  // return oldOld(xmlBlock, workspace);
// }

// Blockly.WorkspaceSvg.prototype.newBlock = function(prototypeName, opt_id) {
  // console.log("prototypeName:", prototypeName);
  // console.log("opt_id:", opt_id);
    // return new Blockly.BlockSvg(this, prototypeName, opt_id);
// };

function copyWorkspace() {
  // The clipboard API is new. See https://developers.google.com/web/updates/2018/03/clipboardapi.
  let xml = workspaceToXml();
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
      let dom = Blockly.Xml.textToDom(xml);
      Blockly.Xml.domToWorkspace(dom, workspace);
    })
    .catch(error => {
      console.log('error:', error);
    });
}

window.addEventListener('load', setup);
