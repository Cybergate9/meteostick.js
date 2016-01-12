## meteostick.js
Node.js code for communicating with the Meteostick.

### Files

#### msfirsttest.js
This is the simplest test code to establish that you can talk to and receive data from your meteostick


### Test platform
I'm testing on OS X (10.11.2) using using Node.js v5.4 & npm serialport v2.0.6.
Weather station is a Davis Vantage Vue

### Dependencies

* serialport ([https://www.npmjs.com/package/serialport](https://www.npmjs.com/package/serialport))



### Background
[Meteostick](http://www.smartbedded.com/wiki/index.php/Meteostick) is produced by [Smartbedded](http://www.smartbedded.com/wiki/index.php/Main_Page) and is designed
solely to communicate with [Davis weather stations](http://www.davisnet.com/weather/) via RF.

It's interesting because it's well under half the price of the competing Davis product -
[IP Weather Link](http://www.davisnet.com/weather/products/weather_product.asp?pnum=06555).

So, with a meteostick, you can communicate with your Davis weather station, without interrupting data flow to your Davis console, allowing you to log all the data on your chosen system.
