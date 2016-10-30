var express     = require('express');
var app         = express();
var http        = require('http').Server(app);
var bodyParser  = require('body-parser');
var request     = require('request');
var yahoo       = require('./components/yahoo').getSingleton(http);
var service     = require('./components/service').getSingleton();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = express.Router();
app.use('/api', router);

// add and remove amounts to the cash balance
router.route('/cash')
    .post( function (req, res) {
        res.json({ user : service.addCash(req.body.cash), message: 'Cash added' });
    })
    .put( function (req, res) {
        res.json({ user : service.removeCash(req.body.cash), message: 'Cash removed' });
    });

// buy and sell shares
router.route('/shares')
    .post( function (req, res) {
        var user = service.buyShares(req.body.id, req.body.quantity);
        if(user === null) {
            res.json({ error : "Not enough money, sorry..." });
        }
        else {
            res.json({ user : user, message: 'Share bought' });
        }
    })
    .put( function (req, res) {
        res.json({ user : service.sellShares(req.body.id, req.body.quantity), message: 'Share sold' });
    });

// get the user state
router.route('/user')
    .get( function (req, res) {
        res.json({ user : service.getUser()});
    });

app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});

http.listen(8080, function(){

});