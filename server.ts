import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createProxyMiddleware, responseInterceptor } from "http-proxy-middleware";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy to bypass X-Frame-Options and fix relative paths
  app.use('/proxy-onoflix', createProxyMiddleware({
    target: 'https://onoflix.live',
    changeOrigin: true,
    secure: false,
    followRedirects: true,
    selfHandleResponse: true, // Necessary for interceptor
    pathRewrite: {
      '^/proxy-onoflix': '',
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        proxyReq.setHeader('referer', 'https://onoflix.live/');
        proxyReq.setHeader('accept-encoding', 'identity'); // Disable compression for easier string replacement
      },
      proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        // Remove security headers
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        res.removeHeader('Frame-Options');

        const contentType = proxyRes.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
          let html = responseBuffer.toString('utf8');
          // Inject <base> tag to fix relative paths
          html = html.replace('<head>', '<head><base href="https://onoflix.live/">');
          return html;
        }
        return responseBuffer;
      }),
    }
  }));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
