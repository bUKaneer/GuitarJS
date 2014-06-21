function Luthier(guitar) {
    this.guitar = guitar;
}
Luthier.prototype.createHtmlTableGuitar = function(element) {
    var head = document.createElement('thead');
    var body = document.createElement('tbody');
    for (var f = 0; f < this.guitar.Frets.length; f++) {
        var row = document.createElement('tr');
        for (var s = 0; s < this.guitar.Strings.length; s++) {
            var cell = (f == 0) ? document.createElement('th') : document.createElement('td');
            var note = guitar.findNote(this.guitar.Strings[s], this.guitar.Frets[f]);
            var cellContent = document.createTextNode(note.getNoteName());
            cell.appendChild(cellContent);
            cell.dataset.noteName = note.getNoteName();
            cell.dataset.frequency = note.getFrequency();
            cell.dataset.string = this.guitar.Strings[s].number;
            row.dataset.fretPosition = f;
            row.appendChild(cell);
        }
        if (f == 0) {
            head.appendChild(row);
        } else {
            body.appendChild(row);
        }
    }
    var table = document.createElement('table');
    table.appendChild(head);
    table.appendChild(body);
    element.appendChild(table);
};
Luthier.prototype.applyWebAudioApi = function(element, highlightNotes) {
    //Credit to: Middle Ear Media for a great article on oscillators
    //http://middleearmedia.com/controlling-web-audio-api-oscillators/
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new window.AudioContext();
    var oscillator, gain;
    var noteElements = element.querySelectorAll('td[data-note-name], th[data-note-name]');
    for (var n = 0; n < noteElements.length; n++) {
        noteElements[n].addEventListener('mousedown', start);
        noteElements[n].addEventListener('mouseup', stop);
    }

    function start(event) {
        oscillator = context.createOscillator();
        oscillator.type = 0;
        var target = event.target || event.srcElement;
        oscillator.frequency.value = target.dataset.frequency;
        if (oscillator.noteOn) {
            oscillator.noteOn(0);
            gain = context.createGainNode();
        } else {
            oscillator.start();
            gain = context.createGain();
        }
        gain.gain.value = 1;
        oscillator.connect(gain);
        gain.connect(context.destination);
        if (highlightNotes) {
            var sameNotes = document.querySelectorAll('td[data-note-name="' + target.dataset.noteName + '"], th[data-note-name="' + target.dataset.noteName + '"]');
            for (var n = 0; n < sameNotes.length; n++) {
                sameNotes[n].classList.add('highlight');
            }
        }
    }

    function stop(event) {
        if (oscillator.noteOff) {
            oscillator.noteOff(0);
        } else {
            oscillator.stop();
        }
        oscillator.disconnect();
        if (highlightNotes) {
            var target = event.target || event.srcElement;
            var sameNotes = document.querySelectorAll('td[data-note-name="' + target.dataset.noteName + '"], th[data-note-name="' + target.dataset.noteName + '"]');
            for (var n = 0; n < sameNotes.length; n++) {
                sameNotes[n].classList.remove('highlight');
            }
        }
    }
};
Luthier.prototype.paintFrequencyMap = function(element) {
 	var notes = element.querySelectorAll('td[data-note-name], th[data-note-name]');		
 	
	for (var n = 0; n < notes.length; n++) {
		var frequency = notes[n].dataset.frequency;
		notes[n].style.backgroundColor = 'rgba('+Math.round(frequency / 255)*80+','+Math.round(frequency / 255)*80+','+Math.round(frequency / 20)*80+',0.5)';
	}
};