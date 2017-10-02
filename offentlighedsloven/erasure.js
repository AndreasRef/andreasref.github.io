function process(data, mouseStatus) {
    var words = splitTokens(data, ' .,:;!@#$%&*()\n');

    var par = createP('');
    par.class('text');
    

    
    // Here each word is made into a div
    for (var i = 0; i < words.length; i++) {
        var div = createDiv(words[i] + ' ');
        // This keeps it looking like regular text
        div.style('display', 'inline');
        // This makes it look clickable
        div.style('cursor', 'pointer');

        // The div is placed inside the paragraph element
        div.parent(par);
        
        div._black = true;
        div.style('background-color', '#000000')
        div.mouseOver(unhighlight);
        div.mousePressed(eraseIt);
    }

    paragraphs.push(par);

}

function eraseIt() {
    this._black = !this._black;
    
    if (this._black) {
        this.style('color', '#000000');
        this.style('background-color', '#000000');
    } else {
        this.style('background-color', '');
    }
}

function highlight() {
    this.style('background-color', '#AAA')
}

function unhighlight() {
    if (mouseIsPressed){
        this._black = false;
        this.style('background-color', '');
    }
}
