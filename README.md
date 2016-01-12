## meteostick.js
Node.js code for communicating with the Meteostick.

### Files

#### msfirsttest.js
This is the simplest test code to establish that you can talk to and receive data from your meteostick

#### meteostickrx.js
A more complete tool, capable of receiving and outputting in either JSON or CSV per line format, 'node meteostickrx.js -h' for help

### Test platform
I'm testing on OS X (10.11.2) using using Node.js v5.4 & npm serialport v2.0.6.
Weather station is a Davis Vantage Vue

### Dependencies

* serialport (npm) ([https://www.npmjs.com/package/serialport](https://www.npmjs.com/package/serialport))

* commander (npm)
([https://www.npmjs.com/package/commander](https://www.npmjs.com/package/commander))

### Install on Debian
To use this on Debian (my test is a Debian 8 VM on a QNAP NAS) you'll need all the same dependencies. To build serial port you'll need to follow instructions as per [these notes](https://www.npmjs.com/package/serialport#desktop-debianubuntu-linux)..

Short version:

`apt-get update

apt-get install git

apt-get install nodejs nodejs-legacy

apt-get install npm

apt-get install build-essentials`

Now you have everything you can clone:

`git clone https://github.com/ITWrangler/meteostick.js.git`

Hardware: FTDI VCP drivers are already on Debian so your meteostick should register on something like /dev/TTYUSB0. Running 'node msfirsttest.js' should confirm serial devices available.



### Background
[Meteostick](http://www.smartbedded.com/wiki/index.php/Meteostick) is produced by [Smartbedded](http://www.smartbedded.com/wiki/index.php/Main_Page) and is designed
solely to communicate with [Davis weather stations](http://www.davisnet.com/weather/) via RF.

It's interesting because it's well under half the price of the competing Davis product -
[IP Weather Link](http://www.davisnet.com/weather/products/weather_product.asp?pnum=06555).

So, with a meteostick, you can communicate with your Davis weather station, without interrupting data flow to your Davis console, allowing you to log all the data on your chosen system.
