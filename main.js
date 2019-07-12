let workspace = null;

let expressionColor = 270;
let statementColor = 180;
let parameterColor = 330;
let lastWarnedBlock = null;
let hasManualInterpretation = false;
let scoreRoot;
let triggerEvent = null;
let nRenames = 0;

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

let heptatonicOffsets = {
  up:   [2, 0, 2, 0, 1, 2, 0, 2, 0, 2, 0, 1],
  down: [1, 0, 2, 0, 2, 1, 0, 2, 0, 2, 0, 2],
}

let scales = [
  ['chromatic', '-1'],
  ['major (ionian)', '0'],
  ['dorian', '1'],
  ['phrygian', '2'],
  ['lydian', '3'],
  ['mixolydian', '4'],
  ['minor (aeolian)', '5'],
  ['locrian', '6'],
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

let DeltaUnit = Object.freeze({
  KeystepsFromRoot: { label: 'keysteps from root', value: 0 },
  KeystepsFromPrevious: { label: 'keysteps from previous', value: 1 },
  HalfstepsFromRoot: { label: 'halfsteps from root', value: 2 },
  HalfstepsFromPrevious: { label: 'halfsteps from previous', value: 3 },
});

let IntervalName = Object.freeze({
  Unison: { label: 'unison', value: 0 },
  Second: { label: '2nd', value: 2 },
  Third: { label: '3rd', value: 4 },
  Fourth: { label: '4th', value: 5 },
  Fifth: { label: '5th', value: 7 },
  Sixth: { label: '6th', value: 9 },
  Seventh: { label: '7th', value: 11 },
  Octave: { label: '8th', value: 12 },
});

let IntervalDirection = Object.freeze({
  Up: { label: 'up', value: 1 },
  Down: { label: 'down', value: -1 },
});

let IntervalQuality = Object.freeze({
  Perfect: { label: 'perfect', value: 0 },
  Major: { label: 'major', value: 1 },
  Minor: { label: 'minor', value: 2 },
  Diminished: { label: 'diminished', value: 3 },
  Augmented: { label: 'augmented', value: 4 },
});

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
    xml += '      <direction>\n';
    xml += '        <direction-type>\n';
    xml += '          <metronome>\n';
    xml += '            <beat-unit>quarter</beat-unit>\n';
    xml += '            <per-minute>' + env.bpm + '</per-minute>\n';
    xml += '          </metronome>\n';
    xml += '        </direction-type>\n';
    xml += '        <sound tempo="' + env.bpm + '"/>\n';
    xml += '      </direction>\n';
    xml += '      <attributes>\n';
    xml += '        <divisions>8</divisions>\n';
    xml += '        <key>\n';
    xml += '          <fifths>' + env.nfifths + '</fifths>\n';
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
    this.block = block;
  }

  toXML(env) {
    let xml = '';

    if (env.beats == env.beatsPerMeasure * (4 / env.beatNote)) {
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

    if (env.beats == env.beatsPerMeasure * (4 / env.beatNote)) {
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

    if (env.beats == env.beatsPerMeasure * (4 / env.beatNote)) {
      xml += breakMeasure(env);
      env.beats = 0;
    }

    xml += '<barline location="left">\n';
    xml += '  <bar-style>heavy-light</bar-style>\n';
    xml += '  <repeat direction="forward"/>\n';
    xml += '</barline>';

    xml += this.common.toXML(env);

    if (env.beats == env.beatsPerMeasure * (4 / env.beatNote)) {
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

    if (env.beats == env.beatsPerMeasure * (4 / env.beatNote)) {
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
    this.notes.forEach((note, index) => {
      note.chordIndex = index;
    });
  }

  toXML(env) {
    return this.notes.map(note => note.toXML(env)).join('\n');
  }
}

class Note {
  constructor(id, duration, block) {
    this.id = id;
    this.isDotted = duration < 0;
    this.duration = Math.abs(duration);
    this.chordIndex = -1;
    this.isFirstNote = false;
    this.isLastNote = false;
    this.isMiddleNote = false;
    this.block = block;
  }

  toXML(env) {
    let xml = '';

    if (this.chordIndex <= 0) {
      if (env.beats == env.beatsPerMeasure * (4 / env.beatNote)) {
        xml += breakMeasure(env);
        env.beats = 0;
      }
      env.beats += 4 / this.duration;
      if (this.isDotted) {
        // 4 -> 4 / 4 + 4 / (4 * 2) -> 1 + 0.5
        env.beats += 4 / (this.duration * 2);
      }

      if (env.beats > env.beatsPerMeasure) {
        let thing = this.chordIndex >= 0 ? 'chord' : 'note';
        throw new RuntimeException(this.block, `This ${thing} doesn't fit in the measure.`);
      }
    }

    let spelling = env.noteSpellings[this.id % 12];
    let octave = Math.floor(this.id / 12) - 1;

    // We may have enharmonic'd around the octave.
    if (spelling == 'B#') {
      --octave;
    } else if (spelling == 'Cb') {
      ++octave;
    }

    let suffix = spelling.substring(1);
    let alter;

    if (suffix === '##') {
      alter = 2;
    } else if (suffix === '#') {
      alter = 1;
    } else if (suffix === 'b') {
      alter = -1;
    } else if (suffix === 'bb') {
      alter = -2;
    } else {
      alter = 0;
    }

    // 32 - 2^5 -  1
    // 16 - 2^4 -  2
    //  8 - 2^3 -  4
    //  4 - 2^2 -  8
    //  2 - 2^1 - 16
    //  1 - 2^0 - 32
    let exponent = Math.log2(this.duration);
    let d = Math.pow(2, 5 - exponent);
    xml += '<note><pitch><step>' + spelling[0] + '</step><alter>' + alter + '</alter><octave>' + octave + `</octave></pitch><duration>${d}</duration><type>` + durationToName(this.duration) + '</type>';

    if (this.chordIndex > 0) {
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
  constructor(duration, block) {
    this.duration = duration;
    this.block = block;
  }

  toXML(env) {
    let xml = '';
    if (env.beats == env.beatsPerMeasure) {
      xml += breakMeasure(env);
      env.beats = 0;
    }
    env.beats += 4 / this.duration;
    if (env.beats > env.beatsPerMeasure) {
      throw new RuntimeException(this.block, 'This rest doesn\'t fit in the measure.');
    }
    xml += '<note><rest measure="yes"/><duration>' + this.duration + '</duration></note>\n';
    return xml;
  }
}

class ExpressionBoolean {
  constructor(value) {
    this.value = value;
  }

  async evaluate(env) {
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

  async evaluate(env) {
    return this;
  }

  toInteger() {
    return this.value;
  }

  toReal() {
    return this.value;
  }

  toBoolean() {
    return this.value == 0 ? false : true;
  }

  toString() {
    return '' + this.value;
  }
}

class ExpressionString {
  constructor(value) {
    this.value = value;
  }

  async evaluate(env) {
    return this;
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

  async evaluate(env) {
    let octaveValue = (await this.octave.evaluate(env)).toInteger();
    let letterValue = (await this.letter.evaluate(env)).toInteger();
    let accidentalValue = (await this.accidental.evaluate(env)).toInteger();
    let halfstep = 12 * (octaveValue + 1) + letterValue + accidentalValue;
    return new PrimitivePosition(letterValue, accidentalValue, octaveValue, halfstep);
  }
}

class ExpressionInterval {
  constructor(quality, name, direction, block) {
    this.quality = quality;
    this.name = name;
    this.direction = direction;
    this.block = block;
  }

  async evaluate(env) {
    let qualityValue = enumByValue(IntervalQuality, (await this.quality.evaluate(env)).toInteger());
    let nameValue = enumByValue(IntervalName, (await this.name.evaluate(env)).toInteger());
    let directionValue = enumByValue(IntervalDirection, (await this.direction.evaluate(env)).toInteger());
    let jump = nameValue.value;

    if (qualityValue == IntervalQuality.Perfect) {
      if (nameValue != IntervalName.Unison &&
          nameValue != IntervalName.Fourth &&
          nameValue != IntervalName.Fifth &&
          nameValue != IntervalName.Octave) {
        throw new RuntimeException(this.block, `You asked for a perfect ${nameValue.label}, but there's no such thing as a perfect ${nameValue.label}. Only unison, 4th, 5th, and octave intervals can be perfect.`);
      }
    } else if (qualityValue == IntervalQuality.Major || qualityValue == IntervalQuality.Minor) {
      if (nameValue != IntervalName.Second &&
          nameValue != IntervalName.Third &&
          nameValue != IntervalName.Sixth &&
          nameValue != IntervalName.Seventh) {
        throw new RuntimeException(this.block, `You asked for a ${qualityValue.label} ${nameValue.label}, but there's no such thing as a ${qualityValue.label} ${nameValue.label}. Only 2nd, 3rd, 6th, and 7th intervals can be ${qualityValue.label}.`);
      }

      // Minor intervals are down one halfstep from major.
      if (qualityValue == IntervalQuality.Minor) {
        jump -= 1;
      }
    } else if (qualityValue == IntervalQuality.Diminished) {
      jump -= 1;
      if (nameValue == IntervalName.Second ||
          nameValue == IntervalName.Third ||
          nameValue == IntervalName.Sixth ||
          nameValue == IntervalName.Seventh) {
        jump -= 1;
      }
    } else if (qualityValue == IntervalQuality.Augmented) {
      jump += 1;
    }

    // env.halfstep += jump * directionValue.value;

    return new PrimitiveInterval(qualityValue, nameValue, directionValue, env.halfstep + jump * directionValue.value);
  }
}

class PrimitivePosition {
  constructor(letter, accidental, octave, halfstep) {
    this.letter = letter;
    this.accidental = accidental;
    this.octave = octave;
    this.halfstep = halfstep;
  }

  async evaluate(env) {
    return this;
  }

  toString() {
    return `${this.note} ${this.accidental} ${this.octave}`;
  }

  toInteger() {
    return this.halfstep;
  }
}

class PrimitiveDelta {
  constructor(delta, unit, halfstep) {
    this.delta = delta;
    this.unit = unit;
    this.halfstep = halfstep;
  }

  async evaluate(env) {
    return this;
  }

  toString() {
    return `${this.delta} ${this.unit}`;
  }

  toInteger() {
    return this.halfstep;
  }
}

class PrimitiveChord {
  constructor(notes) {
    this.notes = notes;
  }

  async evaluate(env) {
    return this;
  }

  toString() {
    return 'asdfa';
  }

  toArray() {
    return this.notes;
  }
}

class PrimitiveInterval {
  constructor(quality, name, direction, halfstep) {
    this.quality = quality;
    this.name = name;
    this.direction = direction;
    this.halfstep = halfstep;
  }

  async evaluate(env) {
    return this;
  }

  toString() {
    return `${this.quality.label} ${this.name.label} ${this.direction.label}`;
  }

  toInteger() {
    return this.halfstep;
  }
}

class ExpressionDelta {
  constructor(deltaValue, deltaUnit, block) {
    this.deltaValue = deltaValue;
    this.deltaUnit = deltaUnit;
    this.block = block;
  }

  async evaluate(env) {
    let value = (await this.deltaValue.evaluate(env)).toInteger();
    let jump;
    let deltaUnitValue = enumByValue(DeltaUnit, this.deltaUnit.value);

    let from;
    if (deltaUnitValue == DeltaUnit.HalfstepsFromRoot || deltaUnitValue == DeltaUnit.KeystepsFromRoot) {
      from = env.root;
    } else {
      from = env.halfstep;
    }

    // env.halfstep = env.marks[env.marks.length - 1];
    if (deltaUnitValue == DeltaUnit.HalfstepsFromRoot || deltaUnitValue == DeltaUnit.HalfstepsFromPrevious) {
      jump = value;
    } else {
      let base = ((from - env.scaleRoot) % 12 + 12) % 12;
      jump = 0;

      if (value > 0) {
        for (let i = 0; i < value; ++i) {
          let delta = heptatonicOffsets.up[(base + env.rotation) % 12];
          if (delta == 0) {
            throw new RuntimeException(this.block, 'You asked me to jump up in the current key, but the note you are jumping from is not in the current key.');
          }
          jump += delta;
          base = (base + delta) % 12;
        }
      } else if (value < 0) {
        for (let i = 0; i < -value; ++i) {
          let delta = heptatonicOffsets.down[(base + env.rotation) % 12];
          if (delta == 0) {
            throw new RuntimeException(this.block, 'You asked me to jump down in the current key, but the note you are jumping from is not in the current key.');
          }
          jump -= delta;
          base = (base - delta + 12) % 12;
        }
      }
    }

    return new PrimitiveDelta(value, this.deltaUnit.value, from + jump);
  }
}

class ExpressionScale {
  constructor(value) {
    this.value = value;
  }

  async evaluate(env) {
    return this;
  }

  toInteger() {
    return this.value;
  }
}

class ExpressionAdd {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  async evaluate(env) {
    let valueA = (await this.a.evaluate(env)).toInteger();
    let valueB = (await this.b.evaluate(env)).toInteger();
    return new ExpressionInteger(valueA + valueB);
  }
}

class ExpressionSubtract {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  async evaluate(env) {
    let valueA = (await this.a.evaluate(env)).toInteger();
    let valueB = (await this.b.evaluate(env)).toInteger();
    return new ExpressionInteger(valueA - valueB);
  }
}

class ExpressionMultiply {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  async evaluate(env) {
    let valueA = (await this.a.evaluate(env)).toInteger();
    let valueB = (await this.b.evaluate(env)).toInteger();
    return new ExpressionInteger(valueA * valueB);
  }
}

class ExpressionDivide {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  async evaluate(env) {
    let valueA = (await this.a.evaluate(env)).toInteger();
    let valueB = (await this.b.evaluate(env)).toInteger();
    return new ExpressionInteger(Math.floor(valueA / valueB));
  }
}

class ExpressionRemainder {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  async evaluate(env) {
    let valueA = (await this.a.evaluate(env)).toInteger();
    let valueB = (await this.b.evaluate(env)).toInteger();
    return new ExpressionInteger(valueA % valueB);
  }
}

class ExpressionPower {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  async evaluate(env) {
    let valueA = (await this.a.evaluate(env)).toInteger();
    let valueB = (await this.b.evaluate(env)).toInteger();
    return new ExpressionInteger(Math.pow(valueA, valueB));
  }
}

// Logic ----------------------------------------------------------------------

class ExpressionLess {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  async evaluate(env) {
    let valueA = (await this.a.evaluate(env)).toInteger();
    let valueB = (await this.b.evaluate(env)).toInteger();
    return new ExpressionBoolean(valueA < valueB);
  }
}

class ExpressionLessEqual {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  async evaluate(env) {
    let valueA = (await this.a.evaluate(env)).toInteger();
    let valueB = (await this.b.evaluate(env)).toInteger();
    return new ExpressionBoolean(valueA <= valueB);
  }
}

class ExpressionMore {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  async evaluate(env) {
    let valueA = (await this.a.evaluate(env)).toInteger();
    let valueB = (await this.b.evaluate(env)).toInteger();
    return new ExpressionBoolean(valueA > valueB);
  }
}

class ExpressionMoreEqual {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  async evaluate(env) {
    let valueA = (await this.a.evaluate(env)).toInteger();
    let valueB = (await this.b.evaluate(env)).toInteger();
    return new ExpressionBoolean(valueA >= valueB);
  }
}

class ExpressionEqual {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  async evaluate(env) {
    let valueA = (await this.a.evaluate(env)).toInteger();
    let valueB = (await this.b.evaluate(env)).toInteger();
    return new ExpressionBoolean(valueA == valueB);
  }
}

class ExpressionNotEqual {
  constructor(a, b) {
    this.a = a;
    this.b = b;
  }

  async evaluate(env) {
    let valueA = (await this.a.evaluate(env)).toInteger();
    let valueB = (await this.b.evaluate(env)).toInteger();
    return new ExpressionBoolean(valueA != valueB);
  }
}

// ----------------------------------------------------------------------------

class ExpressionRandom {
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }

  async evaluate(env) {
    let minValue = (await this.min.evaluate(env)).toInteger();
    let maxValue = (await this.max.evaluate(env)).toInteger();
    return new ExpressionInteger(Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue);
  }
}

class ExpressionReal {
  constructor(value) {
    this.value = value;
  }

  async evaluate(env) {
    return this;
  }

  toReal(env) {
    return this.value;
  }

  toString() {
    return '' + this.value;
  }
}

class ExpressionRaffle {
  constructor(collection) {
    this.collection = collection;
  }

  async evaluate(env) {
    let collectionValue = await this.collection.evaluate(env);
    let i = Math.floor(Math.random() * collectionValue.size());
    return collectionValue.get(i);
  }
}

class ExpressionList {
  constructor(elements) {
    this.elements = elements;
  }

  async evaluate(env) {
    let newElements = [];
    for (let i = 0; i < this.elements.length; ++i) {
      newElements[i] = await this.elements[i].evaluate(env);
    }
    return new ExpressionList(newElements);
  }

  size() {
    return this.elements.length;
  }

  get(i) {
    return this.elements[i];
  }

  toString() {
    return this.elements.toString();
  }
}

class ExpressionChord {
  constructor(notes) {
    this.notes = notes;
  }

  async evaluate(env) {
    let ids = [];
    for (let i = 0; i < this.notes.length; ++i) {
      let note = await this.notes[i].evaluate(env);
      env.halfstep = note.toInteger();
      ids.push(note);
    }
    if (ids.length > 0) {
      env.halfstep = ids[0].toInteger();
    }
    return new PrimitiveChord(ids);
  }
}

class ExpressionInvert {
  constructor(chord, delta, block) {
    this.chord = chord;
    this.delta = delta;
  }

  async evaluate(env) {
    let ids = (await this.chord.evaluate(env)).toArray();
    let deltaValue = (await this.delta.evaluate(env)).toInteger();

    if (deltaValue > 0) {
      for (let i = 0; i < deltaValue; ++i) {
        let lopped = ids[0];
        ids.splice(0, 1);
        lopped.halfstep += 12;
        ids.push(lopped);
      }
    } else {
      for (let i = 0; i < -deltaValue; ++i) {
        let lopped = ids[ids.length - 1];
        lopped.halfstep -= 12;
        ids.splice(ids.length - 1, 1);
        ids.splice(0, 0, lopped);
      }
    }

    if (ids.length > 0) {
      env.halfstep = ids[0].toInteger();
    }

    return new PrimitiveChord(ids);
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

  async evaluate(env) {
    console.log((await this.message.evaluate(env)).toString());
  }
}

class StatementRest {
  constructor(duration) {
    this.duration = duration;
  }

  async evaluate(env) {
    let durationValue = (await this.duration.evaluate(env)).toInteger();
    env.emit(new Rest(durationValue, this));
  }
}

class StatementRoot {
  constructor() {
  }

  async evaluate(env) {
    env.root = env.halfstep;
  }
}

class StatementMark {
  constructor() {
  }

  async evaluate(env) {
    env.marks.push(env.halfstep);
  }
}

class StatementBack {
  constructor() {
  }

  async evaluate(env) {
    env.halfstep = env.marks[env.marks.length - 1];
  }
}

class StatementUnmark {
  constructor() {
  }

  async evaluate(env) {
    env.marks.pop();
  }
}

class StatementBeatsPerMinute {
  constructor(beatsPerMinute, block) {
    this.beatsPerMinute = beatsPerMinute;
    this.block = block;
  }

  async evaluate(env) {
    let bpm = (await this.beatsPerMinute.evaluate(env)).toInteger();
    if (bpm < 15) {
      throw new RuntimeException(this.block, `Whoa. ${bpm} beats per minute is too slow.`);
    } else if (bpm > 960) {
      throw new RuntimeException(this.block, `Whoa. ${bpm} beats per minute is too fast.`);
    }
    env.bpm = bpm;
  }
}

class StatementTimeSignature {
  constructor(beatsPerMeasure, beatNote) {
    this.beatsPerMeasure = beatsPerMeasure;
    this.beatNote = beatNote;
  }

  async evaluate(env) {
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

  async evaluate(env) {
    let letterOffset = (await this.letter.evaluate(env)).toInteger();
    let accidentalOffset = (await this.accidental.evaluate(env)).toInteger();
    let scale = (await this.scale.evaluate(env)).toInteger();
    setKeySignature(env, letterOffset, accidentalOffset);
  }
}

function setKeySignature(env, letterOffset, accidentalOffset, scale) {
  env.scaleRoot = letterOffset + accidentalOffset;
  env.halfstep = 12 * (letterOffset >= 9 ? 3 : 4) + env.scaleRoot;
  env.scale = scale;
  env.rotation = 0;

  for (let i = 0; i < env.scale; ++i) {
    env.rotation += heptatonicOffsets.up[env.rotation]; 
  }

  let letterLabel = letters.find(([label, offset]) => offset == letterOffset)[0];
  let accidentalLabel;
  if (accidentalOffset > 0) {
    accidentalLabel = '#';
  } else if (accidentalOffset < 0) {
    accidentalLabel = 'b';
  } else {
    accidentalLabel = '';
  }

  // C   D   E F   G   A   B
  // 2 0 2 0 1 2 0 2 0 2 0 1
  // 0 1 2 3 4 5 6 7 8 9 0 1
  
  let offsets = [];
  let current = 0;
  for (let i = 0; i < 6; ++i) {
    let index = (env.rotation + current) % 12;
    offsets.push(heptatonicOffsets.up[index]);
    current += heptatonicOffsets.up[index];
  }

  current = (env.scaleRoot % 12 + 12) % 12;    
  let firstSpelling = `${letterLabel}${accidentalLabel}`;
  env.noteSpellings = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  env.noteSpellings[current] = firstSpelling;
  env.scaleSpellings = [firstSpelling];

  let usedLetters = new Set();
  usedLetters.add(letterLabel);
  let ordinalA = 'A'.charCodeAt(0);

  for (let offset of offsets) {
    current = (current + offset) % 12;
    letterLabel = String.fromCharCode((letterLabel.charCodeAt(0) + 1 - ordinalA) % 7 + ordinalA);
    let spelling = possibleNoteSpellings[current].enharmonics.find(spelling => spelling.startsWith(letterLabel));
    if (spelling) {
      env.noteSpellings[current] = spelling;
      env.scaleSpellings.push(spelling);
      usedLetters.add(spelling.charAt(0));
    } else {
      console.err("uh oh");
    }
  }

  let nsharps = env.scaleSpellings.reduce((sum, spelling) => sum + countChars(spelling, '#'), 0);
  let nflats = env.scaleSpellings.reduce((sum, spelling) => sum + countChars(spelling, 'b'), 0);

  env.nfifths = 0;
  if (nsharps > 0) {
    env.nfifths = nsharps;
  } else if (nflats > 0) {
    env.nfifths = -nflats;
  }

  // console.log(env.scaleSpellings.reduce((joined, spelling) => `${joined} ${spelling}`));

  for (let i = 0; i < env.noteSpellings.length; ++i) {
    if (env.noteSpellings[i] === 0) {
      env.noteSpellings[i] = possibleNoteSpellings[i].canonical;
    }
  }
}

function countChars(s, c) {
  let count = 0;
  for (let i = 0; i < s.length; ++i) {
    if (s[i] == c) {
      ++count;
    }
  }
  return count;
}

// https://randscullard.com/CircleOfFifths/
let possibleNoteSpellings = [
  { canonical: 'C', enharmonics: ['B#', 'C', 'Dbb'] },
  { canonical: 'C#', enharmonics: ['B##', 'C#', 'Db'] },
  { canonical: 'D', enharmonics: ['C##', 'D', 'Ebb'] },
  { canonical: 'Eb', enharmonics: ['D#', 'Eb', 'Fbb'] },
  { canonical: 'E', enharmonics: ['D##', 'E', 'Fb'] },
  { canonical: 'F', enharmonics: ['E#', 'F', 'Gbb'] },
  { canonical: 'F#', enharmonics: ['E##', 'F#', 'Gb'] },
  { canonical: 'G', enharmonics: ['Abb', 'F##', 'G'] },
  { canonical: 'Ab', enharmonics: ['Ab', 'G#'] },
  { canonical: 'A', enharmonics: ['A', 'Bbb', 'G##'] },
  { canonical: 'Bb', enharmonics: ['A#', 'Bb', 'Cbb'] },
  { canonical: 'B', enharmonics: ['A##', 'B', 'Cb'] },
]

class StatementBlock {
  constructor(statements) {
    this.statements = statements;
  }

  async evaluate(env) {
    for (let statement of this.statements) {
      await statement.evaluate(env);
    }
  }
}

class StatementProgram {
  constructor(block) {
    this.block = block;
  }

  async evaluate(env) {
    env.push(new Song());
    await this.block.evaluate(env);
  }
}

class StatementGet {
  constructor(identifier) {
    this.identifier = identifier;
  }

  async evaluate(env) {
    return env.variables[this.identifier].value;
  }
}

class StatementReturn {
  constructor(value) {
    this.value = value;
  }

  async evaluate(env) {
    throw new Return(await this.value.evaluate(env));
  }
}

class StatementSet {
  constructor(identifier, rhs) {
    this.identifier = identifier;
    this.rhs = rhs;
  }

  async evaluate(env) {
    let rhsValue = await this.rhs.evaluate(env);
    env.variables[this.identifier] = {
      identifier: this.identifier,
      value: rhsValue,
    };
  }
}

class StatementTo {
  constructor(identifier, parameters, body, block) {
    this.identifier = identifier;
    this.parameters = parameters;
    this.body = body;
    this.block = block;

    let ids = this.block.deltaphone.parameters.map(p => p.identifier).sort();
    for (let i = 1; i < ids.length; ++i) {
      if (ids[i] == ids[i - 1]) {
        throw new RuntimeException(this.block, `I found more than one parameter named '${ids[i]}'. Parameter names must be unique, or weird stuff happens.`);
      }
    }
  }

  async evaluate(env) {
    env.functions[this.identifier] = {
      identifier: this.identifier,
      parameters: this.parameters,
      body: this.body,
    };
  }
}

class StatementVariableGetter {
  constructor(identifier, block) {
    this.identifier = identifier;
    this.block = block;
  }

  async evaluate(env) {
    if (this.block.deltaphone.hasOwnProperty('formalBlockId') && workspace.getBlockById(this.block.deltaphone.formalBlockId).getParent().id != this.block.getRootBlock().id) {
      throw new RuntimeException(this.block, `I found a parameter reference outside of its function. Parameter references are only meaningful inside their function.`);
    } else if (!env.variables.hasOwnProperty(this.identifier)) {
      throw new RuntimeException(this.block, `I don't know anything about variable ${this.identifier}. You haven't defined it.`);
    } else {
      return await env.variables[this.identifier].value.evaluate(env);
    }
  }
}

class StatementCall {
  constructor(identifier, actualParameters) {
    this.identifier = identifier;
    this.actualParameters = actualParameters;
  }

  async evaluate(env) {
    let localVariables = {};
    for (let actualParameter of this.actualParameters) {
      let value;
      if (actualParameter.mode == 'value') {
        value = await actualParameter.expression.evaluate(env);
      } else {
        value = actualParameter.expression;
      }

      localVariables[actualParameter.identifier] = {
        identifier: actualParameter.identifier,
        value: value,
      };
    }

    let oldBindings = env.variables;
    env.variables = localVariables;
    let body = env.functions[this.identifier].body;

    let result;
    try {
      result = await body.evaluate(env);
    } catch (e) {
      if (e instanceof Return) {
        result = e.value;
      } else {
        throw e;
      }
    } finally {
      env.variables = oldBindings;
    }

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

  async evaluate(env) {
    let start = (await this.lo.evaluate(env)).toInteger();
    let stop = (await this.hi.evaluate(env)).toInteger();
    if (!this.isInclusive) {
      stop -= 1;
    }

    let delta = (await this.by.evaluate(env)).toInteger();

    if (delta == 0 ||
        (delta > 0 && stop < start) ||
        (delta < 0 && stop > start)) {
      throw new RuntimeException(this.block, 'I saw that this loop will run forever. I refuse to operate under these conditions.');
    }

    for (let i = start; i <= stop; i += delta) {
      env.variables[this.identifier] = {
        identifier: this.identifier,
        value: new ExpressionInteger(i),
      };
      await this.body.evaluate(env);
    }
  }
}

class StatementIf {
  constructor(conditions, thenBodies, elseBody) {
    this.conditions = conditions;
    this.thenBodies = thenBodies;
    this.elseBody = elseBody;
  }

  async evaluate(env) {
    for (let [i, condition] of this.conditions.entries()) {
      if ((await condition.evaluate(env)).toBoolean()) {
        await this.thenBodies[i].evaluate(env);
        return;
      }
    }

    if (this.elseBody) {
      await this.elseBody.evaluate(env);
    }
  }
}

class StatementRepeat {
  constructor(block) {
    this.block = block;
  }

  async evaluate(env) {
    env.push(new Repeat());
    await this.block.evaluate(env);
    let sequence = env.pop();
    env.emit(sequence);
  }
}

class StatementSleep {
  constructor(block, seconds) {
    this.block = block;
    this.seconds = seconds;
  }

  async evaluate(env) {
    let secondsValue = (await this.seconds.evaluate(env)).toReal();
    await new Promise(resolve => setTimeout(resolve, secondsValue * 1000));
  }
}

class StatementPlayScore {
  constructor(block) {
    this.block = block;
  }

  async evaluate(env) {
    generateScore(env);
    $('#score').alphaTab('playPause');
  }
}

class StatementPlayScoreAndWait {
  constructor(block) {
    this.block = block;
  }

  async evaluate(env) {
    generateScore(env);
    $('#score').alphaTab('playPause');
    await new Promise(resolve => $('#score').on('alphaTab.finished', () => {
      resolve();
    }));
  }
}

class StatementClearScore {
  constructor(block) {
    this.block = block;
  }

  async evaluate(env) {
    env.beats = 0;
    env.sequences = [new Song()];
    env.iMeasure = 0;
  }
}

class StatementShowScore {
  constructor(block) {
    this.block = block;
  }

  async evaluate(env) {
    $('#score').show();
  }
}

class StatementHideScore {
  constructor(block) {
    this.block = block;
  }

  async evaluate(env) {
    $('#score').hide();
  }
}

class StatementQuiz {
  constructor(block, message, answer, choices) {
    this.block = block;
    this.message = message;
    this.answer = answer;
    this.choices = choices;
  }

  async evaluate(env) {
    let choiceValues = (await this.choices.evaluate(env)).elements;
    let answerValue = await this.answer.evaluate(env);
    let messageValue = await this.message.evaluate(env);

    $('#hud-bottom').html(`<p>${messageValue}</p>`);

    let select = $(`<select size="${choiceValues.length}" />`).append(choiceValues.map(choice => `<option>${choice.toString()}</option>`));
    let p = $('<p />').append(select);
    $('#hud-bottom').append(p);

    let checkButton = $('<p><button>Check</button> <span id="feedback-label"></span></p>');
    $('#hud-bottom').append(checkButton);

    $('#hud-bottom').slideDown(500);
    await new Promise(resolve => {
      checkButton.click(() => {
        let selectedIndex = $(select)[0].selectedIndex;
        if (choiceValues[selectedIndex] == answerValue) {
          $('#feedback-label').html(`That's right!`);
          setTimeout(() => {
            $('#hud-bottom').slideUp(500, () => resolve());
          }, 500);
        } else {
          $('#feedback-label').html(`Nope, it's not ${choiceValues[selectedIndex].toString()}. Try again.`);
        }
      });
    });
  }
}

class StatementWaitForClick {
  constructor(block, message) {
    this.block = block;
    this.message = message;
  }

  async evaluate(env) {
    let messageValue = (await this.message.evaluate(env)).toString();

    $('#hud-bottom').empty();
    let button = $(`<p><button>${messageValue}</button></p>`);
    $('#hud-bottom').append(button);

    $('#hud-bottom').slideDown();
    await new Promise(resolve => {
      button.click(() => {
        $('#hud-bottom').slideUp(500, () => resolve());
      });
    });
  }
}

class StatementSlur {
  constructor(block) {
    this.block = block;
  }

  async evaluate(env) {
    env.push(new Slur());
    await this.block.evaluate(env);
    let sequence = env.pop();
    env.emit(sequence);
  }
}

class StatementX {
  constructor(count, block) {
    this.count = count;
    this.block = block;
  }

  async evaluate(env) {
    let n = (await this.count.evaluate(env)).toInteger();
    for (let i = 0; i < n; ++i) {
      await this.block.evaluate(env);
    }
  }
}

class StatementRepeat12 {
  constructor(common, first, second) {
    this.common = common;
    this.first = first;
    this.second = second;
  }

  async evaluate(env) {
    env.push(new Sequence());
    await this.common.evaluate(env);
    let commonSequence = env.pop();

    env.push(new Sequence());
    await this.first.evaluate(env);
    let firstEndingSequence = env.pop();

    env.push(new Sequence());
    await this.second.evaluate(env);
    let secondEndingSequence = env.pop();

    env.emit(new Repeat12(commonSequence, firstEndingSequence, secondEndingSequence));
  }
}

class StatementJump {
  constructor(note) {
    this.note = note;
  }

  async evaluate(env) {
    env.halfstep = (await this.note.evaluate(env)).toInteger();
  }
}

class StatementPlayRelative {
  constructor(deltaValue, deltaUnit, duration, block) {
    this.deltaValue = deltaValue;
    this.deltaUnit = deltaUnit;
    this.duration = duration;
    this.block = block;
  }

  async evaluate(env) {
    let id = (await new ExpressionDelta(this.deltaValue, this.deltaUnit, this.block).evaluate(env)).toInteger();
    env.halfstep = id;
    let durationValue = (await this.duration.evaluate(env)).toInteger();
    env.emit(new Note(id, durationValue, this.block));
  }
}

class StatementPlayInterval {
  constructor(quality, name, direction, duration, block) {
    this.quality = quality;
    this.name = name;
    this.direction = direction;
    this.duration = duration;
    this.block = block;
  }

  async evaluate(env) {
    let id = (await new ExpressionInterval(this.quality, this.name, this.direction, this.block).evaluate(env)).toInteger();
    env.halfstep = id;
    let durationValue = (await this.duration.evaluate(env)).toInteger();
    env.emit(new Note(id, durationValue, this.block));
  }
}

class StatementPlayAbsolute {
  constructor(letter, accidental, octave, duration, block) {
    this.letter = letter;
    this.accidental = accidental;
    this.octave = octave;
    this.duration = duration;
    this.block = block;
  }

  async evaluate(env) {
    let id = (await new ExpressionPosition(this.letter, this.accidental, this.octave).evaluate(env)).toInteger();
    env.halfstep = id;
    let durationValue = (await this.duration.evaluate(env)).toInteger();
    env.emit(new Note(id, durationValue, this.block));
  }
}

class StatementJumpRelative {
  constructor(deltaValue, deltaUnit, block) {
    this.deltaValue = deltaValue;
    this.deltaUnit = deltaUnit;
    this.block = block;
  }

  async evaluate(env) {
    let id = (await new ExpressionDelta(this.deltaValue, this.deltaUnit, this.block).evaluate(env)).toInteger();
    env.halfstep = id;
  }
}

class StatementJumpInterval {
  constructor(quality, name, direction, block) {
    this.quality = quality;
    this.name = name;
    this.direction = direction;
    this.block = block;
  }

  async evaluate(env) {
    let id = (await new ExpressionInterval(this.quality, this.name, this.direction, this.block).evaluate(env)).toInteger();
    env.halfstep = id;
  }
}

class StatementJumpAbsolute {
  constructor(letter, accidental, octave) {
    this.letter = letter;
    this.accidental = accidental;
    this.octave = octave;
  }

  async evaluate(env) {
    let id = (await new ExpressionPosition(this.letter, this.accidental, this.octave).evaluate(env)).toInteger();
    env.halfstep = id;
  }
}

class StatementPlay {
  constructor(note, duration, block) {
    this.note = note;
    this.duration = duration;
    this.block = block;
  }

  async evaluate(env) {
    let durationValue = (await this.duration.evaluate(env)).toInteger();
    let ids = await this.note.evaluate(env);
    if (ids instanceof PrimitiveChord) {
      env.emit(new Chord(ids.toArray().map((id, index) => new Note(id.toInteger(), durationValue, this.block))));
    } else {
      env.emit(new Note(ids.toInteger(), durationValue, this.block));
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

function enumByValue(enumeration, value) {
  return Object.values(enumeration).find(element => element.value == value);
}

function enumToOptions(enumeration) {
  return Object.getOwnPropertyNames(enumeration).map(key => [enumeration[key].label, enumeration[key].value.toString()]);
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
  string: {
    configuration: {
      colour: expressionColor,
      output: 'String',
      message0: '%1',
      args0: [
        { type: 'field_input', name: 'value', text: 'text' },
      ]
    },
    tree: function() {
      return new ExpressionString(this.getFieldValue('value'));
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
      return new ExpressionDelta(childToTree.call(this, 'value'), childToTree.call(this, 'unit'), this);
    }
  },
  interval: {
    configuration: {
      colour: expressionColor,
      output: 'Interval',
      inputsInline: true,
      message0: 'interval %1 %2 %3',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'quality' },
        { type: 'input_value', align: 'RIGHT', name: 'name' },
        { type: 'input_value', align: 'RIGHT', name: 'direction' },
      ]
    },
    tree: function() {
      let quality = childToTree.call(this, 'quality');
      let name = childToTree.call(this, 'name');
      let direction = childToTree.call(this, 'direction');
      return new ExpressionInterval(quality, name, direction, this);
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
        { type: 'field_dropdown', name: 'unit', options: enumToOptions(DeltaUnit) },
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
      return new ExpressionScale(parseInt(this.getFieldValue('value')));
    }
  },
  intervalQuality: {
    configuration: {
      colour: expressionColor,
      output: 'IntervalQuality',
      message0: '%1',
      args0: [
        { type: 'field_dropdown', name: 'value', options: enumToOptions(IntervalQuality) },
      ]
    },
    tree: function() {
      return new ExpressionInteger(parseInt(this.getFieldValue('value')));
    }
  },
  intervalName: {
    configuration: {
      colour: expressionColor,
      output: 'IntervalName',
      message0: '%1',
      args0: [
        { type: 'field_dropdown', name: 'value', options: enumToOptions(IntervalName) },
      ]
    },
    tree: function() {
      return new ExpressionInteger(parseInt(this.getFieldValue('value')));
    }
  },
  intervalDirection: {
    configuration: {
      colour: expressionColor,
      output: 'IntervalDirection',
      message0: '%1',
      args0: [
        { type: 'field_dropdown', name: 'value', options: enumToOptions(IntervalDirection) },
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
      let min = childToTree.call(this, 'min');
      let max = childToTree.call(this, 'max');
      return new ExpressionRandom(min, max);
    }
  },

  // Commands
  beatsPerMinute: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      message0: 'beats per minute %1',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'speed', check: 'Integer' },
      ]
    },
    tree: function() {
      let speed = childToTree.call(this, 'speed');
      return new StatementBeatsPerMinute(speed, this);
    }
  },
  timeSignature: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
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
            ['2/4', '2/4'],
            ['3/8', '3/8'],
            ['6/8', '6/8'],
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
      } else if (signature == '2/4') {
        beatsPerMeasure = 2;
        beatNote = 4;
      } else if (signature == '3/8') {
        beatsPerMeasure = 3;
        beatNote = 8;
      } else if (signature == '6/8') {
        beatsPerMeasure = 6;
        beatNote = 8;
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
      inputsInline: false,
      message0: 'play %1 %2',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'note' },
        { type: 'input_value', align: 'RIGHT', name: 'duration' },
      ]
    },
    tree: function() {
      let note = childToTree.call(this, 'note');
      let duration = childToTree.call(this, 'duration');
      return new StatementPlay(note, duration, this);
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
        { type: 'input_value', align: 'RIGHT', name: 'deltaValue', check: ['Integer']},
        { type: 'input_value', align: 'RIGHT', name: 'deltaUnit', check: ['DeltaUnit']},
      ]
    },
    tree: function() {
      return new StatementJumpRelative(childToTree.call(this, 'deltaValue'), childToTree.call(this, 'deltaUnit'), this);
    }
  },
  jumpInterval: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      message0: 'jump %1 %2 %3',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'quality', check: 'IntervalQuality'},
        { type: 'input_value', align: 'RIGHT', name: 'name', check: 'IntervalName'},
        { type: 'input_value', align: 'RIGHT', name: 'direction', check: 'IntervalDirection'},
      ]
    },
    tree: function() {
      return new StatementJumpInterval(
        childToTree.call(this, 'quality'),
        childToTree.call(this, 'name'),
        childToTree.call(this, 'direction'),
        this
      );
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
                                       childToTree.call(this, 'duration'),
                                       this);
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
        { type: 'input_value', align: 'RIGHT', name: 'deltaValue', check: ['Integer']},
        { type: 'input_value', align: 'RIGHT', name: 'deltaUnit', check: ['DeltaUnit']},
        { type: 'input_value', align: 'RIGHT', name: 'duration' },
      ]
    },
    tree: function() {
      return new StatementPlayRelative(childToTree.call(this, 'deltaValue'), childToTree.call(this, 'deltaUnit'), childToTree.call(this, 'duration'), this);
    }
  },
  playInterval: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      inputsInline: true,
      message0: 'play %1 %2 %3 %4',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'quality', check: 'IntervalQuality'},
        { type: 'input_value', align: 'RIGHT', name: 'name', check: 'IntervalName'},
        { type: 'input_value', align: 'RIGHT', name: 'direction', check: 'IntervalDirection'},
        { type: 'input_value', align: 'RIGHT', name: 'duration' },
      ]
    },
    tree: function() {
      return new StatementPlayInterval(
        childToTree.call(this, 'quality'),
        childToTree.call(this, 'name'),
        childToTree.call(this, 'direction'),
        childToTree.call(this, 'duration'),
        this
      );
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
      mutator: 'setMutator',
      args0: [
        { type: 'field_input', name: 'identifier', text: '' },
        { type: 'field_label', name: 'modeArrow', text: '\u2190' },
      ]
    },
    deltaphone: {
      identifier: null,
      mode: 'value',
    },
  },
  formalParameter: {
    configuration: {
      isMovable: false,
      colour: parameterColor,
      output: null,
      inputsInline: true,
      // extensions: ['extendFormal'],
      // mutator: 'formalMutator',
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
      identifier: null,
      mode: null,
    },
    initializeState: function() {
      let isConnectionAllowedBuiltin = this.outputConnection.isConnectionAllowed;
      this.outputConnection.isConnectionAllowed = (candidate, radius) => {
        // Only connect if this block is scoped properly and Blockly says it's
        // okay. Top-level variables have no formalBlockId. Allow them to
        // connect within non-functions. Formal parameter references have a
        // formalBlockId. All them to connect within their TO scope.
        let candidateRootBlock = candidate.getSourceBlock().getRootBlock();
        if (this.deltaphone.hasOwnProperty('formalBlockId')) {
          let scopeRootBlock = workspace.getBlockById(this.deltaphone.formalBlockId).getParent();
          return candidateRootBlock.id == scopeRootBlock.id && isConnectionAllowedBuiltin.call(this.outputConnection, candidate, radius);
        } else {
          return isConnectionAllowedBuiltin.call(this.outputConnection, candidate, radius);
        }
      };
    },
    tree: function() {
      let identifier = this.getField('identifier').getText();
      return new StatementVariableGetter(identifier, this);
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
      let toBlock = workspace.getBlockById(this.deltaphone.sourceBlockId);
      let formalParameters = toBlock.deltaphone.parameters;
      let functionIdentifier = this.deltaphone.identifier;
      let actualParameters = [];

      // When we have no parameters, we have a dummy input that shouldn't
      // get processed.
      if (formalParameters.length > 0) {
        for (let [i, input] of this.inputList.entries()) {
          let targetBlock = input.connection.targetBlock();
          if (targetBlock != null) {
            if (input.type == Blockly.INPUT_VALUE) {
              actualParameters.push({
                identifier: formalParameters[i].identifier,
                mode: 'value',
                expression: targetBlock.tree(),
              });
            } else {
              actualParameters.push({
                identifier: formalParameters[i].identifier,
                mode: 'action',
                expression: slurpBlock(targetBlock),
              });
            }
          } else {
            throw new ParseException(this, `I am missing my '${formalParameters[i].identifier}' parameter.`);
          }
        }
      }

      return new StatementCall(functionIdentifier, actualParameters);
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
      inputsInline: false,
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
      identifier: null,
    },
    initializeState: function() {
      this.deltaphone.parameters = [];
    },
    tree: function() {
      // TO blocks have 1 + arity + 1 inputs. The first input is the function
      // name. Then the formal parameters. Then the body.

      let identifier = this.getField('identifier').getText();
      let parameters = [];
      for (let i = 1; i < this.inputList.length - 1; ++i) {
        parameters.push({ identifier: this.inputList[i].name });
      }
      let bodyBlock = this.getInputTargetBlock('body');

      return new StatementTo(identifier, parameters, slurpBlock(bodyBlock), this);
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
  sleep: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'sleep %1',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'seconds', check: ['Integer', 'Real'] },
      ],
    },
    tree: function() {
      return new StatementSleep(this, childToTree.call(this, 'seconds'));
    }
  },
  clearScore: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'clear score',
    },
    tree: function() {
      return new StatementClearScore(this);
    }
  },
  playScoreAndWait: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'play score and wait',
    },
    tree: function() {
      return new StatementPlayScoreAndWait(this);
    }
  },
  playScore: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'play score',
    },
    tree: function() {
      return new StatementPlayScore(this);
    }
  },
  hideScore: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'hide score',
    },
    tree: function() {
      return new StatementHideScore(this);
    }
  },
  showScore: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'show score',
    },
    tree: function() {
      return new StatementShowScore(this);
    }
  },
  waitForButton: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'wait for button %1',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'message', check: 'String' },
      ],
    },
    tree: function() {
      return new StatementWaitForClick(this, childToTree.call(this, 'message'));
    }
  },
  quiz: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'quiz %1 %2 %3',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'message', check: 'String' },
        { type: 'input_value', align: 'RIGHT', name: 'answer' },
        { type: 'input_value', align: 'RIGHT', name: 'choices', check: 'List' },
      ],
    },
    tree: function() {
      let message = childToTree.call(this, 'message');
      let answer = childToTree.call(this, 'answer');
      let choices = childToTree.call(this, 'choices');
      return new StatementQuiz(this, message, answer, choices);
    }
  },
  raffle: {
    configuration: {
      colour: expressionColor,
      output: null,
      message0: 'raffle %1',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'list', check: 'List' },
      ],
    },
    tree: function() {
      let list = childToTree.call(this, 'list');
      return new ExpressionRaffle(list);
    }
  },
  list: {
    configuration: {
      colour: expressionColor,
      output: 'List',
      message0: 'list %1 %2 %3',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'element0', check: null },
        { type: 'input_value', align: 'RIGHT', name: 'element1', check: null },
        { type: 'input_value', align: 'RIGHT', name: 'element2', check: null },
      ],
      mutator: 'arityMutator',
      extensions: ['extendArity'],
    },
    deltaphone: {
      arity: 3,
    },
    tree: function() {
      let elements = [];
      for (let i = 0; i < this.deltaphone.arity; ++i) {
        let element = childToTree.call(this, 'element' + i);
        elements.push(element);
      }
      return new ExpressionList(elements);
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
      elementType: ['Delta', 'Position'],
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
  invert: {
    configuration: {
      colour: expressionColor,
      output: 'Chord',
      message0: 'invert %1 %2',
      args0: [
        { type: 'input_value', align: 'RIGHT', name: 'chord', check: ['Chord'] },
        { type: 'input_value', align: 'RIGHT', name: 'delta', check: ['Delta', 'Integer'] },
      ],
    },
    tree: function() {
      let chord = childToTree.call(this, 'chord');
      let delta = childToTree.call(this, 'delta');
      return new ExpressionInvert(chord, delta, this);
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
  root: {
    configuration: {
      colour: statementColor,
      previousStatement: null,
      nextStatement: null,
      message0: 'root',
    },
    tree: function() {
      return new StatementRoot();
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

function mutateUndoably(block, mutate, reshape) {
  // The mutate callback should only touch the block's metadata. The actual
  // reconstruction of the block and reconnection of its children will be
  // handled elsewhere.

  // Get XML of incoming block state.
  let oldMutation = block.mutationToDom();

  // Adjust it.
  mutate();

  // Get XML of outgoing block state.
  let newMutation = block.mutationToDom();

  console.log("oldMutation:", oldMutation);
  console.log("newMutation:", newMutation);

  // Apply XML. TODO: Why do I need this? Isn't the mutation already applied?
  block.domToMutation(newMutation);

  if (reshape) {
    reshape();
  }

  // Record changes in undo stack.
  let event = new Blockly.Events.BlockChange(block, 'mutation', null, Blockly.Xml.domToText(oldMutation), Blockly.Xml.domToText(newMutation));
  Blockly.Events.fire(event);
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

function deleteSet(setBlock) {
  // There are two scopes: in-function and out-function. Each function has its
  // own scope, and functions are neatly organized. Non-function code is more
  // scattered. Variables only get renamed within their function's scope or in
  // the common out-function scope.

  let identifier = setBlock.getInputTargetBlock('identifier').getFieldValue('identifier');

  // TODO this should be variable getter, and it should also look for otherness
  function hasAnotherSetter(root) {
    if (root.type == 'variableGetter' && root.deltaphone.identifier == identifier) {
      return true;
    } else {
      return root.getChildren().some(child => hasAnotherSetter(child)) || (root.getNextBlock() && hasAnotherSetter(root.getNextBlock()));
    }
  }

  function deleteGetters(root) {
    if (root.type == 'variableGetter' && root.deltaphone.identifier == identifier) {
      root.dispose();
    } else {
      for (let child of root.getChildren()) {
        deleteGetters(child);
      }
      if (root.getNextBlock()) {
        deleteGetters(root.getNextBlock());
      }
    }
  }

  let topBlock = setBlock.getRootBlock();
  if (topBlock.type == 'to') {
    if (!hasAnotherSetter(topBlock)) {
      deleteGetters(topBlock);
    }
  } else {
    if (!workspace.getTopBlocks().filter(root => root.type != 'to').some(root => hasAnotherSetter(root))) {
      for (let root of workspace.getTopBlocks()) {
        if (root.type != 'to') {
          deleteGetters(root);
        }
      }
    }
  }

  setBlock.dispose(true);
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

// Calls ----------------------------------------------------------------------

function spawnCall(toBlock, mode) {
  let callBlock = workspace.newBlock('call');

  callBlock.deltaphone.mode = mode;
  shapeCallFromTo(toBlock, callBlock);
  callBlock.initSvg();
  callBlock.render();
  callBlock.select();

  let toPosition = toBlock.getRelativeToSurfaceXY();
  callBlock.moveBy(toPosition.x - 10, toPosition.y + 10);
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
        input = callBlock.appendStatementInput(`actual${index}`);
      } else {
        input = callBlock.appendValueInput(`actual${index}`);
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

function removeInputByIndex(i) {
  let input = this.inputList[i];
  if (input.connection && input.connection.isConnected()) {
    input.connection.setShadowDom(null);
    var block = input.connection.targetBlock();
    if (block.isShadow()) {
      // Destroy any attached shadow block.
      block.dispose();
    } else {
      // Disconnect any attached normal block.
      block.unplug();
    }
  }
  input.dispose();
  this.inputList.splice(i, 1);
};

function removeFormalParameter(formalBlock) {
  Blockly.Events.setGroup(true);

  let identifier = formalBlock.getField('identifier').getText();
  let toBlock = formalBlock.getParent();
  let formalIndex = toBlock.inputList.findIndex(input => input.connection && input.connection.targetBlock() == formalBlock) - 1;

  if (formalIndex < 0) {
    throw 'erm....';
  }

  formalBlock.dispose();

  // Backfill vacated slot.
  for (let i = formalIndex + 1; i < toBlock.inputList.length - 2; ++i) {
    toBlock.inputList[i].connection.connect(toBlock.inputList[i + 1].connection.targetBlock().outputConnection);
  }

  function removeReferencesAndActuals(root) {
    if (root.type == 'call' && root.deltaphone.sourceBlockId == toBlock.id) {
      root.removeInput(`actual${formalIndex}`);
    }

    // Remove reference.
    if (root.type == 'variableGetter') {
      if (root.deltaphone.formalBlockId == formalBlock.id) {
        root.dispose();
      }
    }

    for (let child of root.getChildren()) {
      removeReferencesAndActuals(child);
    }
  }

  for (let root of workspace.getTopBlocks()) {
    removeReferencesAndActuals(root);
  }

  // let startPosition = toBlock.getRelativeToSurfaceXY();

  // Remove parameter from TO block and rename successors.
  mutateUndoably(toBlock, () => {
    toBlock.deltaphone.parameters.splice(formalIndex, 1);
  }, () => {
    shapeFunctionBlocks(toBlock);
  });

  // let stopPosition = toBlock.getRelativeToSurfaceXY();
  // toBlock.moveBy(startPosition.x - stopPosition.x, startPosition.y - stopPosition.y);

  Blockly.Events.setGroup(false);
}

function shapeTo(toBlock) {
  let meta = toBlock.deltaphone;

  // Add any missing parameter slots.
  let firstIndex = toBlock.inputList.length - 2;
  for (let i = firstIndex; i < meta.parameters.length; ++i) {
    let input = toBlock.appendValueInput(`formal${i}`);
    toBlock.moveNumberedInputBefore(toBlock.inputList.length - 1, toBlock.inputList.length - 2);
  }

  // Remove any unused parameter slots.
  while (toBlock.inputList.length - 2 > meta.parameters.length) {
    removeInputByIndex.call(toBlock, toBlock.inputList.length - 2);
  }

  toBlock.initSvg();
  toBlock.render();
}

// Reshape calls.
function shapeCalls2(toBlock, parameter) {
  let parameters = toBlock.deltaphone.parameters;
  let identifier = toBlock.deltaphone.identifier;

  function handleCall(callBlock) {
    callBlock.deltaphone.identifier = identifier;
    callBlock.deltaphone.sourceBlockId = toBlock.id;
    syncMode(callBlock);

    let oldActuals = [];
    for (let input of callBlock.inputList) {
      if (input.connection) {
        oldActuals.push(input.connection.targetBlock());
      } else {
        oldActuals.push(null);
      }
    }

    // Clear out all inputs.
    for (let i = callBlock.inputList.length - 1; i >= 0; --i) {
      callBlock.removeInput(callBlock.inputList[i].name);
    }

    if (parameters.length == 0) {
      let input = callBlock.appendDummyInput();
      input.appendField(identifier);
    } else {
      for (let [i, parameter] of parameters.entries()) {
        let input;
        if (parameter.mode == 'action') {
          input = callBlock.appendStatementInput(`actual${i}`);
        } else {
          input = callBlock.appendValueInput(`actual${i}`);
        }
          
        // Tack on the function name for first row.
        if (i == 0) {
          input.appendField(identifier);
        }

        // Only name parameters when there are multiple.
        if (parameters.length > 1) {
          input.appendField(parameter.identifier).setAlign(Blockly.ALIGN_RIGHT);
        }
      }
    }

    for (let [i, formalParameter] of toBlock.deltaphone.parameters.entries()) {
      if (i < oldActuals.length && oldActuals[i]) {
        let actualBlock = oldActuals[i];
        if (formalParameter.mode == 'value' && actualBlock.outputConnection) {
          callBlock.inputList[i].connection.connect(actualBlock.outputConnection);
        } else if (formalParameter.mode == 'action' && actualBlock.previousConnection) {
          callBlock.inputList[i].connection.connect(actualBlock.previousConnection);
        }
      }
    }
  }

  function traverse(root) {
    if (root.type == 'call' && root.deltaphone.sourceBlockId == toBlock.id) {
      handleCall(root);
    }

    for (let child of root.getChildren()) {
      traverse(child);
    }
  }

  for (let root of workspace.getTopBlocks()) {
    traverse(root);
  }
}

function shapeFunctionBlocks(toBlock) {
  shapeTo(toBlock);
  shapeCalls2(toBlock);
}

function addFormalParameter(toBlock, mode) {
  Blockly.Events.setGroup(true);

  let parameter = {
    identifier: 'newparam',
    mode: mode,
  };

  mutateUndoably(toBlock, () => {
    toBlock.deltaphone.parameters.push(parameter);
  }, () => {
    shapeFunctionBlocks(toBlock);
  });

  let formalBlock = workspace.newBlock('formalParameter');
  parameter.formalBlockId = formalBlock.id;
  formalBlock.getField('identifier').setText(parameter.identifier);
  formalBlock.deltaphone.mode = parameter.mode;

  syncModeArrow(formalBlock);
  formalBlock.initSvg();
  formalBlock.render();
  toBlock.inputList[toBlock.inputList.length - 2].connection.connect(formalBlock.outputConnection);
  formalBlock.select();
  formalBlock.getField('identifier').showEditor_();

  Blockly.Events.setGroup(false);
}

function rebuildCall(toBlock, callBlock) {
  let oldActuals = [];
  for (let input of callBlock.inputList) {
    if (input.connection) {
      oldActuals.push(input.connection.targetBlock());
    } else {
      oldActuals.push(null);
    }
  }

  // Clear out all inputs.
  for (let i = callBlock.inputList.length - 1; i >= 0; --i) {
    callBlock.removeInput(callBlock.inputList[i].name);
  }

  shapeCallFromTo(toBlock, callBlock);

  for (let [i, formalParameter] of toBlock.deltaphone.parameters.entries()) {
    if (i < oldActuals.length && oldActuals[i]) {
      let actualBlock = oldActuals[i];
      if (formalParameter.mode == 'value' && actualBlock.outputConnection) {
        callBlock.inputList[i].connection.connect(actualBlock.outputConnection);
      } else if (formalParameter.mode == 'action' && actualBlock.previousConnection) {
        callBlock.inputList[i].connection.connect(actualBlock.previousConnection);
      }
    }
  }
}

function rebuildCalls(root, toBlock) {
  if (root.type == 'call' && root.deltaphone.sourceBlockId == toBlock.id) {
    rebuildCall(toBlock, root);
  }

  for (let child of root.getChildren()) {
    rebuildCalls(child, toBlock);
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
            removeFormalParameter(block);
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
            Blockly.Events.setGroup(`${Blockly.utils.genUid()}-delete-set-plus-getters`);
            deleteSet(block);
            Blockly.Events.setGroup(false);
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
            addFormalParameter(block, 'value');
          }
        };
        options.push(option);

        option = {
          enabled: true,
          text: 'Add action parameter',
          callback: function() {
            addFormalParameter(block, 'action');
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
      let identifierNode = document.createElement('identifier');
      identifierNode.setAttribute('value', this.deltaphone.identifier);

      let parametersNode = document.createElement('parameters');

      for (let parameter of this.deltaphone.parameters) {
        let parameterNode = document.createElement('parameter');
        parameterNode.setAttribute('identifier', parameter.identifier);
        parameterNode.setAttribute('mode', parameter.mode);
        if (parameter.formalBlockId) {
          parameterNode.setAttribute('formalblockid', parameter.formalBlockId);
        }
        parametersNode.appendChild(parameterNode);
      }

      let container = document.createElement('mutation');
      container.appendChild(identifierNode);
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
            let formalBlockId = parameterNode.hasAttribute('formalblockid') ? parameterNode.getAttribute('formalblockid') : null;
            this.deltaphone.parameters.push({ identifier: identifier, mode: mode, formalBlockId: formalBlockId });
          }
        } else if (child.nodeName.toLowerCase() == 'identifier') {
          this.deltaphone.identifier = child.getAttribute('value');
        }
      }

      shapeFunctionBlocks(this);
    },
  });

  Blockly.Extensions.registerMutator('setMutator', {
    mutationToDom: function() {
      let identifierNode = document.createElement('identifier');
      identifierNode.setAttribute('value', this.deltaphone.identifier);

      let container = document.createElement('mutation');
      container.appendChild(identifierNode);

      return container;
    },
    // From XML to blocks.
    domToMutation: function(xml) {
      let oldIdentifier = this.deltaphone.identifier;
      for (let child of xml.children) {
        if (child.nodeName.toLowerCase() == 'identifier') {
          this.deltaphone.identifier = child.getAttribute('value');
        }
      }
      shapeGetters(this, oldIdentifier, this.deltaphone.identifier);
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

      // Only formal parameter references have formalBlockId set.
      if (this.deltaphone.hasOwnProperty('formalBlockId')) {
        container.setAttribute('formalblockid', this.deltaphone.formalBlockId);
      }

      return container;
    },
    domToMutation: function(xml) {
      this.deltaphone.mode = xml.getAttribute('mode');

      // Only formal parameter references have formalBlockId set.
      if (xml.hasAttribute('formalblockid')) {
        this.deltaphone.formalBlockId = xml.getAttribute('formalblockid');
      }

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

    option = {
      enabled: true,
      text: 'Undo Test',
      callback: function() {
        let formalBlock = workspace.newBlock('formalParameter');
        formalBlock.initSvg();
        formalBlock.render();
      },
    };
    options.push(option);

    option = {
      enabled: true,
      text: 'Blarg',
      callback: function() {
        Blockly.Blocks['formal'] = {
          init: function() {
            this.jsonInit({
              isMovable: false,
              output: null,
              inputsInline: true,
              message0: '%1',
              args0: [
                { type: 'field_input', name: 'identifier', text: '' },
              ]
            });
          }
        };

        let formal = workspace.newBlock('formal');
        formal.initSvg();
        formal.render();
      },
    };
    options.push(option);

    option = {
      enabled: true,
      text: 'Show Undo',
      callback: () => {
        console.log("workspace.undoStack_:", workspace.undoStack_);
      },
    };
    options.push(option);
  };

  document.getElementById('playButton').addEventListener('click', () => {
    // https://github.com/CoderLine/alphaTab/issues/188
    $('#score').alphaTab('playPause');
  });

  document.getElementById('runButton').addEventListener('click', () => {
    hasManualInterpretation = true;
    interpret();
  });

  document.getElementById('exportButton').addEventListener('click', () => {
    exportMusicXML();
  });

  if (source0) {
    let xml = Blockly.Xml.textToDom(source0);
    console.log(xml);
    Blockly.Xml.domToWorkspace(xml, workspace);
    $('#left').css({
      'min-width': '300px',
      'width': '300px'
    });
    Blockly.svgResize(workspace);
    workspace.zoomToFit();
  } else {
    let last = localStorage.getItem('last');
    if (last) {
      last = Blockly.Xml.textToDom(last);
      console.log("last:", last);

      // Don't commit reload into undo history.
      Blockly.Events.recordUndo = false;
      Blockly.Xml.domToWorkspace(last, workspace);
      Blockly.Events.recordUndo = true;

      workspace.zoomToFit();
    }
  }

  $('#blocklyEditor clipPath[id^="blocklyZoomresetClipPath"] + image').each(function() {

    // The reset control DOM has this structure:
    //   svg
    //     clipPath id=blocklyZoomresetClipPath...
    //       rect
    //     image
    // The image has the mousedown event.

    Blockly.bindEventWithChecks_(this, 'mousedown', null, function(e) {
      workspace.markFocused();
      workspace.beginCanvasTransition();
      workspace.zoomToFit();
      setTimeout(function() {
        workspace.endCanvasTransition();
      }, 500);
      Blockly.Touch.clearTouchIdentifier();  // Don't block future drags.
      e.stopPropagation();  // Don't start a workspace scroll.
      e.preventDefault();  // Stop double-clicking from selecting text.
    });
  });

  $('#score').alphaTab({
    width: -1,
    staves: 'score',
    transpositionPitches: [12],
    layout: {
      mode: 'page',
      additionalSettings: {
        hideTuning: true,
        hideTrackNames: true
      }
    }
  });

  var progressChild = $('#progress-child');
  var progressRoot = $('#progress-root');

  $('#score').on('alphaTab.soundFontLoad', (event, progress) => {
    var percentage = Math.round(100.0 * (progress.loaded / progress.total));
    progressChild.css('width', percentage + '%');
  });

  $('#score').on('alphaTab.soundFontLoaded', (event, progress) => {
    progressRoot.css('display', 'none');
    $('#controls').css('display', 'block');
  });

  workspace.addChangeListener(event => {
    // We handle a selection of a formal parameter by generating an parameter
    // reference that can be used in the body. The event we care about has some
    // compound logic to it. It must be a UI selected element event. The
    // selection is being made if its newValue property is set, which is the ID
    // of the formal parameter block. But formal parameters are selected right
    // after they are added, so we further require that a gesture be in
    // progress. No gesture is in progress when a parameter is freshly added.
    if (event.type == Blockly.Events.UI) {
      if (event.hasOwnProperty('element') && event.element == 'selected') {
        if (event.newValue && workspace.currentGesture_ && workspace.currentGesture_.startField_ == null) {
          let identifierBlock = workspace.getBlockById(event.newValue); 

          if (identifierBlock.type == 'formalParameter' || identifierBlock.type == 'setIdentifier') {
            generateFormalReference(identifierBlock);
          }
        }
      }
    }

    // The remaining events we only want to listen for when they are actively
    // happening. When they are being played back by undo/redo, the mutators
    // will ensure consistency.
    if (!event.recordUndo) {
      return;
    }

    console.log("event:", event);

    // Variable, formal parameter, and function blocks all have text fields in
    // which the the programmer can enter identifiers. We need to propagate the
    // name changes we see to the related call and variable reference blocks.
    if (event.type == Blockly.Events.CHANGE && event.element == 'field') {
      let block = workspace.getBlockById(event.blockId); 
      
      // Blockly generates some events in an invalid order, in my opinion, so
      // the identified block might not exist yet.
      if (block) {

        // If the event that triggered this is not part of a group, we want to
        // make it and any events that get triggered by it as part of a group.
        let isUngrouped = !event.group;
        if (isUngrouped) {
          Blockly.Events.setGroup(true);
          event.group = Blockly.Events.getGroup();
        }

        if (block.type == 'formalParameter') {
          renameFormal(block, event.oldValue, event.newValue);
        } else if (block.type == 'to') {
          renameTo(block, event.oldValue, event.newValue);
        } else if (block.type == 'setIdentifier') {
          renameVariable(block, event.oldValue, event.newValue);
        }

        if (isUngrouped) {
          Blockly.Events.setGroup(false);
        }
      }
    } else if (event.type == Blockly.Events.BLOCK_CREATE) {
      rescopeSetters(workspace.getBlockById(event.blockId));
    } else if (event.type == Blockly.Events.BLOCK_DELETE) {
      let type = event.oldXml.getAttribute('type');
      let id = event.oldXml.getAttribute('id');

      // If we delete a to, we also want to delete all of its calls. But the
      // calls need to get deleted first, because a call's to must always
      // exist. So, we undo the delete of the to and then redelete it in the
      // proper order. We tag the event group with a special suffix to avoid
      // infinite event recursion on the real delete.
      if (type == 'to' && !event.group.endsWith('-delete-to-plus-calls')) {
        workspace.undo();

        Blockly.Events.setGroup(`${Blockly.utils.genUid()}-delete-to-plus-calls`);
        let toBlock = workspace.getBlockById(id);
        deleteTo(toBlock);
        Blockly.Events.setGroup(false);
      }

      // If we delete a set...
      else if (type == 'set' && !event.group.endsWith('-delete-set-plus-getters')) {
        workspace.undo();
        console.log("new set group");

        Blockly.Events.setGroup(`${Blockly.utils.genUid()}-delete-set-plus-getters`);
        let setBlock = workspace.getBlockById(id);

        // dispose of child
        let child = setBlock.getNextBlock();
        if (child) {
          child.dispose();
        }

        deleteSet(setBlock);
        Blockly.Events.setGroup(false);
      }
    }
    
    if (hasManualInterpretation &&
        (event.type == Blockly.Events.BLOCK_CHANGE ||
         event.type == Blockly.Events.BLOCK_DELETE ||
         event.type == Blockly.Events.BLOCK_CREATE ||
         event.type == Blockly.Events.BLOCK_MOVE)) {
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

  // Blockly.Blocks['formal'] = {
    // init: function() {
      // this.jsonInit({
        // isMovable: false,
        // output: null,
        // inputsInline: true,
        // message0: '%1',
        // args0: [
          // { type: 'field_input', name: 'identifier', text: '' },
        // ]
      // });
    // }
  // };

  // let formal = workspace.newBlock('formal');
  // formal.initSvg();
  // formal.render();
}

function generateFormalReference(identifierBlock, formalBlockId) {
  Blockly.Events.setGroup(true);

  Blockly.selected.unselect(); // WHY?

  let identifier = identifierBlock.getField('identifier').getText();
  let getterBlock = workspace.newBlock('variableGetter');

  getterBlock.deltaphone.mode = identifierBlock.deltaphone.mode;
  getterBlock.deltaphone.identifier = identifier;
  syncMode(getterBlock);

  getterBlock.getField('identifier').setText(identifier);
  Blockly.Events.fire(new Blockly.Events.BlockChange(getterBlock, 'field', 'identifier', null, identifier));

  if (identifierBlock.type == 'formalParameter') {
    getterBlock.deltaphone.formalBlockId = identifierBlock.id;
  }

  let referenceLocation = getterBlock.getRelativeToSurfaceXY();
  let mouse = workspace.currentGesture_.mouseDownXY_;

  let point = Blockly.utils.mouseToSvg({clientX: mouse.x, clientY: mouse.y}, workspace.getParentSvg(), workspace.getInverseScreenCTM());
  let rel = workspace.getOriginOffsetInPixels();
  let mouseX = (point.x - rel.x) / workspace.scale;
  let mouseY = (point.y - rel.y) / workspace.scale;

  getterBlock.initSvg();
  getterBlock.render();
  getterBlock.bringToFront();

  getterBlock.moveBy(mouseX - referenceLocation.x - getterBlock.width / 2, mouseY - referenceLocation.y - getterBlock.height / 2);

  workspace.currentGesture_.setStartBlock(getterBlock);
  workspace.currentGesture_.setTargetBlock_(getterBlock);
  getterBlock.select();

  // Is there a way to stop the group after the mouse is released?
  // The issue is that the block might instead be thrown away. But
  // then undo essentially does nothing. We go from deleted block
  // to uncreated block.
  Blockly.Events.setGroup(false);
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
  if (block.type == 'to') {
    // Reattach calls.
    let identifier = block.getField('identifier').getText();
    for (let child of block.getChildren()) {
      reattachReferences(child, identifier, block);
    }

    // Reattach formals.
    for (let formal of block.deltaphone.parameters) {
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
  for (let child of root.getChildren()) {
    reattachReferences(child, identifier, sourceBlock);
  }
}

function renameTo(toBlock, oldIdentifier, newIdentifier) {
  mutateUndoably(toBlock, () => {
    toBlock.deltaphone.identifier = newIdentifier;
  }, () => {
    shapeFunctionBlocks(toBlock);
  });
}

function renameVariable(setBlock, oldIdentifier, newIdentifier) {
  mutateUndoably(setBlock, () => {
    setBlock.deltaphone.identifier = newIdentifier;
  }, () => {
    shapeGetters(setBlock, oldIdentifier, newIdentifier);
  });
}

function shapeGetters(setBlock, oldIdentifier, newIdentifier) {
  // There are two scopes: in-function and out-function. Each function has its
  // own scope, and functions are neatly organized. Non-function code is more
  // scattered. Variables only get renamed within their function's scope or in
  // the common out-function scope.

  function renameVariableGetters(root) {
    if (root.type == 'variableGetter' && root.getField('identifier').getText() == oldIdentifier) {
      root.getField('identifier').setText(newIdentifier);
      root.deltaphone.identifier = newIdentifier;
    } else if (root.type == 'setIdentifier' && root.getField('identifier').getText() == oldIdentifier) {
      root.deltaphone.identifier = newIdentifier;
      root.getField('identifier').setText(newIdentifier);
    }

    for (let child of root.getChildren()) {
      renameVariableGetters(child, oldIdentifier, newIdentifier);
    }
  }

  Blockly.Events.disable();
  let topBlock = setBlock.getRootBlock();
  if (topBlock.type == 'to') {
    renameVariableGetters(topBlock);
  } else {
    for (let root of workspace.getTopBlocks()) {
      if (root.type != 'to') {
        renameVariableGetters(root);
      }
    }
  }
  Blockly.Events.enable();
}

function renameFormal(formalBlock, oldIdentifier, newIdentifier) {
  // Which input is it?
  let toBlock = formalBlock.getParent();

  mutateUndoably(toBlock, () => {
    let formalIndex = toBlock.inputList.findIndex(input => input.connection && input.connection.targetBlock() == formalBlock) - 1;
    toBlock.deltaphone.parameters[formalIndex].identifier = newIdentifier;
  }, () => {
    shapeFunctionBlocks(toBlock);
  });

  // TODO: should this be part of shapeFunctionBlocks?
  // Rename all variableGetter children.
  function renameFormalVariableGetters(root) {
    if (root.type == 'variableGetter' && root.deltaphone.hasOwnProperty('formalBlockId') && root.deltaphone.formalBlockId == formalBlock.id) {
      root.getField('identifier').setText(newIdentifier);
      root.deltaphone.identifier = newIdentifier;
    }

    for (let child of root.getChildren()) {
      renameFormalVariableGetters(child);
    }
  }

  Blockly.Events.disable();
  for (let root of workspace.getTopBlocks()) {
    renameFormalVariableGetters(root);
  }
  Blockly.Events.enable();
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

async function interpret() {
  $('#score').alphaTab('pause');
  $('#hud-bottom').empty();

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
      if (!root.disabled && root.type != 'to') {
        while (root) {
          if (root.outputConnection) {
            throw new ParseException(root, 'I found this stray value block and I wasn\'t sure what to do with it.');
          } else {
            if (!root.disabled) {
              statements.push(root.tree());
            }
            root = root.getNextBlock();
          }
        }
      }
    }

    let program = new StatementProgram(new StatementBlock(statements));

    let env = {
      root: 0,
      scaleRoot: 0,
      rotation: 0,
      scale: 0,
      iMeasure: 2,
      beats: 0,
      sequences: [],
      halfstep: 48,
      beatsPerMeasure: 4,
      beatNote: 4,
      bpm: 80,
      functions: {},
      variables: {},
      marks: [],
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

    setKeySignature(env, 0, 0, 0);
    await program.evaluate(env);
    generateScore(env);
    $('#score').show();

  } catch (e) {
    lastWarnedBlock = e.block;
    if (e.hasOwnProperty('block')) {
      // e.block.select(); // If I do this, it interferes with formal parameter reference selection.
      e.block.setWarningText(wrap(e.message, 15));
    } else {
      throw e;
    }
  }
}

function generateScore(env) {
  if (env.sequences[0].items.length > 0) {
    $('#score').alphaTab('playbackSpeed', env.bpm / 120);
    let xml = env.sequences[0].toXML(env);
    document.getElementById('scratch').value = xml;
    render();
  } else {
    $('#score').hide();
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

function exportMusicXML() {
  let xml = document.getElementById('scratch').value;

  let tag = document.createElement('a');
  tag.style.display = 'none';
  document.body.appendChild(tag);

  tag.href = URL.createObjectURL(new Blob([xml], {type: 'application/vnd.recordare.musicxml+xml'}));
  tag.setAttribute('download', 'deltaphone.xml');
  tag.click();
  setTimeout(() => {
    URL.revokeObjectURL(tag.href);
    document.body.removeChild(tag);
  });
}

window.addEventListener('load', setup);
