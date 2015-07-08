var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');  // Parser para leer querys tipo POST.
app.use( bodyParser. urlencoded() );  // Implementación del parser para la app.

var validos = { // JSON con el usuario y contraseña para loggearse.
  user: "usuario",
  pass: "password"
};

app.get('/', function(req, res){  // Raíz para el chat del cliente.
  res.sendFile(__dirname + '/cliente.html');
});

app.get('/chat', function (req, res){ // Chat solicitado por el cliente.
  res.sendFile(__dirname + '/chat.html');
});

app.get('/login', function (req, res) { // Login para el admin.
  res.sendFile(__dirname + '/login.html')
});
app.get('/salas', function (req, res) { // Salas activas visibles para
  var user = req.body.usuario;          // el admin.
  var pass = req.body.password;
  // console.log(user + ' ' + pass);
  if (user === validos.user && pass === validos.pass) { // Condicional de
    res.sendFile(__dirname + '/salas.html');            // logeo exitoso.
  }
  else {
    res.sendFile(__dirname + '/badlogin.html'); // Respuesta en caso de error.
  }
});

io.on('connection', function(socket){
  socket.on('Mensaje', function(msg){
    io.emit('Mensaje', msg);  // Emisión del mensaje en el cliente web.
  });
});

http.listen(3000, function(){ // Puerto a usar en el server.
  console.log('listening on *:3000');
});
