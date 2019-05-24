$( document ).ready(function() {
 /*global io*/
var socket = io();
//var currentUsers = 0;
  //  ++currentUsers;
     // socket.emit('user count', currentUsers);
 socket.on('user count', function(data){
  console.log(data);
	});
  


});