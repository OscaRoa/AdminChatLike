var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
app.use( bodyParser. urlencoded() );

var validos = {
  user: "usuario",
  pass: "password"
};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/cliente.html');
});

app.get('/chat', function (req, res){
  res.sendFile(__dirname + '/chat.html');
});

app.get('/login', function (req, res) {
  res.sendFile(__dirname + '/login.html')
});
app.get('/salas', function (req, res) {
  var user = req.body.usuario;
  var pass = req.body.password;
  // console.log(user + ' ' + pass);
  if (user === validos.user && pass === validos.pass) {
    res.sendFile(__dirname + '/salas.html');
  }
  else {
    res.sendFile(__dirname + '/badlogin.html');
  }
});

io.on('connection', function(socket){
  socket.on('Mensaje', function(msg){
    io.emit('Mensaje', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
