// quick and dirty test of using node.js to talk via serial port,
// via FTDI/VCP to Meteostick
// (http://www.smartbedded.com/wiki/index.php/Meteostick)
// with thanks to
// https://itp.nyu.edu/physcomp/labs/labs-serial-communication/lab-serial-communication-with-node-js/
// for heads up on quick test setup of npm serialport module
// Licence: MIT Licence

// Note: this script with never stop - unless port closes for some reason - CTRL-C to exit

var serialport = require('serialport');

var SerialPort = serialport.SerialPort;

//hello!
console.log("Meteostick first test - tested on board version: 1.00, software version: 2.3b1\r");

// list serial ports:
  serialport.list(function (err, ports) {
  console.log("Available \"serialport\" ports:\r");
  ports.forEach(function(port) {
    console.log(port.comName);
  });
});

if(process.argv[2] === undefined){
  portName = '/dev/cu.usbserial-AI02XBCI'; // my serial id on OS X
} else {
  portName = process.argv[2];
}

//open the port using new() like so:
var myPort = new SerialPort(portName, {
   baudRate: 115000,
   // look for return and newline at the end of each data packet:
   parser: serialport.parsers.readline("\r")
 });

/* event defintion callbacks */
myPort.on('open', showPortOpen);
myPort.on('data', receiveSerialData);
myPort.on('close', showPortClose);
myPort.on('error', showError);

function showPortOpen() {
   console.log('Port open:['+portName+'] with data rate:[' +
   myPort.options.baudRate+']');
}

function showPortClose() {
   console.log('Port closed.');
}

function showError(error) {
   console.log('Port error: ' + error);
}
function receiveSerialData(data) {
   console.log(data);
   // this (?) is the marker from meteostick that its ready to accept commands
   if(data.match(/\?/g)){
      console.log("READY\r");
      myPort.write("m1\r"); // change to EU frequency
      myPort.write("o1\r"); // output format 1 (computed values)
      myPort.write("t255\r"); // show all 8 available channels
     }
 }
