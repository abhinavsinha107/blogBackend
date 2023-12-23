const jwt = require("jsonwebtoken");

function checkAuth(req, res, next) {
  // get auth and refresh tokens from cookies and if they don't exist return error
  // check expiry of authToken, if auth token is not expired all is well exit function
  // check expiry of refreshToken, if refresh token is expired then ask for re-login
  // if refresh token is not expired but auth token is expired then regenerate both tokens

  const authToken = req.cookies.authToken;
  const refreshToken = req.cookies.refreshToken;

  console.log("Check Auth Token MIDDLEWARE CALLED", authToken);

  if (!authToken || !refreshToken) {
    return res.status(401).json({
      message: "Authentication failed: No authToken or refreshToken provided",
    });
  }

  jwt.verify(authToken, process.env.JWT_SECRET_KEY, (err, decoded) => {
    // expired or not expired
    if (err) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (refreshErr, refreshDecoded) => {
          // refresh token is expired and access token is expired
          if (refreshErr) {
            // Both tokens are invalid, send an error message and prompt for login
            return res.status(401).json({
              message: "Authentication failed: Both tokens are invalid",
            });
          // refresh not expired and access token is expired
          } else {
            // Generate new auth and refresh tokens
            const newAuthToken = jwt.sign(
              { userId: refreshDecoded.userId },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "10m" }
            );
            const newRefreshToken = jwt.sign(
              { userId: refreshDecoded.userId },
              process.env.REFRESH_TOKEN_SECRET,
              { expiresIn: "40m" }
            );

            // Set the new tokens as cookies in the response
            res.cookie("authToken", newAuthToken, { httpOnly: true });
            res.cookie("refreshToken", newRefreshToken, { httpOnly: true });

            // Continue processing the request with the new auth token
            req.userId = refreshDecoded.userId;
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
