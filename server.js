var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var _ = require('underscore');
app.listen(8084);

var hashName = {};

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            res.writeHead(200);
            res.end(data);
        });
}
function broadcast() {
    io.sockets.emit("connectNum",Object.keys(hashName).length);
    io.sockets.emit("users",hashName);
}
io.on('connection', function(socket){
    console.log('connection succed!');
    broadcast();
    socket.on('setName',function (data) {
        var name = data;
        hashName[name] = socket.id;
        console.log(hashName);
        broadcast();
    });
    socket.on('sayTo',function (data) {
        var toName = data.to;
        var toId;
        console.log(toName);
        if(toId = hashName[toName]){
            var toSocket = _.findWhere(io.sockets.sockets,{id:toId});
            toSocket.emit('message',data);
        }
    })
    socket.on('disconnect', function(){
        console.log('connection is disconnect!');
    });
});