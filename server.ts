import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createProxyMiddleware, responseInterceptor } from "http-proxy-middleware";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY;

  app.use(express.json());

  // Watchmode API Routes
  app.get("/api/movies/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) return res.status(400).json({ error: "Query is required" });
      
      const response = await axios.get(`https://api.watchmode.com/v1/search/`, {
        params: {
          apiKey: WATCHMODE_API_KEY,
          search_field: "name",
          search_value: query,
          types: "movie"
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error("Watchmode Search Error:", error);
      res.status(500).json({ error: "Failed to fetch movies" });
    }
  });

  app.get("/api/movies/trending", async (req, res) => {
    try {
      const response = await axios.get(`https://api.watchmode.com/v1/list-titles/`, {
        params: {
          apiKey: WATCHMODE_API_KEY,
          limit: 20,
          types: "movie",
          sort_by: "popularity_desc"
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error("Watchmode Trending Error:", error);
      res.status(500).json({ error: "Failed to fetch trending movies" });
    }
  });

  app.get("/api/movies/:id/details", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await axios.get(`https://api.watchmode.com/v1/title/${id}/details/`, {
        params: {
          apiKey: WATCHMODE_API_KEY,
          append_to_response: "sources"
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error("Watchmode Details Error:", error);
      res.status(500).json({ error: "Failed to fetch movie details" });
    }
  });

  // Shared Ad Blocker Script
  const AD_BLOCKER_SCRIPT = `
    <script>
      (function() {
        // Block Popups
        window.open = function() { console.log('Blocked popup'); return { focus: () => {}, close: () => {}, closed: true }; };
        window.alert = () => {};
        window.confirm = () => true;
        window.prompt = () => null;

        // Block common ad domains
        const AD_PATTERNS = [
          'googlesyndication.com', 'doubleclick.net', 'adnxs.com', 'adform.net',
          'adservice.google', 'analytics.google.com', 'facebook.net', 'amazon-adsystem.com',
          'popads.net', 'propellerads.com', 'exoclick.com', 'juicyads.com',
          'onclickads.net', 'ad-maven.com', 'mobicow.com', 'popcash.net',
          'yandex.ru', 'mail.ru', 'bet365', 'casino', 'poker', 'betting',
          'a.bestcontentfood.top', 'clksite.com', 'fastclick.net', 'ad-delivery.net',
          'ad-score.com', 'ad-speed.com', 'ad-target.com', 'ad-up.com'
        ];

        function isAd(url) {
          if (!url) return false;
          const urlStr = String(url).toLowerCase();
          return AD_PATTERNS.some(pattern => urlStr.includes(pattern));
        }

        // Hide ad elements
        const style = document.createElement('style');
        style.textContent = \`
          iframe[src*="ads"], iframe[id*="ads"], div[class*="ads-"], div[id*="ads-"],
          .ad-container, .ad-wrapper, .ad-banner, .ad-slot, .ad-box,
          [id^="ad-"], [class^="ad-"], [id*="-ad-"], [class*="-ad-"],
          .popunder, .popup-ad, .overlay-ad, .floating-ad,
          ins.adsbygoogle, div[id^="google_ads_"],
          .mgid-ad, .taboola-ad, .outbrain-ad,
          #disqus_thread, .video-ads, .ytp-ad-progress-list,
          [class*="premium-ad"], [id*="premium-ad"],
          .ads-section, #ads-section, .sponsored-content,
          [data-ad-client], [data-ad-slot],
          #overlay, .overlay, .modal-ad, .fixed-ad
          { display: none !important; visibility: hidden !important; height: 0 !important; width: 0 !important; pointer-events: none !important; opacity: 0 !important; }
        \`;
        document.head.appendChild(style);

        // Intercept dynamic elements
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName, options) {
          const el = originalCreateElement.call(this, tagName, options);
          const tag = tagName.toLowerCase();
          if (tag === 'script' || tag === 'iframe') {
            const attr = 'src';
            const descriptor = Object.getOwnPropertyDescriptor(el.constructor.prototype, attr) || 
                             Object.getOwnPropertyDescriptor(HTMLElement.prototype, attr);
            if (descriptor && descriptor.set) {
              Object.defineProperty(el, attr, {
                set: function(val) {
                  if (isAd(val)) {
                    console.log('Blocked dynamic ad:', tag, val);
                    if (tag === 'script') return;
                    val = 'about:blank';
                  }
                  descriptor.set.call(this, val);
                },
                get: function() { return descriptor.get.call(this); },
                configurable: true
              });
            }
          }
          return el;
        };

        // Prevent new tabs on clicks
        document.addEventListener('click', function(e) {
          const target = e.target.closest('a');
          if (target && (target.target === '_blank' || target.target === 'blank')) {
            target.target = '_self';
          }
        }, true);

        // Periodically check for and remove ads
        setInterval(() => {
          document.querySelectorAll('iframe').forEach(iframe => {
            if (isAd(iframe.src)) iframe.remove();
          });
        }, 2000);
      })();
    </script>
  `;

  // Proxy to bypass X-Frame-Options and fix relative paths
  const onoflixProxy = createProxyMiddleware({
    target: 'https://onoflix.live',
    changeOrigin: true,
    secure: false,
    followRedirects: true,
    selfHandleResponse: true,
    ws: true, // Enable WebSocket proxying
    pathRewrite: {
      '^/proxy-onoflix': '',
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        proxyReq.setHeader('referer', 'https://onoflix.live/');
        proxyReq.setHeader('accept-encoding', 'identity');
      },
      proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        // Remove security headers
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        res.removeHeader('Frame-Options');
        res.removeHeader('content-security-policy-report-only');

        // Rewrite Set-Cookie headers to remove Domain and Secure if needed
        const setCookie = proxyRes.headers['set-cookie'];
        if (setCookie) {
          res.setHeader('set-cookie', setCookie.map(cookie => 
            cookie.replace(/Domain=[^;]+;?/i, '')
                  .replace(/Secure;?/i, '')
                  .replace(/SameSite=[^;]+;?/i, 'SameSite=None')
          ));
        }

        const contentType = proxyRes.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
          let html = responseBuffer.toString('utf8');
          
          // Inject script to intercept all requests and redirect them to our proxy
          const injection = AD_BLOCKER_SCRIPT;
          
          // Replace paths in the HTML
          html = html.replace(/(src|href|action)=["']\/(?!\/)/g, '$1="' + '/proxy-onoflix/');
          
          // Replace absolute URLs to the target domain
          const domainRegex = /https?:\/\/(www\.)?onoflix\.live/gi;
          html = html.replace(domainRegex, '/proxy-onoflix');
          
          html = html.replace('<head>', '<head>' + injection);
          
          return html;
        }
        return responseBuffer;
      }),
    },

  });

  app.use('/proxy-onoflix', onoflixProxy);

  // Generic Movie Proxy for vidsrc and others
  const movieProxy = createProxyMiddleware({
    target: 'https://vidsrc.to',
    changeOrigin: true,
    secure: false,
    followRedirects: true,
    selfHandleResponse: true,
    router: (req) => {
      const url = new URL(req.url || '', 'http://localhost');
      const targetHost = url.searchParams.get('host') || 'vidsrc.to';
      return `https://${targetHost}`;
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        const url = new URL(req.url || '', 'http://localhost');
        const targetHost = url.searchParams.get('host') || 'vidsrc.to';
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        proxyReq.setHeader('referer', `https://${targetHost}/`);
      },
      proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        
        const contentType = proxyRes.headers['content-type'];
        if (contentType && contentType.includes('text/html')) {
          let html = responseBuffer.toString('utf8');
          
          const injection = AD_BLOCKER_SCRIPT;
          return html.replace('<head>', '<head>' + injection);
        }
        return responseBuffer;
      })
    }
  });

  app.use('/proxy-movie', movieProxy);

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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Handle WebSocket upgrades
  server.on('upgrade', (req, socket, head) => {
    if (req.url?.startsWith('/proxy-onoflix')) {
      (onoflixProxy as any).upgrade(req, socket, head);
    }
  });
}

startServer();
