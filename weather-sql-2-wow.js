// meteosticktx.js - Meteostick WOW data transmitter
// for getting the latest values from SQLite and http'ing them up to
// http://wow.metoffice.gov.uk/
// Licence: MIT Licence (https://github.com/ITWrangler/meteostick.js/blob/master/LICENSE)
// Copyright 2016 Shaun Osborne
// run with 'node meteosticktx.js -h' for help
// Note: this script will never stop CTRL-C to exit
// Versions:
// 0.5 - initial

var program = require('commander');
var sqlite3 = require('sqlite3');
var http = require('http');

var gDBName = 'meteostickrx.db';
var gDBTable = 'tbl_weatherdata';
var gDelayMS = 900000; /* default 15 mins */
var gSiteID = 'siteid='+'952386001';
var gSiteKey = 'siteAuthenticationKey='
var gSW='softwaretype=custom'
var gWOWData = { /*globally available weather data object */
  dateutc : "n/a",
  winddir: 'n/a',
  windspeedmph: 'n/a',
  tempf: 'n/a',
  humidity: 'n/a',
  baromin: 'n/a'
};


program.version('0.5')
.option('-i --interval [interval seconds]', 'output interval timer')
.option('-m --minutes [interval minutes]', 'output interval timer (minutes)')
//.option('-o --outputtype [JSON|CSV|SQL]', 'output type', 'JSON')
.option('-q --quiet', 'run quietly (no statuses etc)')
.option('-k --key [key]', 'value for siteAuthenticationKey= ')
.parse(process.argv);

if(program.interval){
  gDelayMS = program.interval*1000;
}
if(program.minutes){
  gDelayMS = (program.minutes*60)*1000;
}

if(program.key){
  gSiteKey=gSiteKey+program.key;
}
else {
  throw new Error('must provide siteAuthenticationKey= (via -k)');
}

//hello!
if(!program.quiet){
  console.log("Meteostick Transmitter");
  console.log("Interval: "+gDelayMS+"(ms), "+(gDelayMS/60)/1000+"(minutes)");
}

var db = new sqlite3.Database(gDBName,function(err){
   if(err){
     throw new Error(err);
   }
   else{
   if(program.verbose) {console.log('DB ['+gDBName+'] opened..');}
   }
 });

outputData();

/* end of main... */

/* rather than use interval timer here (which caused issues) using this recursive
timer approach as suggested at:
https://docs.nodejitsu.com/articles/javascript-conventions/what-are-the-built-in-timer-functions
*/
function outputData() {
db.get("SELECT * FROM " + gDBTable + " ORDER BY dtg DESC", function(err, row){
      if(err){
        throw new Error("SQL Error: "+err);
       }
      else {
        datetime = new Date(row.dtg*1000)
        gWOWData.dateutc =  datetime.toISOString().replace(/T/," ").replace(/.\d\d\dZ/,"").replace(/\:/g,"%3A").replace(/\s/,"%20");
        gWOWData.winddir = row.winddirection;
        gWOWData.windspeedmph = row.windspeed;
        gWOWData.tempf = (row.outsidetemp*1.8)+32;
        gWOWData.humidity = row.outsidehumidity;
        gWOWData.baromin = row.insidepressure/33.8638866667;
        var req = {
          hostname : "wow.metoffice.gov.uk",
          port: 80,
          path : '/automaticreading?'+gSiteID+'&'+gSiteKey+'&'+gSW+'&dateutc='+
                  gWOWData.dateutc+'&winddir='+gWOWData.winddir+'&windspeedmph='+
                  gWOWData.windspeedmph+'&tempf='+gWOWData.tempf+'&humidity='+
                  gWOWData.humidity+"&baromin="+gWOWData.baromin
        };
        //console.log("curl \""+req.hostname+req.path+"\"");
        if(!program.quiet){
          console.log("TIME: "+datetime.toISOString());
          console.log("RAW: "+JSON.stringify(row));
          console.log("PATH: "+req.path);
        }
        http.get(req, function (res) {
          if(!program.quiet){
            console.log("HTTP response code: [" + res.statusCode +"]");
          }
        });
      }

  });
      setTimeout(outputData,gDelayMS);
}
