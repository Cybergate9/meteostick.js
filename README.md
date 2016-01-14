## meteostick.js
Node.js code for communicating with the [Meteostick](http://www.smartbedded.com/wiki/index.php/Meteostick). Receives data from weather station via meteostick and outputs as CSV, JSON or into a SQLite database.

### Files

#### msfirsttest.js
This is the simplest test code to establish that you can talk to and receive data from your meteostick.

Usage: node msfirstest.js [serialportname]

where serialportname [optional] = /dev/ttyUSB0 or similar on a \*nix type system

#### meteostickrx.js
A more complete tool, capable of receiving and outputting in JSON or CSV per line format, or
into a SQLite database.

 'node meteostickrx.js -h' for help

#### dbcreate.js
A simple script to create and/or empty the meteostickrx.db SQLite file.

`node dbcreate.js` - to create db file meteostickrx.db with tbl_weatherdata

`node dbcreate.js DROP` - to re-create (empty) tbl_weatherdata in existing meteostickrx.db file


### Test platform
My basic testing has been on OS X (10.11.2) using using Node.js v5.4 & npm serialport v2.0.6.

I have also installed and tested on a Debian 8 system from the git repository.

Weather station is a Davis Vantage Vue.

### Dependencies

* serialport (npm) ([https://www.npmjs.com/package/serialport](https://www.npmjs.com/package/serialport))

* commander (npm)
([https://www.npmjs.com/package/commander](https://www.npmjs.com/package/commander))

* sqlite3 (npm)
([https://www.npmjs.com/package/sqlite3](https://www.npmjs.com/package/sqlite3))

### Install on Debian
To use this on Debian (my test is a Debian 8 VM on a QNAP NAS) you'll need all the same dependencies.

For npm serialport to build you'll need to follow instructions as per [these notes](https://www.npmjs.com/package/serialport#desktop-debianubuntu-linux)..

Short version:

`apt-get update`

`apt-get install git`

`apt-get install nodejs nodejs-legacy`

`apt-get install npm`

`apt-get install build-essentials`

Now you should have everything you need, and can clone and install (package.json gets read by npm):

`git clone https://github.com/ITWrangler/meteostick.js.git`

`npm install`

Hardware: FTDI VCP drivers are already on Debian so your meteostick should register on something like /dev/TTYUSB0. Running 'node msfirsttest.js' should confirm serial devices available.

### An aside... Installing Node.js 5.x on Debian

A number of problems are solved by moving from node.js 0.10.x (a standard apt-get install nodejs uses 0.10.x) to 5.4.x on Debian. So the quick version is:

Install 5.x using:

`apt-get install curl`

`curl -sL https://deb.nodesource.com/setup_5.x | bash -`
 (as per [this](https://github.com/nodejs/node-v0.x-archive/wiki/Installing-Node.js-via-package-manager))

`apt-get install nodejs`

You should now have a full node/npm 5.x install, confirm with `node -v` and `nodejs -v`

At this point it's probably best to reinstall all the NPM modules, so:

* delete your node_modules dir (e.g. `rm -rf node_modules` in your *project directory only*)

* force a re-install with `npm install`, which will read dependencies to install as usual from package.json

I had issues installing both sqlite3 and serialport npm modules before this.. and no problems installing either on Debian after getting Node.js 5.x installed using this approach.


### Background
The [Meteostick](http://www.smartbedded.com/wiki/index.php/Meteostick) is produced by [Smartbedded](http://www.smartbedded.com/wiki/index.php/Main_Page) and is designed
solely to communicate with [Davis weather stations](http://www.davisnet.com/weather/) via RF making data available via a virtual serial/comms port (VCP).

According to their blurb, it is compatible with Davis® Vantage Pro2, Vantage Pro2 Plus, and Vantage Vue sensors as well as various oem-branded hardware based on [Fine Offset](http://www.foshk.com/) weather stations - e.g the HP-100x series.

It's interesting because it's well under half the price of the competing Davis product -
the [IP Weather Link](http://www.davisnet.com/weather/products/weather_product.asp?pnum=06555). Although obviously you have to write your own code..

So, with a meteostick, you can communicate with your Davis weather station, without interrupting data flow to your Davis console, allowing you to log all the data on your chosen system.
