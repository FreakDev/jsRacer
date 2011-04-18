/*
 * Copyright 2010 Micheil Smith.
 * 
 * All rights reserved.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */

/*-----------------------------------------------
  Requirements:
-----------------------------------------------*/
var sys    = require("util")
  , http   = require("http")
  , events = require("events")
  , path   = require("path");

require.paths.unshift(__dirname);

var Manager = require("ws/manager")
  , Connection = require("ws/connection");


/*-----------------------------------------------
  Mixin:
-----------------------------------------------*/
var mixin = function(target, source) {
  for(var i = 0, keys = Object.keys(source), l = keys.length; i < l; ++i) {
    if(source.hasOwnProperty(keys[i])){
      target[keys[i]] = source[keys[i]];
    }
  }
  return target;
};

/*-----------------------------------------------
  WebSocket Server Exports:
-----------------------------------------------*/
exports.Server = Server;
exports.createServer = function(options){
  return new Server(options);
};

exports._Manager = Manager;
exports._Connection = Connection;

/*-----------------------------------------------
  WebSocket Server Implementation:
-----------------------------------------------*/

function Server(options){
  var ws = this;

  events.EventEmitter.call(this);

  this.options = mixin({
    debug: false,         // Boolean:       Show debug information.
    version: "auto",      // String:        Value must be either: draft75, draft76, auto
    origin: "*",          // String, Array: A match for a valid connection origin
    subprotocol: "*",     // String, Array: A match for a valid connection subprotocol.
    datastore: true,      // Object, Function, Boolean: If === true, then it is the default mem-store.
    server: new http.Server()
  }, options || {});

  this.manager = new Manager(this.options.debug);
  this.server  = this.options.server
  this.debug   = this.options.debug;

  this.server.addListener("upgrade", function(req, socket, upgradeHead){
    if( req.method == "GET" && ( "upgrade" in req.headers && "connection" in req.headers) &&
        req.headers.upgrade.toLowerCase() == "websocket" && req.headers.connection.toLowerCase() == "upgrade"
    ){
      // create a new connection, it'll handle everything else.
      new Connection(ws, req, socket, upgradeHead);
    } else {
      // Close the socket, it wasn't a valid connection.
      socket.end();
      socket.destroy();
    }
  });

  this.server.addListener("connection", function(socket){
    socket.setTimeout(0);
    socket.setNoDelay(true);
    socket.setKeepAlive(true, 0);
  });

  this.server.addListener("listening", function(req, res){
    ws.emit("listening");
  });

  this.server.addListener("close", function(errno){
    ws.emit("shutdown", errno);
  });

  this.server.addListener("request", function(req, res){
    ws.emit("request", req, res);
  });

  this.server.addListener("stream", function(stream){
    ws.emit("stream", stream);
  });

  this.server.addListener("clientError", function(e){
    ws.emit("clientError", e);
  });
};

sys.inherits(Server, events.EventEmitter);

/*-----------------------------------------------
  Public API
-----------------------------------------------*/
Server.prototype.setSecure = function (credentials) {
  this.server.setSecure.call(this.server, credentials);
}

Server.prototype.listen = function(){
  this.server.listen.apply(this.server, arguments);
};

Server.prototype.close = function(){
  this.server.close();
};

Server.prototype.send = function(id, data){
  this.manager.find(id, function(client){
    if(client && client._state === 4){
      client.write(data);
    }
  });
};

Server.prototype.broadcast = function(data){
  this.manager.forEach(function(client){
    if(client && client._state === 4){
      client.write(data);
    }
  });
};



Server.prototype.use = function(module){
  module.call(this, this.options);
};

