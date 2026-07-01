const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || '伺服器內部錯誤',
  });
};

module.exports = { errorHandler };
