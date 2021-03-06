const _ = require('lodash');
const figlet = require('figlet');
const chalk = require('chalk');
const noble = require('@abandonware/noble');
const bleno = require('./index');
const terminalImage = require('terminal-image');
const { request } = require('graphql-request');

const EXPECTED_MANUFACTURER_DATA_LENGTH = 25;
const APPLE_COMPANY_IDENTIFIER = 0x004c; // https://www.bluetooth.org/en-us/specification/assigned-numbers/company-identifiers
const IBEACON_TYPE = 0x02;
const EXPECTED_IBEACON_DATA_LENGTH = 0x15;

// var opts = {
//   //Picture related
//   width: 1280,
//   height: 720,
//   quality: 100,
//   // Number of frames to capture
//   // More the frames, longer it takes to capture
//   // Use higher framerate for quality. Ex: 60
//   frames: 60,
//   //Delay in seconds to take shot
//   //if the platform supports miliseconds
//   //use a float (0.1)
//   //Currently only on windows
//   delay: 0,
//   //Save shots in memory
//   saveShots: true,
//   // [jpeg, png] support varies
//   // Webcam.OutputTypes
//   output: "jpeg",
//   //Which camera to use
//   //Use Webcam.list() for results
//   //false for default device
//   device: false,
//   // [location, buffer, base64]
//   // Webcam.CallbackReturnTypes
//   callbackReturn: "location",
//   //Logging
//   verbose: false
// };

// const Webcam = NodeWebcam.create(opts);

let citizenId = null;

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

    if (major === 0 && proximity === 'near') {
      citizenId = minor;
    };
  }
});

function showText(text) {
  console.log(chalk.magenta(figlet.textSync(text, {
    font: 'Ghost',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 160,
    whitespaceBreak: true,
  })));
}

async function showCitizen(id) {
  try {
    const data = await request('https://uitc.pominwu.org/', `
      query {
        citizen(id: "420") {
          id
          name
          infections {
            pathogen {
              name
              version
              spreadDistanceInMeters
              spreadTimeInSeconds
              spreadRatio
            }
            infectedAt
          }
          vaccinations {
            vaccine {
              name
              version
              generates { name }
              effectiveAfterSeconds
            }
            adminedAt
          }
          immunities {
            antibody {
              name
              version
              expiresInSeconds
            }
            expiresAt
          }
          photo {
            id
            url
            size
            thumbnail { url }
          }
        }
      }
    `);
  
    showText(data.citizen.name);

    const infection = _.sample(data.citizen.infections);
    if (infection) showText(_.get(infection, ['pathogen', 'name']));
  } catch (err) {
    showText('Not Found');
    // empty
  }
}

async function loop() {
  try {
    console.clear();
    if (citizenId !== null) {
      await showCitizen(citizenId);
      citizenId = null;
    } else {
      console.log(await terminalImage.file('edm.jpg'));
    }

    await new Promise((resolve) => setTimeout(resolve, 4000));
  } catch (error) {
    // empty
  }
  loop();
}

loop();