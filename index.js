const figlet = require('figlet');
const noble = require('@abandonware/noble');
const bleno = require('./index');
const terminalImage = require('terminal-image');

const EXPECTED_MANUFACTURER_DATA_LENGTH = 25;
const APPLE_COMPANY_IDENTIFIER = 0x004c; // https://www.bluetooth.org/en-us/specification/assigned-numbers/company-identifiers
const IBEACON_TYPE = 0x02;
const EXPECTED_IBEACON_DATA_LENGTH = 0x15;

noble.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);
  if (state === 'poweredOn') {
    noble.startScanning([], true);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', (peripheral) => {
  const manufacturerData = peripheral.advertisement.manufacturerData;
  const rssi = peripheral.rssi;

  if (manufacturerData &&
      EXPECTED_MANUFACTURER_DATA_LENGTH <= manufacturerData.length &&
      APPLE_COMPANY_IDENTIFIER === manufacturerData.readUInt16LE(0) &&
      IBEACON_TYPE === manufacturerData.readUInt8(2) &&
      EXPECTED_IBEACON_DATA_LENGTH === manufacturerData.readUInt8(3)) {

    const uuid = manufacturerData.slice(4, 20).toString('hex');
    const major = manufacturerData.readUInt16BE(20);
    const minor = manufacturerData.readUInt16BE(22);
    const measuredPower = manufacturerData.readInt8(24);

    const accuracy = Math.pow(12.0, 1.5 * ((rssi / measuredPower) - 1));

    let proximity = null;
    if (accuracy < 0) {
      proximity = 'unknown';
    } else if (accuracy < 0.5) {
      proximity = 'immediate';
    } else if (accuracy < 4.0) {
      proximity = 'near';
    } else {
      proximity = 'far';
    }

    const bleacon = {};

    bleacon.uuid = uuid;
    bleacon.major = major;
    bleacon.minor = minor;
    bleacon.measuredPower = measuredPower;
    bleacon.rssi = rssi;
    bleacon.accuracy = accuracy;
    bleacon.proximity = proximity;

    console.log(bleacon);
  }
});

function showText(text) {
  figlet.text(text, {
    font: 'Ghost',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: true
  }, function(err, data) {
    console.log(data);
  });
}

async function loop() {
  console.clear();
  console.log(await terminalImage.file('./edm.jpg'));
  await new Promise((resolve) => setTimeout(resolve, 4000));
  loop();
}

loop();