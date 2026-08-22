const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

/* Verifies the "Authorization: Bearer <token>" header.
   On success, attaches { id, name, email } to req.user. */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Missing or invalid Authorization header." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = { id: payload.id, name: payload.name, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = { requireAuth, signToken, JWT_SECRET };
