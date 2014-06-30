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
Luthier.prototype.addHtmlTableWebAudioApiNotePlay = function(element, highlightNotes) {
    //Credit to: Middle Ear Media & softsynth.com for a great articles on oscillators
    //http://www.softsynth.com/webaudio/tone.php
    //http://middleearmedia.com/controlling-web-audio-api-oscillators/
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var context = new window.AudioContext();
    var oscillator, amp;
    if (context) {
        oscillator = context.createOscillator();
        amp = context.createGainNode();
        amp.gain.value = 0;
        oscillator.connect(amp);
        amp.connect(context.destination);
        oscillator.start(0);
    }
    var noteElements = element.querySelectorAll('td[data-note-name], th[data-note-name]');
    for (var n = 0; n < noteElements.length; n++) {
        noteElements[n].addEventListener('mousedown', start);
        noteElements[n].addEventListener('mouseup', stop);
    }

    function start(event) {
        var now = context.currentTime;
        oscillator.frequency.setValueAtTime(event.target.dataset.frequency, now);
        amp.gain.cancelScheduledValues(now);
        amp.gain.setValueAtTime(amp.gain.value, now);
        amp.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.1);
        if (highlightNotes) {
            var sameNotes = document.querySelectorAll('td[data-note-name="' + event.target.dataset.noteName + '"], th[data-note-name="' + event.target.dataset.noteName + '"]');
            for (var n = 0; n < sameNotes.length; n++) {
                sameNotes[n].classList.add('highlight');
            }
        }
    }

    function stop(event) {
        var now = context.currentTime;
        amp.gain.cancelScheduledValues(now);
        amp.gain.setValueAtTime(amp.gain.value, now);
        amp.gain.linearRampToValueAtTime(0.0, context.currentTime + 1.0);
        if (highlightNotes) {
            var sameNotes = document.querySelectorAll('td[data-note-name="' + event.target.dataset.noteName + '"], th[data-note-name="' + event.target.dataset.noteName + '"]');
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
        notes[n].style.backgroundColor = 'rgba(' + Math.round(frequency / 255) * 80 + ',' + Math.round(frequency / 255) * 80 + ',' + Math.round(frequency / 20) * 80 + ',0.5)';
    }
};
Luthier.prototype.highlightChord = function(guitarElement, pattern) {
    var patArray = pattern.split(' ');
    var previousNotes = guitarElement.querySelectorAll('.luthier-selectedChord');
    for (var pn = 0; pn < previousNotes.length; pn++) {
        previousNotes[pn].classList.remove('luthier-selectedChord');
    }
    for (var p = 0; p < patArray.length; p++) {
        if (patArray[p] != 'x') {
            var string = 6 - p;
            var fret = guitarElement.querySelectorAll('[data-fret-position="' + patArray[p] + '"]');
            var cell = fret[0].querySelectorAll('[data-string="' + string + '"]');
            cell[0].classList.add('luthier-selectedChord');
        }
    }
};
Luthier.prototype.createColourisationOptions = function(guitarElement, panelElement) {
    var notes = new Array('C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B');
    for (var n = 0; n < notes.length; n++) {
        var checkbox = document.createElement('input');
        checkbox.checked = true;
        checkbox.id = notes[n].replace('#', 'sharp');
        checkbox.type = 'checkbox';
        checkbox.dataset.noteName = notes[n];
        checkbox.GuitarElement = guitarElement;
        var label = document.createElement('label');
        label.htmlFor = notes[n].replace('#', 'sharp');
        label.appendChild(document.createTextNode(notes[n]));
        panelElement.appendChild(checkbox);
        panelElement.appendChild(label);
        checkbox.addEventListener('click', colourise);
    }

    function colourise(event) {
        var notes = event.target.GuitarElement.querySelectorAll('[data-note-name="' + event.target.dataset.noteName + '"]');
        if (!event.target.checked) {
            for (var n = 0; n < notes.length; n++) {
                notes[n].style.backgroundColor = 'transparent';
            }
        } else {
            for (var n = 0; n < notes.length; n++) {
                notes[n].style.backgroundColor = '';
            }
        }
    }
};
Luthier.prototype.createChordTable = function(guitarElement, panelElement) {
    /* Requires  guitar.chords.json.js */
    if (chords) {
        var table = document.createElement('table');
        table.appendChild(createHeader(table));
        table.appendChild(createBody(this));
        panelElement.appendChild(table);
    }

    function createFilter(table) {
        var row = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 3;
        var filter = document.createElement('input');
        filter.style.width = '100%';
        filter.placeholder = 'Type "CMaj " for all the C Majors or "Barre" for all barre chords...';
        filter.table = table;
        filter.addEventListener('keyup', filterList);
        td.appendChild(filter);
        row.appendChild(td);
        return row;
    }

    function filterList(event) {
        var rows = event.target.table.querySelectorAll('tr');
        var isBarreSearch = (event.target.value.toLowerCase().indexOf('barre') >= 0);
        for (var r = 2; r < rows.length; r++) {
            if (isBarreSearch) {
                rows[r].style.display = rows[r].dataset.isBarreChord == 'true' ? 'table-row' : 'none';
            } else {
                var text = rows[r].textContent.toLowerCase(),
                    val = event.target.value.toLowerCase();
                rows[r].style.display = text.indexOf(val) === -1 ? 'none' : 'table-row';
            }
        }
    }

    function createBody(luthier) {
        var tbody = document.createElement('tbody');
        for (var c = 0; c < chords.length; c++) {
            var row = document.createElement('tr');
            row.appendChild(createElementWithTextContent('td', chords[c].Name));
            var pre = document.createElement('pre');
            pre.appendChild(createElementWithTextContent('code', chords[c].Pattern));
            var td = document.createElement('td');
            td.appendChild(pre);
            row.appendChild(td);
            row.appendChild(createElementWithTextContent('td', chords[c].Notes));
            row.title = chords[c].Type;
            var xIndex = chords[c].Pattern.indexOf('x');
            var zeroIndex = chords[c].Pattern.indexOf('0');
            row.dataset.isBarreChord = ((xIndex < 0) && (zeroIndex < 0));
            row.dataset.pattern = chords[c].Pattern;
            row.Luthier = luthier;
            row.GuitarElement = guitarElement;
            row.addEventListener('mouseover', showChord);
            tbody.appendChild(row);
        }
        return tbody;
    }

    function showChord(event) {
        event.target.parentElement.Luthier.highlightChord(event.target.parentElement.GuitarElement, event.target.parentElement.dataset.pattern);
    }

    function createHeader(table) {
        var row = document.createElement('tr');
        row.appendChild(createElementWithTextContent('th', 'Name'));
        row.appendChild(createElementWithTextContent('th', 'Pattern'));
        row.appendChild(createElementWithTextContent('th', 'Notes'));
        var thead = document.createElement('thead');
        thead.appendChild(row);
        thead.appendChild(createFilter(table))
        return thead;
    }

    function createElementWithTextContent(elementType, content) {
        var element = document.createElement(elementType);
        var content = document.createTextNode(content);
        element.appendChild(content);
        return element;
    }
};
Luthier.prototype.createChordDropDown = function(guitarElement, panelElement) {
    /* Requires  guitar.chords.json.js */
    if (chords) {
        var selectElement = document.createElement('select')
        selectElement.id = 'chordSelect';
        for (var c = 0; c < chords.length; c++) {
            var option = document.createElement('option');
            option.text = chords[c].Name + '(' + chords[c].Pattern + ')';
            option.value = chords[c].Pattern;
            selectElement.appendChild(option);
        }
        panelElement.appendChild(selectElement);
        selectElement.addEventListener('change', showChord)
        selectElement.Luthier = this;
        selectElement.GuitarElement = guitarElement;
    }

    function showChord(event) {
        event.target.Luthier.highlightChord(event.target.GuitarElement, event.target.value);
    }
};