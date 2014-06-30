var harmonicRatios = new Array((1 / 1), (12 / 11), (9 / 8), (6 / 5), (5 / 4), (4 / 3), (7 / 5), (3 / 2), (8 / 5), (5 / 3), (7 / 4), (11 / 6), (2 / 1));
var noteNames = new Array('E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B', 'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B', 'C', 'C#/Db', 'D', 'D#/Eb');

function Note(guitar, string, fret) {
    this.string = string;
    this.fret = fret;
    this.guitar = guitar;
}
Note.prototype.getFrequency = function() {
	//? this.guitar.Notes[12].getFrequency() 
    var frequency = (this.fret.position > 12) 
					? this.guitar.findNote(this.string, this.guitar.Frets[12]).getFrequency() 
    				: this.string.openNoteFrequency;
    var ratioPositionOffset = (this.fret.position > 12) 
							    ? this.fret.position - 11
	    						: this.fret.position; 
    return frequency * harmonicRatios[ratioPositionOffset];
};
Note.prototype.getNoteName = function() {
    var fretOffset = (this.fret.position > 12) ? this.fret.position - 11 : this.fret.position;
    var stringOffset = noteNames.indexOf(this.string.name);
    return noteNames[fretOffset + stringOffset];
};

Note.prototype.getNoteOctave = function() {
    
    var offset = 0;
    switch(this.guitar.tuning) 
    {
        case 'Standard':
            offset = getStandardTuningStringOffsetValue(this.string.number);
            break;        
        //TODO: Add other tuning octave offset calcs
        default:
            return '';
    }

    if (this.fret.position < offset) { return this.string.openNoteOctave; }
    if (this.fret.position >= (offset + 11)) { return this.string.openNoteOctave + 2; }
    return this.string.openNoteOctave + 1;

    function getStandardTuningStringOffsetValue(stringNumber) {
        switch(stringNumber) 
        {
            case 6 : return 8;
            case 5 : return 3;
            case 4 : return 10;
            case 3 : return 5;
            case 2 : return 1;
            case 1 : return 8;
            default: return 0;
        }
    }
};

function String(name, number, openNoteFrequency, openNoteOctave) {
    this.name = name;
    this.number = number;
    this.openNoteFrequency = openNoteFrequency;
    this.openNoteOctave = openNoteOctave;
}

function Fret(position) {
    this.position = position;
}

function Guitar(numberOfFrets, tuning) {
    this.Strings = new Array();
    this.Frets = new Array();
    this.Notes = new Array();
    this.tuning = tuning;
    
    switch (tuning) {
        case 'Standard':
            standardTuningInit(this);
            break;
        case 'DropD':
            dropDTuningInit(this);
            break;
        default:
            throw 'Invalid Tuning: Try "Standard or DropD"';
    }

    function dropDTuningInit(guitar) {
        dropDStringInit(guitar);
        standardFretInit(guitar);
        standardNoteInit(guitar);
    }

    function dropDStringInit(guitar) {
        guitar.Strings.push(new String('D', 6, 146.8, 3));
        guitar.Strings.push(new String('A', 5, 110, 2));
        guitar.Strings.push(new String('D', 4, 146.8, 3));
        guitar.Strings.push(new String('G', 3, 196, 3));
        guitar.Strings.push(new String('B', 2, 246.9, 3));
        guitar.Strings.push(new String('E', 1, 329.6, 4));
    }

    function standardTuningInit(guitar) {
        standardStringInit(guitar);
        standardFretInit(guitar);
        standardNoteInit(guitar);
    }

    function standardStringInit(guitar) {
        guitar.Strings.push(new String('E', 6, 82.4, 2));
        guitar.Strings.push(new String('A', 5, 110, 2));
        guitar.Strings.push(new String('D', 4, 146.8, 3));
        guitar.Strings.push(new String('G', 3, 196, 3));
        guitar.Strings.push(new String('B', 2, 246.9, 3));
        guitar.Strings.push(new String('E', 1, 329.6, 4));
    }

    function standardFretInit(guitar) {
        if (numberOfFrets < 0) {numberOfFrets = 21;}
        if (numberOfFrets > 24) {numberOfFrets = 24;}
        for (var f = 0; f < numberOfFrets; f++) {
            guitar.Frets.push(new Fret(f));
        }
    }

    function standardNoteInit(guitar) {
        for (var s = 0; s < guitar.Strings.length; s++) {
            for (var f = 0; f < guitar.Frets.length; f++) {
                guitar.Notes.push(new Note(guitar, guitar.Strings[s], guitar.Frets[f]));
            }	
        }
    }
}
Guitar.prototype.dumpToConsole = function() {
    for (var count = 0; count < this.Notes.length; count++) {
        console.log(guitar.Notes[count].getNoteName() + ', ' + guitar.Notes[count].getFrequency() + 'Hz, Fret: ' + guitar.Notes[count].fret.position + ', String: ' + guitar.Notes[count].string.name);
    }
};
Guitar.prototype.findNote = function(string, fret) {
    for (var n = 0; n < this.Notes.length; n++) {
    	if (this.Notes[n].string == string && this.Notes[n].fret == fret) {
    		return this.Notes[n];
    	}
    }
    throw 'Note not found!';
};