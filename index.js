const noble = require('@abandonware/noble');
const bleno = require('./index');
const terminalImage = require('terminal-image');

noble.startScanning(['d8881546-3ebd-11eb-a043-1f17d6b26b6b'], true);

noble.on('discover', (peripheral) => {
  console.log(peripheral);
});

console.clear();

(async () => {
  console.log(await terminalImage.file('edm.jpg'));
})();