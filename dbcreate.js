// dbcreate.js - create/empty meteostickrx.db to support metestickrx.js
// Licence: MIT Licence (https://github.com/ITWrangler/meteostick.js/blob/master/LICENSE)
// Copyright 2016 Shaun Osborne
// USAGE:
// node dbcreate.js - creates new database and table
// node dbcreate.js DROP - opens database, deletes exisiting table, recreates new table

var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('meteostickrx.db');

db.serialize(function() {
  if(process.argv[2].match(/drop/gi)){db.run("DROP TABLE tbl_weatherdata");}
  db.run(
    "CREATE TABLE tbl_weatherdata (" +
    "dtg int, txid int, windspeed int, winddirection int," +
    "outsidetemp int, outsidehumidity int, insidetemp int," +
    "insidepressure int, signalstrength int, rfpackets int," +
    " solarpanel int, warnings varchar(255));"
  );
});

db.close();
