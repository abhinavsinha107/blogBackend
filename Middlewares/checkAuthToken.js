const jwt = require("jsonwebtoken");

function checkAuth(req, res, next) {
  // console.log(req.query);

  const authToken = req.cookies.authToken || req.query.authToken;
  const refreshToken = req.cookies.refreshToken || req.query.refreshToken;
  // const authToken = req.query.authToken;
  // const refreshToken = req.query.refreshToken;

  // console.log("Check Auth Token MIDDLEWARE CALLED", authToken);

  if (!authToken || !refreshToken) {
    return res.status(401).json({
      message: "Authentication failed: No authToken or refreshToken provided",
      ok: false
    });
  }

  jwt.verify(authToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      // Auth token has expired, check the refresh token
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (refreshErr, refreshDecoded) => {
          // Both tokens are invalid, send an error message and prompt for login
          if (refreshErr) {
            // Both tokens are invalid, send an error message and prompt for login
            return res.status(401).json({
              message: "Authentication failed: Both tokens are invalid",
              ok: false,
            });
          } else {
            // Generate new auth and refresh tokens
            const newAuthToken = jwt.sign(
              { userId: refreshDecoded.userId },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "40m" }
            );
            const newRefreshToken = jwt.sign(
              { userId: refreshDecoded.userId },
              process.env.REFRESH_TOKEN_SECRET,
              { expiresIn: "10d" }
            );

            // Set the new tokens as cookies in the response
            res.cookie("authToken", newAuthToken, { httpOnly: true });
            res.cookie("refreshToken", newRefreshToken, { httpOnly: true });

            // Continue processing the request with the new auth token
            req.userId = refreshDecoded.userId;
            req.ok = true;
            next();
          }
        }
      );
    } else {
      req.userId = decoded.userId;
      next();
    }
  });
}

module.exports = checkAuth;
