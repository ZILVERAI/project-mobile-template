const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Force HTTPS in URLs
      req.headers['x-forwarded-proto'] = 'https';
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
