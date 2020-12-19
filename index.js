const noble = require('@abandonware/noble');
const bleno = require('./index');
const terminalImage = require('terminal-image');

noble.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);
  if (state === 'poweredOn') {
    noble.startScanning(['d88815463ebd11eba0431f17d6b26b6b'], true);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', (peripheral) => {
  console.log(peripheral);
});

console.clear();

(async () => {
  console.log(await terminalImage.file('edm.jpg'));
})();