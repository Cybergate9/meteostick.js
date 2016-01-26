// meteostickrx.js - Meteostick serial port data receiver
// Licence: MIT Licence (https://github.com/ITWrangler/meteostick.js/blob/master/LICENSE)
// Copyright 2016 Shaun Osborne
// run with 'node meteostickrx.js -h' for help
// Note: this script will never stop - unless port closes for some reason - CTRL-C to exit
// Versions:
// 0.5 - initial
// 0.6 - very basic sqlite support added
// 0.6.2 - datetimegroup fixed to output unixepoch time to match with sqlite
// 0.6.2 - added raw output option

var serialport = require('serialport');
var program = require('commander');
var sqlite3 = require('sqlite3');

var gDBName = 'meteostickrx.db';
var gDBTable = 'tbl_weatherdata';

program.version('0.6.2')
.option('-s --serialport [serial port path]', 'meteostick serial port path+name')
.option('-d --datatype [JSON|CSV|SQL|RAW]', 'output type', 'JSON')
.option('-t --throwaway', 'throw away not fully populated CSV/SQL output')
.option('-v --verbose', 'output statuses etc')
.parse(process.argv);

var SerialPort = serialport.SerialPort;

var gPortName='/dev/cu.usbserial-AI02XBCI';  /* global static portname, default my portname on OS X */
var gCurrentData={ /*globally available weather data object */
  dtg : 0,
  txid: 'na',
  windspeed: 'n/a',
  winddirection: 'n/a',
  outsidetemp: 'n/a',
  outsidehumidity: 'n/a',
  rainticks: 0,
  insidetemp: 'n/a',
  insidepressure: 'n/a',
  rfpackets: 'n/a',
  signalstrength: 'n/a',
  solarpanel: 'n/a',
  warnings:'none'
};

if(program.datatype === 'SQL'){
 var db = new sqlite3.Database(gDBName,function(err){
   if(err){
     throw new Error(err);
   }
   else{
   if(program.verbose) {console.log('DB ['+gDBName+'] opened..');}
   }
 });
}

//hello!
if(program.verbose){
  console.log("Meteostick Receiver (for board version:1.0, software version:2.3b1");
}

// get list of serial ports if we're running verbose
if(program.verbose){
  serialport.list(function (err, ports) {
  console.log("Available \"serialport\" ports:\r");
  ports.forEach(function(port) {
    console.log(port.comName);
  });
});
}

if(program.serialport === undefined){
  portName = gPortName; //default to global static
}
else{
  portName = program.serialport;
}

//open the port using new()
var myPort = new SerialPort(portName, {
   baudRate: 115000,
   // look for return and newline at the end of each data packet:
   parser: serialport.parsers.readline("\r")
});

/* serialport event callbacks */
myPort.on('open', showPortOpen);
myPort.on('data', receiveSerialData);
myPort.on('close', showPortClose);
myPort.on('error', showError);

/* end of main... */


function showPortOpen() {
   if(program.verbose){console.log('Port open:['+portName+'] with data rate:[' +
      myPort.options.baudRate+']');}
}

function showPortClose() {
   console.log('Port closed.');
}

function showError(error) {
   console.log('Port error: [' + error+']');
}

function receiveSerialData(data) {
   if(program.verbose){console.log('\rReceived:['+data.trim()+']');}
   // this (?) is the marker from meteostick that its ready to accept commands
   if(data.match(/\?/g)){ // and if so send our setup commands
      if(program.verbose){console.log("READY\r");}
      msSendCommands();
      return;
     }
   if(program.datatype === 'RAW'){
     console.log(data);
     return;
   }
   processed=msDataParse(data,program.datatype);
   if(processed){ //msDataParse() either returns something or null if it can't parse with current settings
     if(program.datatype === 'JSON'){ // if its JSON stringify it
       console.log(JSON.stringify(processed));
     }
     else if(program.datatype == 'SQL' && processed === 'SQL'){
       writeCurrentDataSQL(); //if its SQL write it to DB
     }
     else {
       console.log(processed); // otherwise its CSV, just write it
     }
   }

}

function msSendCommands(){
  if(program.verbose){console.log("SENDING COMMANDS\r");}
  myPort.write("o1\r"); // output format 1 (computed values)
  myPort.write("t255\r"); // show all 8 channels
  myPort.write("m1\r"); // EU frequency
}

function msDataParse(data,type){
  if(program.verbose){console.log("parse:["+type+"] data:["+data.trim()+"]");}
  var dtg = Math.floor(Date.now() / 1000); // seconds since 1970, e.g. unix time
  var result={};
  if(type === undefined){
    type='JSON';
  }
  parts = data.split(' ');
  result.dtg=dtg;
  gCurrentData.dtg = dtg;

  if(parts[0].match(/W/g)){
      if(type==='JSON'){
        result['type']='wind';
        result['txId']=parts[1];
        result['value1']=parts[2];
        result['value1Unit']='metres/seconds';
        result['value2']=parts[3];
        result['value2Unit']='degrees';
        result['signalStrength']=parts[4];
        if(parts[5] !== undefined){
          result['warning']='low battery';
        }
        return result;
      }
      if(type==='CSV'){
        gCurrentData.txid = parts[1];
        gCurrentData.windspeed = parts[2];
        gCurrentData.winddirection = parts[3];
        gCurrentData.signalstrength = parts[4];
        if(parts[5] !== undefined){
          gCurrentData.warnings='low battery'
        return getCurrentDataCSV();
        }
      }
     if(type==='SQL'){
        gCurrentData.txid = parts[1];
        gCurrentData.windspeed = parts[2];
        gCurrentData.winddirection = parts[3];
        gCurrentData.signalstrength = parts[4];
        if(parts[5] !== undefined){
          gCurrentData.warnings='low battery'
        }
        return 'SQL';
     }
}

  if(parts[0].match(/R/g)){
     if(type==='JSON'){
       result['type']='rain';
       result['txId']=parts[1];
       result['value1']=parts[2];
       result['value1Unit']='ticks';
       result['signalStrength']=parts[3];
       if(parts[4] !== undefined){
         result['warning']='low battery';
       }
       return result;
     }
     if(type==='CSV'){
       gCurrentData.txid = parts[1];
       gCurrentData.rainticks = parts[2];
       gCurrentData.signalstrength = parts[3];
       if(parts[4] !== undefined){
         gCurrentData.warnings='low battery';
       }
       return getCurrentDataCSV();
     }
     if(type==='SQL'){
       gCurrentData.txid = parts[1];
       gCurrentData.rainticks = parts[2];
       gCurrentData.signalstrength = parts[3];
       if(parts[3] !== undefined){
         gCurrentData.warnings='low battery'
       }
      return 'SQL';
   }
    }

 if(parts[0].match(/P/g)){
        if(type==='JSON'){
       result['type']='solarpanel';
       result['txId']=parts[1];
       result['value1']=parts[2];
       result['value1Unit']='powerPecentage';
       result['signalStrength']=parts[3];
       if(parts[4] !== undefined){
         result['warning']='low battery';
       }
       return result;
      }
      if(type==='CSV'){
        gCurrentData.txid = parts[1];
        gCurrentData.solarpanel = parts[2];
        gCurrentData.signalstrength = parts[3];
        if(parts[4] !== undefined){
          gCurrentData.warnings='low battery';
        }
        return getCurrentDataCSV();
      }
      if(type==='SQL'){
        gCurrentData.txid = parts[1];
        gCurrentData.solarpanel = parts[2];
        gCurrentData.signalstrength = parts[3];
        if(parts[3] !== undefined){
          gCurrentData.warnings='low battery'
        }
         return 'SQL';
    }
  }

  if(parts[0].match(/T/g)){
    if(type === 'JSON'){
        result['type']='temperature';
        result['txId']=parts[1];
        result['value1']=parts[2];
        result['value1Unit']='degrees (celsius)';
        result['value2']=parts[3];
        result['value2Unit']='percent';
        result['signalStrength']=parts[4];
        if(parts[5] !== undefined){
          result['warning']='low battery';
        }
        return result;
      }
        if(type==='CSV'){
          gCurrentData.txid = parts[1];
          gCurrentData.outsidetemp = parts[2];
          gCurrentData.outsidehumidity = parts[3];
          if(parts[4] !== undefined){
            gCurrentData.warnings='low battery';
          }
          return getCurrentDataCSV();
        }
        if(type==='SQL'){
          gCurrentData.txid = parts[1];
          gCurrentData.outsidetemp = parts[2];
          gCurrentData.outsidehumidity = parts[3];
          if(parts[3] !== undefined){
            gCurrentData.warnings='low battery'
          }
          return 'SQL';
      }
       }

   if(parts[0].match(/B/g) ){
         if(parseInt(parts[1]) > 10000){ // if we get spurious uncomputed values throw away
           return null;
         }
         if(type === 'JSON'){
         result['type']='MS temperature';
         result['value1']=parts[1];
         //result['value1']=(parseInt(parts[1])/1458.5);
         result['value1Unit']='degrees (celsius)';
         result['value2']=parts[2];
         //result['value2']=(parseInt(parts[2])/328.13);
         result['value2Unit']='pressure (hPa)';
         result['RFPackets']=parts[3];
         return result;
         }
         if(type==='CSV'){
           gCurrentData.insidetemp = parts[1];
           gCurrentData.insidepressure = parts[2];
           gCurrentData.rfpackets = parts[3];
           return getCurrentDataCSV();
         }
         if(type==='SQL'){
           gCurrentData.insidetemp = parts[1];
           gCurrentData.insidepressure = parts[2];
           gCurrentData.rfpackets = parts[3];
           return 'SQL';
         }
      }
  return null; // if we get here we dont recognise input
} /* end of msDataParse() */

function getCurrentDataCSV(){
  var CSVdata = '"'+
  gCurrentData.dtg+'","'+
  gCurrentData.txid+'","'+
  gCurrentData.windspeed+'","'+
  gCurrentData.winddirection+'","'+
  gCurrentData.outsidetemp+'","'+
  gCurrentData.outsidehumidity+'","'+
  gCurrentData.rainticks+'","'+
  gCurrentData.insidetemp+'","'+
  gCurrentData.insidepressure+'","'+
  gCurrentData.signalstrength+'","'+
  gCurrentData.rfpackets+'","'+
  gCurrentData.solarpanel+'","'+
  gCurrentData.warnings+
  "\"";
  if(program.throwaway && (CSVdata.match(/\"n\/a\"/) || CSVdata.match(/\"\"/))){
    return null;
  }
  else{
    return CSVdata;
  }
}

function writeCurrentDataSQL(){
  if(program.throwaway && getCurrentDataCSV() === null){
    return; // if we're instructed to throw away incomplete data do so (just return)
  }
  db.run("INSERT INTO " + gDBTable + " ("+
      "dtg, txid, windspeed ,winddirection ," +
      "outsidetemp, outsidehumidity, insidetemp," +
      "insidepressure, signalstrength, rfpackets ," +
      "solarpanel, warnings)"+
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [gCurrentData.dtg,
      gCurrentData.txid,
      gCurrentData.windspeed,
      gCurrentData.winddirection,
      gCurrentData.outsidetemp,
      gCurrentData.outsidehumidity,
      gCurrentData.rainticks,
      gCurrentData.insidetemp,
      gCurrentData.insidepressure,
      gCurrentData.signalstrength,
      gCurrentData.rfpackets,
      gCurrentData.solarpanel,
      gCurrentData.warnings],
      function(err){
        if(err){
          throw new Error("SQL Insert Error: "+err);
         }
      });
}
