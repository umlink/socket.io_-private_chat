var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var _ = require('underscore');
app.listen(8084);

var hashName = {};

function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            res.writeHead(200);
            res.end(data);
        });
}

function broadcast() {
    io.sockets.emit("connectNum", Object.keys(hashName).length);
    io.sockets.emit("users", hashName);
}

//提供私有socket
function privateSocket(toId) {
    return( _.findWhere(io.sockets.sockets, {id: toId}));

}

//返回给当前客户端提示
function tipToClient(socket,msg) {
    privateSocket(socket.id).emit('tip', msg);
}

io.on('connection', function (socket) {
    console.log('connection succed!');
    broadcast();
    socket.on('setName', function (data) {
        var name = data;
        if (hashName[name]) {//若已经存在则重新注册
            tipToClient(socket,"tip: " + name + " 已注册！");
            return;
        }
        tipToClient(socket,"tip: " + name + " 注册成功");
        hashName[name] = socket.id;
        console.log(hashName);
        broadcast();
    });
    socket.on('sayTo', function (data) {
        var toName = data.to;
        var toId;
        console.log(toName);
        if (toId = hashName[toName]) {
            privateSocket(toId).emit('message', data);
        }
    });
    socket.on('disconnect', function () {
        console.log('connection is disconnect!');
    });
});