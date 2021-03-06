var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const schedule = require('node-schedule');
const appRoute = require('./router');
const spiderBusiness = require('./reptile/business')
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Content-Type", "application/json");
    next();
});
appRoute(app);
// app.use('/', indexRouter);
// app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
// 方便调试
var debug = require('debug')('app:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

 var port = normalizePort(process.env.PORT || '3000');
 app.set('port', port);

 var server = http.createServer(app);

 server.listen(port);
 server.on('error', onError);
 server.on('listening', onListening);

 function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    var bind = typeof port === 'string' ?
    'Pipe ' + port :
    'Port ' + port;
    switch (error.code) {
        case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
        case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
        default:
        throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
    'pipe ' + addr :
    'port ' + addr.port;
    debug('Listening on ' + bind);
}
const time = schedule.scheduleJob('0 0 * * * *', function(fireDate) {
    spiderBusiness.news(fireDate, 5, 1, 'https://www.toutiao.com/ch/news_hot/') // 抓取5条新闻到userid=1的用户中
    spiderBusiness.news(fireDate, 5, 2, 'https://www.toutiao.com/ch/news_game/') // 抓取5条游戏新闻到userid=2的用户中
});

module.exports = app;