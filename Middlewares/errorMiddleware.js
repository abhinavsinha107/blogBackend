function errorHandler(err, req, res, next) {
  console.error(err.stack);

  if (res.headersSent) {
    return next(err);
  }

  console.log("ERROR MIDDLEWARE CALLED");
  res.status(statusCode || 500).json({
    ok: false,
    message: err.message
  });
}

module.exports = errorHandler;
