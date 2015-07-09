var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');  // Parser para leer querys tipo POST.
app.use( bodyParser. urlencoded() );  // Implementación del parser para la app.

var valido = { // Objeto con el usuario y contraseña para loggearse.
  user: "usuario",
  pass: "password"
};
var nombreCliente = "";
//Routes
app.get('/', function(req, res){  // Raíz para el chat del cliente.
  res.sendFile(__dirname + '/cliente.html');
});
app.get('/chat', function (req, res){ // Chat solicitado por el cliente.
  res.sendFile(__dirname + '/chat.html');
  nombreCliente = req.query.usuario; // Id a usar
});
app.get('/login', function (req, res) { // Login para el admin.
  res.sendFile(__dirname + '/login.html')
});
app.post('/salas', function (req, res) { // Salas activas visibles para
  var user = req.body.usuario;          // el admin.
  var pass = req.body.password;
  if (user === valido.user && pass === valido.pass) { // Condicional de
    res.sendFile(__dirname + '/salas.html');            // logeo exitoso.
  }
  else {
    res.sendFile(__dirname + '/badlogin.html'); // Respuesta en caso de error.
  }
});
//Socket
var nsp = io.of('/consultas');
nsp.on('connection', function(socket){
  console.log('Conectado');
  socket.on('Mensaje', function(msg){
    socket.join('/consultas');
    nsp.to('/consultas').emit('Mensaje', msg);  // Emisión del mensaje en el cliente web.
  });
});
//Server
http.listen(3000, function(){ // Puerto a usar en el server.
  console.log('listening on *:3000');
});
