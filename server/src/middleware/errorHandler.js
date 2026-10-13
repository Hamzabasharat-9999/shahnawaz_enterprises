export function notFound(req, res) {
  res.status(404).json({ message: 'The requested API route was not found.' });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const statusCandidate = Number(err.status || err.statusCode || 500);
  const status = Number.isInteger(statusCandidate) && statusCandidate >= 400 && statusCandidate <= 599
    ? statusCandidate
    : 500;

  // Keep stack traces and database/provider details in server logs only.
  if (process.env.NODE_ENV === 'production') {
    console.error(`[API error] ${req.method} ${req.path} status=${status} name=${err.name || 'Error'}`);
  } else {
    console.error(err);
  }

  let message = 'Something went wrong on the server.';
  if (status < 500) {
    message = err.expose === false ? 'The request could not be processed.' : (err.message || 'The request could not be processed.');
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body is too large.' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body contains invalid JSON.' });
  }

  return res.status(status).json({ message });
}
