var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const schedule = require('node-schedule');
const appRoute = require('./router');
const spider = require('./reptile/index');
const mode = require('./mysql/mode');
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

/**
 * Create HTTP server.
 */

 var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

 server.listen(port);
 server.on('error', onError);
 server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

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

/**
 * Event listener for HTTP server "error" event.
 */

 function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ?
  'Pipe ' + port :
  'Port ' + port;

    // handle specific listen errors with friendly messages
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

/**
 * Event listener for HTTP server "listening" event.
 */

 function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ?
  'pipe ' + addr :
  'port ' + addr.port;
  debug('Listening on ' + bind);
}



if (process.env.NODE_APP_INSTANCE === '0') {
  const time = schedule.scheduleJob('0 0 * * * *', function(fireDate) {
    (async () => {
      let list = await spider('https://www.toutiao.com/ch/news_hot/', '.title-box a')
      list = list.slice(0, 3)
      for(let i=0; i<list.length; i++){
        const result = await spider(list[i].href, 'article')
        // console.log(result[0].html)
        try {
         const moderet = await mode.Article.create({
            title: list[i].html,
            content: result[0].html,
            userId: 1,
          })
        } catch (e) {
          console.log(e)
        }
      }
    })()
    // spider('https://www.toutiao.com/ch/news_hot/', '.title-box a')
    // .then((res) => {
    //   if (res && res.length > 0) {
    //     const list = res.slice(0, 3)
    //     (async () => {
    //       list.forEach((item) => {
    //         const result = await spider(item.href, 'article')
    //         console.log(result[0].html)
    //         console.log(item.html)
    //         // mode.Article.create({
    //         //   title: item.html,
    //         //   content: data[0].html,
    //         //   userId: 1,
    //         // })
    //         // .then((data) => {})
    //         // .catch((err) => {
    //         //   console.log(err)
    //         // })
    //       })
    //     })();
    //   }
    // })
    // .catch((err) => {
    //   console.log(err)
    // })
  });
}

module.exports = app;