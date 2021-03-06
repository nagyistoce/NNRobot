﻿var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var mysql = require('./modules/consultas.js')
var routes = require('./routes/index');
const fs = require('fs');

var app = express();

// view engine setup
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({
    extended: false,
    parameterLimit: 10000,
    limit: 1024 * 1024 * 10
}));
app.use(bodyParser.urlencoded({
    extended: false,
    parameterLimit: 10000,
    limit: 1024 * 1024 * 10
}));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
app.set('port', 3000);
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
var spawn = require('child_process').spawn;
var proc;
var sockets = {};

io.on('connection', function (socket) {

    sockets[socket.id] = socket;
    console.log("Total clients connected : ", Object.keys(sockets).length);

    socket.on('disconnect', function () {
        delete sockets[socket.id];

        // no more sockets, kill the stream
        if (Object.keys(sockets).length == 0) {
            app.set('watchingFile', false);
            if (proc) proc.kill();
            fs.unwatchFile('./stream/image_stream.jpg');
        }
    });

    socket.on('start-stream', function () {
        w = app.get('watchingFile')
        r = startStreaming(io, 'stream/image_stream.jpg', 'liveStream',w);
        app.set('watchingFile', r);
    });

    socket.on('image_stream', function (buffer) {
        io.sockets.emit('image_stream', buffer);
    });
    socket.on('image_stream_canny', function (buffer) {
        io.sockets.emit('image_stream_canny', buffer);
    });
    socket.on('image_stream_gray', function (buffer) {
        io.sockets.emit('image_stream_gray', buffer);
    });
    socket.on('image_stream_laplacian', function (buffer) {
        io.sockets.emit('image_stream_laplacian', buffer);
    });
    socket.on('image_stream_bad', function (buffer) {
        io.sockets.emit('image_stream_bad', buffer);
    });
    socket.on('image_stream_nnet', function (buffer) {
        io.sockets.emit('image_stream_nnet', buffer);
    });
    socket.on('image_stream_best', function (buffer) {
        io.sockets.emit('image_stream_best', buffer);
    }); 
    

});

function stopStreaming() {
    if (Object.keys(sockets).length == 0) {
        app.set('watchingFile', false);
        if (proc) proc.kill();
        fs.unwatchFile('./public/stream/image_stream.jpg');
    }
}

function startStreaming(io,img,channel,isWatching) {
    if (isWatching) {
        io.sockets.emit(channel, img + '?_t=' + (Math.random() * 100000));
        return true;
    }
    console.log('starting streaming...'+channel);
    io.sockets.emit(channel, img + '?_t=' + (Math.random() * 100000));
    fs.watch('./public/stream/image_stream.jpg', function (current, previous) {
        io.sockets.emit(channel, img + '?_t=' + (Math.random() * 100000));
    })
    return true;
}

function port() {
    return app.get('port');
}

module.exports = http;
module.exports.port = port;
