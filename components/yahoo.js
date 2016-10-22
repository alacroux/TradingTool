var request     = require('request');
var socketio    = require('socket.io');
var _           = require('underscore');
var fs          = require('fs');

var url = "http://finance.yahoo.com/d/quotes.csv?s=GOOGL+AAPL+MSFT&f=snb",
    callInterval = 4000,
    callInt,
    url,
    singleton,
    io,
    shares = {};

var Yahoo = function (http) {
    // Init socket
    io = socketio(http);
    
    // Start Yahoo Api calls
    this.startCalls();
};

Yahoo.prototype.getShares = function () {
    return this.shares;
}

Yahoo.prototype.call = function () {
    var that = this;
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Need to convert csv to json (more convenient)
            that.shares = convertToJson(body);
            // If I had more time, emit of the new values to update the user shares value
            //that.eventEmitter.emit('yahooUpdate', that.shares);
            // Emit an event on the socket to update the front end part
            io.emit("yahooUpdate", that.shares);
        }
        else {
            console.error("Error while calling Yahoo finance", error);
        }
    });
};

var convertToJson = function (csv) {
    var lines = csv.split("\n");
    var result = {};
    
    _.each(lines, function (line) {
        if(line !== "") {
            var elt = line.split(",");
            result[JSON.parse(elt[0])] = {
                id: JSON.parse(elt[0]),
                name: JSON.parse(elt[1]),
                price: JSON.parse(elt[2])
            };
        }
    });
    
    return result;
}

Yahoo.prototype.startCalls = function () {
    console.log("Start Yahoo calls with interval : ", callInterval);
    this.call();
    callInt = setInterval(this.call, callInterval);
}

Yahoo.prototype.stopCalls = function() {
    console.log("Stop Yahoo calls");
    clearInterval(callInt);
}

exports.getSingleton = function (http) {
    if (!singleton) {
        singleton = new Yahoo(http);
    }
    return singleton;
};