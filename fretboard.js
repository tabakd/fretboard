
class GuitarFretboard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['title', 'num-frets', 'start-fret', 'tuning', 'show-nut'];
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const title = this.getAttribute('title') || '';
        const numFrets = parseInt(this.getAttribute('num-frets')) || 5;
        const startFret = parseInt(this.getAttribute('start-fret')) || 1;
        const tuning = this.getAttribute('tuning')?.split(',') || ['E', 'A', 'D', 'G', 'B', 'E'];
        const showNut = this.getAttribute('show-nut') === 'true';

        const strings = tuning.length;
        const fretWidth = 80;
        const fretHeight = 30;
        const stringSpacing = 25;
        const nutWidth = 6;
        const margin = 40;

        // Parse child elements
        const notes = Array.from(this.querySelectorAll('fret-note')).map(note => ({
            string: parseInt(note.getAttribute('string')),
            fret: parseInt(note.getAttribute('fret')),
            finger: note.getAttribute('finger'),
            label: note.getAttribute('label')
        }));

        const barres = Array.from(this.querySelectorAll('fret-barre')).map(barre => ({
            fret: parseInt(barre.getAttribute('fret')),
            from: parseInt(barre.getAttribute('from')),
            to: parseInt(barre.getAttribute('to')),
            finger: barre.getAttribute('finger')
        }));

        const totalWidth = (numFrets * fretWidth) + (showNut && startFret === 1 ? nutWidth : 0) + margin * 2;
        const totalHeight = ((strings - 1) * stringSpacing) + margin * 2;

        const getNotePosition = (string, fret) => {
            const stringY = margin + (string - 1) * stringSpacing;
            let fretX;

            if (fret === 0) {
                fretX = margin + (showNut && startFret === 1 ? nutWidth : 0) - 25;
            } else if (fret === -1) {
                fretX = margin + (showNut && startFret === 1 ? nutWidth : 0) - 25;
            } else {
                const fretIndex = fret - startFret;
                fretX = margin + (showNut && startFret === 1 ? nutWidth : 0) + (fretIndex * fretWidth) + (fretWidth / 2);
            }

            return { x: fretX, y: stringY };
        };

        let fretLines = '';
        for (let i = 0; i <= numFrets; i++) {
            const x = margin + (showNut && startFret === 1 ? nutWidth : 0) + (i * fretWidth);
            const isNut = showNut && startFret === 1 && i === 0;
            fretLines += `
                        <line x1="${x}" y1="${margin}" x2="${x}" y2="${totalHeight - margin}" 
                              stroke="${isNut ? '#2d3748' : '#cbd5e0'}" 
                              stroke-width="${isNut ? nutWidth : 2}" />
                    `;
        }

        let stringLines = '';
        for (let i = 0; i < strings; i++) {
            const stringNumber = strings - i;
            const y = margin + (stringNumber - 1) * stringSpacing;
            const strokeWidth = stringNumber === 1 || stringNumber === 2 ? 1 : 2;
            stringLines += `
                        <line x1="${margin}" y1="${y}" x2="${totalWidth - margin}" y2="${y}" 
                              stroke="#4a5568" stroke-width="${strokeWidth}" />
                    `;
        }

        let fretNumbers = '';
        for (let i = 0; i < numFrets; i++) {
            const fretNum = startFret + i;
            const x = margin + (showNut && startFret === 1 ? nutWidth : 0) + (i * fretWidth) + (fretWidth / 2);
            const y = totalHeight - margin + 25;
            fretNumbers += `
                        <text x="${x}" y="${y}" text-anchor="middle" font-size="14" 
                              fill="#4a5568" font-weight="bold">${fretNum}</text>
                    `;
        }

        let stringNames = '';
        tuning.forEach((note, i) => {
            const stringNumber = strings - i;
            const y = margin + (stringNumber - 1) * stringSpacing + 5;
            stringNames += `
                        <text x="${margin - 20}" y="${y}" text-anchor="middle" font-size="14" 
                              fill="#4a5568" font-weight="bold">${note}</text>
                    `;
        });

        let barreElements = '';
        barres.forEach(barre => {
            const fretIndex = barre.fret - startFret;
            if (fretIndex < 0 || fretIndex >= numFrets) return;

            const x = margin + (showNut && startFret === 1 ? nutWidth : 0) + (fretIndex * fretWidth) + (fretWidth / 2);
            const fromY = margin + (barre.from - 1) * stringSpacing;
            const toY = margin + (barre.to - 1) * stringSpacing;

            barreElements += `
                        <line x1="${x}" y1="${fromY}" x2="${x}" y2="${toY}" 
                              stroke="#2d3748" stroke-width="8" stroke-linecap="round" />
                    `;

            if (barre.finger) {
                barreElements += `
                            <text x="${x}" y="${(fromY + toY) / 2 + 5}" text-anchor="middle" 
                                  font-size="12" fill="white" font-weight="bold">${barre.finger}</text>
                        `;
            }
        });

        let noteElements = '';
        notes.forEach(note => {
            const pos = getNotePosition(note.string, note.fret);

            if (note.fret === -1) {
                // Muted string
                noteElements += `
                            <line x1="${pos.x - 8}" y1="${pos.y - 8}" x2="${pos.x + 8}" y2="${pos.y + 8}" 
                                  stroke="#e53e3e" stroke-width="3" stroke-linecap="round" />
                            <line x1="${pos.x - 8}" y1="${pos.y + 8}" x2="${pos.x + 8}" y2="${pos.y - 8}" 
                                  stroke="#e53e3e" stroke-width="3" stroke-linecap="round" />
                        `;
            } else if (note.fret === 0) {
                // Open string
                noteElements += `
                            <circle cx="${pos.x}" cy="${pos.y}" r="10" fill="white" 
                                    stroke="#2d3748" stroke-width="2" />
                        `;
                if (note.label) {
                    noteElements += `
                                <text x="${pos.x}" y="${pos.y + 3}" text-anchor="middle" 
                                      font-size="9" fill="#2d3748" font-weight="bold">${note.label}</text>
                            `;
                }
            } else {
                // Fretted note
                const fretIndex = note.fret - startFret;
                if (fretIndex >= 0 && fretIndex < numFrets) {
                    noteElements += `
                                <circle cx="${pos.x}" cy="${pos.y}" r="10" fill="#2d3748" 
                                        stroke="#2d3748" stroke-width="2" />
                            `;
                    if (note.finger) {
                        noteElements += `
                                    <text x="${pos.x}" y="${pos.y + 3}" text-anchor="middle" 
                                          font-size="11" fill="white" font-weight="bold">${note.finger}</text>
                                `;
                    } else if (note.label) {
                        noteElements += `
                                    <text x="${pos.x}" y="${pos.y + 3}" text-anchor="middle" 
                                          font-size="9" fill="white" font-weight="bold">${note.label}</text>
                                `;
                    }
                }
            }
        });

        this.shadowRoot.innerHTML = `
                    <style>
                        :host {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            padding: 24px;
                            background-color: #f8f9fa;
                            border-radius: 8px;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        }
                        
                        .title {
                            font-size: 1.5rem;
                            font-weight: bold;
                            margin-bottom: 16px;
                            color: #2d3748;
                        }
                        
                        svg {
                            background: white;
                            border-radius: 4px;
                            border: 1px solid #e2e8f0;
                        }
                    </style>
                    
                    ${title ? `<div class="title">${title}</div>` : ''}
                    
                    <svg width="${totalWidth}" height="${totalHeight}">
                        ${fretLines}
                        ${stringLines}
                        ${fretNumbers}
                        ${stringNames}
                        ${barreElements}
                        ${noteElements}
                    </svg>
                `;
    }
}

// Define the custom elements
customElements.define('guitar-fretboard', GuitarFretboard);

// Simple placeholder elements for notes and barres
class FretNote extends HTMLElement { }
class FretBarre extends HTMLElement { }

customElements.define('fret-note', FretNote);
customElements.define('fret-barre', FretBarre);
