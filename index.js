const noble = require('@abandonware/noble');
const bleno = require('./index');
const terminalImage = require('terminal-image');

noble.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);
  if (state === 'poweredOn') {
    noble.startScanning([], true);
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