let myDescriptor;
var brightness = document.getElementById("brightness").value;

function startBLE() {
  navigator.bluetooth.requestDevice({
    // acceptAllDevices: true,
    // optionalServices: ['d0e21a4b-d38e-460f-90f7-8c8082284aee']
    filters: [
      { name: "KMMX-BLE" },
      { services: ['00001800-0000-1000-8000-00805f9b34fb', '00001801-0000-1000-8000-00805f9b34fb', 'd0e21a4b-d38e-460f-90f7-8c8082284aee'] },
    ]
  })
    .then(device => {
      // Human-readable name of the device.
      console.log(device.name);
      // Set up event listener for when device gets disconnected.
      device.addEventListener('gattserverdisconnected', onDisconnected);
      // Attempts to connect to remote GATT Server.
      return device.gatt.connect();
    })
    .then(server => server.getPrimaryService('c1449275-bf34-40ab-979d-e34a1fdbb129'))
    .then(service => service.getCharacteristic('49a36bb2-1c66-4e5c-8ff3-28e55a64beb3'))
    .then(characteristic => {
      myDescriptor = characteristic
      brightness = characteristic.properties.read
      console.log(brightness)
    })
    .then(_ => {
      console.log('Device connected');
    })
    .catch(error => { console.error(error); });
}

function onDisconnected(event) {
  const device = event.target;
  console.log(`Device ${device.name} is disconnected.`);
}

function onWriteButtonClick(value) {
  if (!myDescriptor) {
    return;
  }
  myDescriptor.writeValue(Uint8Array.of(value))
    .then(_ => {
      console.log('> Characteristic User Description changed to: ' + Uint8Array.of(value));
    })
    .catch(error => {
      console.log('Argh! ' + error);
    });
}


navigator.bluetooth.getAvailability().then(isAvailable => {
  console.log(isAvailable);
  if (!isAvailable) {
    console.log('lol');
    document.getElementById('notSupported').style.display = "block"
  }
});