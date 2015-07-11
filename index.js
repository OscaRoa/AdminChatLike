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
  res.sendFile(__dirname + '/chat.html');
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
// Usuarios presentes
var usernames = {};

// Arreglo donde se guardarán las salas.
var rooms = [];

io.sockets.on('connection', function (socket) {

	// Funcion para agregar un usuario.
	socket.on('adduser', function(username){
    var room = socket.id;
    rooms.push(username);
		// Nombre de usuario.
		socket.username = username;
		// Nombre de la sala.
		socket.room = username;
		// Nombre de usuario en la lista principal.
		usernames[username] = username;
		// Envío a la sala del cliente.
		socket.join(username);
		// Notificación de clientes conectados.
		socket.emit('updatechat', 'SERVER', 'estás conectado a ' + username);
		// Notificación de conexión en la sala.
		socket.broadcast.to(room).emit('updatechat', 'SERVER', username + ' se ha unido.');
		socket.emit('updaterooms', rooms, username);
	});

	// Función 'sendchat' que es ejecutada cuando se pide en el lado del cliente.
	socket.on('sendchat', function (data) {
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});

	socket.on('switchRoom', function(newroom){
		socket.leave(socket.room);
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'estás conectado a '+ newroom);
		// Mensaje enviado en la sala abandonada.
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' abandonó la sala.');
		// Actualización de la sala.
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' se ha unido.');
		socket.emit('updaterooms', rooms, newroom);
	});


	// Función que se ejecuta cuando el cliente se desconecta.
	socket.on('disconnect', function(){
		// Se borra el nombre de usuario.
		delete usernames[socket.username];
		// Actualizar la lista de usuarios en la lado del cliente.
		io.sockets.emit('updateusers', usernames);
		// Mensaje en la sala notificando que el cliente se desconectó.
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' se ha desconectado.');
		socket.leave(socket.room);
	});
});

//Server
http.listen(3000, function(){ // Puerto a usar en el server.
  console.log('listening on *:3000');
});
