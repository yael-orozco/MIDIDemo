const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const oscillators = {};
let sourceNode;
let audioContext;

startButton.addEventListener('click', () => {
    audioContext = new AudioContext();

    const audioUrl = 'beat.mp3';
    fetch(audioUrl)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {

        // Create an AudioBufferSourceNode
        sourceNode = audioContext.createBufferSource();

        // Set the buffer to the loaded audio file
        sourceNode.buffer = audioBuffer;

        // Set the loop property to true
        sourceNode.loop = true;

        // Connect the source node to the destination (speakers)
        sourceNode.connect(audioContext.destination);

        // Start playing the audio
        sourceNode.start();

    });
})

stopButton.addEventListener('click', () => {
    sourceNode.stop();
})

navigator.requestMIDIAccess().then(success);

function success(midiAccess){
    const inputs = midiAccess.inputs;

    inputs.forEach((input) => {
        console.log(input);
        input.addEventListener('midimessage', handleInput);
    })
}

function handleInput(input){
    const command = input.data[0];
    const note = input.data[1];
    const velocity = input.data[2];
    
    switch(command){
        case 144:
            if(velocity > 0){
                noteOn(note);
            }
            else{
                noteOff(note);
            }
            break;
        case 128:
            break;
    }
}

function midiToNote(midi){
    const a = 440;
    return (a / 32) * (2 ** ((midi - 9) / 12));
}

function noteOn(note){
    const osc = audioContext.createOscillator();
    const oscGain = audioContext.createGain();

    oscillators[note.toString()] = osc;

    oscGain.gain.value = 0.08;
    osc.type = 'sawtooth';
    osc.frequency.value = String(midiToNote(note));
    osc.connect(oscGain);
    oscGain.connect(audioContext.destination);
    osc.start();
}

function noteOff(note){
    const osc = oscillators[note.toString()];
    osc.stop();
    delete oscillators[note.toString()];
}