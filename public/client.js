$( document ).ready(function() {
 /*global io*/
var socket = io();
//var currentUsers = 0;
  //  ++currentUsers;
     // socket.emit('user count', currentUsers);
 socket.on('user count', function(data){
  console.log(data);
	});
  
socket.on('user', function(data){
 
    $('#num-users').text(data.currentUsers+' users online');
  var message = data.name;
  if(data.connected) {
    message += ' has joined the chat.';
  } else {
    message += ' has left the chat.';
  }
  $('#messages').append($('<li>').html('<b>'+ message +'<\/b>'));
});

});