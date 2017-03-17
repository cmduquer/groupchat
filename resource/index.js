/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global app, Backbone */

var wsocket;
var serviceLocation = "ws://localhost:8080/chat/";
var $nickName;
var $message;
var $messageReceived;
var $chatWindow;
var room = '';

var app = {}; // create namespace for our app
//--------------
// Models
//--------------
app.messageModel = Backbone.Model.extend({
	defaults: {
        message : '',
        sender: '',
        received: '2017'
        
    }
});
//--------------
// Collections
//--------------
app.MessageList = Backbone.Collection.extend({
    model: app.messageModel,
    localStorage: new Store("Messages")
});

// instance of the Collection
app.MessageList = new app.MessageList();

//--------------
// Views
//--------------

// renders individual todo items list (li)
app.MessageView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($('#message-template').html()),
    render: function () {
        
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }

});


// renders the full list of todo items calling TodoView for each one.


//--------------
// Initializers
//--------------   


function onMessageReceived(evt) {
    var msg = JSON.parse(evt.data); // native API
    app.MessageList.add(msg);
}

function onClose(event) {
    $('.chat-signin').show();
    $('.chat-wrapper').hide();
    alert(event.reason);
    console.log(event.reason);
}
function sendMessage() {
    if ($message.val().includes('/youtube')) {
        console.log($message.val());
        console.log($message.val().replace("/youtube", ""))
        getRequest($message.val().replace("/youtube", ""), $nickName.val());
    } else {
        var msg = '{"message":"' + $message.val() + '", "sender":"'
                + $nickName.val() + '", "received":""}';
        wsocket.send(msg);
    }
    $message.val('').focus();
}

function connectToChatserver() {
    room = 'Sala';
    wsocket = new WebSocket(serviceLocation + room + '/' + $nickName.val());
    wsocket.onmessage = onMessageReceived;
    wsocket.onclose = onClose;
}

function leaveRoom() {
    wsocket.close();
    $chatWindow.empty();
    $('.chat-wrapper').hide();
    $('.chat-signin').show();
    $nickName.focus();
}

$(document).ready(function () {
    $nickName = $('#nickname');
    $message = $('#message');
    $chatWindow = $('#response');
    $('.chat-wrapper').hide();
    $nickName.focus();
});

function getRequest(searchTerm, nickname) {
    url = 'https://www.googleapis.com/youtube/v3/search';
    var params = {
        part: 'snippet',
        key: 'AIzaSyAuyFIaDpcg2NUKpBjbyUo2rhHuiF1L7hA',
        q: searchTerm,
        maxResults: 1
    };

    $.getJSON(url, params, function (searchTerm) {
        return showResults(searchTerm,nickname);
    });
}


function showResults(results, nickname) {
    var html = "";
    var entries = results.items;

    $.each(entries, function (index, value) {
        var id =  value.id.videoId;
        var msg = '{"message":"'+ id + '", "sender":"'
                + nickname + '", "received":"'+ new Date() +'"}';
        console.log(msg);
        app.MessageList.add(JSON.parse(msg));
         html += '<iframe id="ytplayer" type="text/html" width="640" height="360" src="http://www.youtube.com/embed/'+id+'" frameborder="0"/>';
        $('#message'+id).html(html);
    });
     return html;
    

    
}
