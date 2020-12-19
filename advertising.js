const bleno = require('@abandonware/bleno');

console.log('bleno - iBeacon');

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertisingIBeacon('d88815463ebd11eba0431f17d6b26b6b', 0, 0, -59);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function() {
  console.log('on -> advertisingStart');
});

bleno.on('advertisingStop', function() {
  console.log('on -> advertisingStop');
});