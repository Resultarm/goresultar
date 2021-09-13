const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://149.56.141.219:3000/",
      changeOrigin: true,
    })
  );
  app.use(
    "/uploads",
    createProxyMiddleware({
      target: "http://149.56.141.219:3000/",
      changeOrigin: true,
      pathRewrite: {
        "^/uploads": "/api/products/serve",
      },
    })
  );
  app.use(
    "/assets",
    createProxyMiddleware({
      target: "http://149.56.141.219:3000/",
      changeOrigin: true,
      pathRewrite: {
        "^/assets": "/api/assets",
      },
    })
  );
};
