var _           = require('underscore');
var yahoo       = require('./yahoo').getSingleton();

var singleton;
var Service = function () {};

var user = {
    wallet : 0,
    sharesValue : 0,
    shares : {}
};

Service.prototype.addCash = function (cash) {
    user.wallet += parseInt(cash);
    
    return user;
};

Service.prototype.removeCash = function (cash) {
    if(user.wallet - cash < 0) {
        user.wallet = 0;
    } 
    else {
        user.wallet -= parseInt(cash);
    }
    
    return user;
};

Service.prototype.buyShares = function (id, quantity) {
    // Current price of the share according to last yahoo values
    var currentPrice = yahoo.getShares()[id].price;
    
    // Enough money ?
    if(currentPrice * quantity <= user.wallet) {
        // Does the share already exists ?
        if(user.shares[id] !== undefined) {
            user.shares[id] += parseInt(quantity);
        }
        else {
            user.shares[id] = parseInt(quantity);
        }
        
        // Empty the wallet (nothing is free in life...)
        user.wallet -= currentPrice * quantity

        // Update the total value according to last yahoo values
        this.updateSharesValue(yahoo.getShares());
        return user;
    }
    else {
        console.log("Not enough money to buy ", quantity, id);
        return null;   
    }    
};

Service.prototype.sellShares = function (id, quantity) {
    // Current price of the share according to last yahoo values
    var currentPrice = yahoo.getShares()[id].price;
    
    if(user.shares[id] <= parseInt(quantity)) {
        delete user.shares[id];
    }
    else {
        user.shares[id] -= parseInt(quantity)
    }
    
    // Good news !
    user.wallet += currentPrice * quantity
    
    // Update the total value according to last yahoo values
    this.updateSharesValue(yahoo.getShares());
    return user;
};

// Update the total value according to last yahoo values
Service.prototype.updateSharesValue = function (newShares) {
    var newSharesValue = 0;
    _.each(Object.keys(user.shares), function (id) {
        newSharesValue += newShares[id].price * user.shares[id];
    });
    user.sharesValue = newSharesValue;
    return user;
};

Service.prototype.getUser = function () {
    return user;
};

exports.getSingleton = function () {
    if (!singleton) {
        singleton = new Service();
    }
    return singleton;
};