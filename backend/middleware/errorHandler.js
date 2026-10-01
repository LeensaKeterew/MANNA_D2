// Errors are always JSON: { ok:false, message }.
//
// "Soft errors": the MANNA frontend sends the header `X-Soft-Errors: 1`. For those
// requests an error is delivered as HTTP 200 with { ok:false, message, status } so the
// browser console stays clean (browsers log every 4xx/5xx fetch as a red console error,
// even when the app handles it, e.g. a wrong password on the login form).
// Any other client (Postman, curl, tests) gets the real HTTP status code.
function send(req, res, status, message) {
  if (req.get("X-Soft-Errors") === "1") {
    return res.status(200).json({ ok: false, message, status });
  }
  return res.status(status).json({ ok: false, message });
}

const notFoundHandler = (req, res) => send(req, res, 404, "Endpoint not found.");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") return send(req, res, 400, "Request body must be valid JSON.");
  if (err.code === "LIMIT_FILE_SIZE") return send(req, res, 400, "Image must be 5 MB or smaller.");
  if (err.name === "MulterError") return send(req, res, 400, err.message);
  if (err.code === 11000) return send(req, res, 409, "That already exists.");
  const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
  if (status === 500) console.error(err);
  return send(req, res, status, status === 500 ? "Something went wrong on the server." : err.message);
}

module.exports = { notFoundHandler, errorHandler };
