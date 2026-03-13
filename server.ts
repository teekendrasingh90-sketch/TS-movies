import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createProxyMiddleware, responseInterceptor } from "http-proxy-middleware";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Comprehensive list of ad and tracking domains - using a Set for O(1) lookup
  const blockedDomains = new Set([
    'effectivegatecpm.com',
    'doubleclick.net',
    'googleadservices.com',
    'googlesyndication.com',
    'adnxs.com',
    'adform.net',
    'openx.net',
    'pubmatic.com',
    'rubiconproject.com',
    'casalemedia.com',
    'criteo.com',
    'taboola.com',
    'outbrain.com',
    'popads.net',
    'popcash.net',
    'onclickads.net',
    'ad-maven.com',
    'propellerads.com',
    'juicyads.com',
    'exoclick.com',
    'adservice.google.com',
    'adservice.google.co.in',
    'analytics.google.com',
    'click.googleanalytics.com',
    'stats.g.doubleclick.net',
    'ad.doubleclick.net',
    'mads.amazon-adsystem.com',
    'aax.amazon-adsystem.com',
    'ad.yieldlab.net',
    'adserver.adtech.de',
    'pixel.rubiconproject.com',
    'optimized-by.rubiconproject.com',
    'ads.pubmatic.com',
    'ib.adnxs.com',
    'secure.adnxs.com',
    'static.ads-twitter.com',
    'ads-api.twitter.com',
    'connect.facebook.net',
    'pixel.facebook.com',
    'ads.linkedin.com',
    'analytics.twitter.com',
    'ads.pinterest.com',
    'logx.optimizely.com',
    'dpm.demdex.net',
    'everesttech.net',
    'omtrdc.net',
    'scorecardresearch.com',
    'quantserve.com',
    'pixel.ads.target.com',
    'ads.yahoo.com',
    'analytics.yahoo.com',
    'gemini.yahoo.com',
    'ad.mail.ru',
    'an.yandex.ru',
    'mc.yandex.ru',
    'yandexmetrica.com',
    'hotjar.com',
    'crazyegg.com',
    'mixpanel.com',
    'amplitude.com',
    'segment.io',
    'intercom.io',
    'fullstory.com',
    'logrocket.com',
    'sentry.io',
    'bugsnag.com',
    'newrelic.com',
    'datadoghq.com',
    'bet365.com',
    '1xbet.com',
    'mostbet.com',
    'melbet.com',
    'parimatch.com',
    'linebet.com',
    '22bet.com',
    '888.com',
    'pokerstars.com',
    'williamhill.com',
    'ladbrokes.com',
    'coral.co.uk',
    'betfair.com',
    'paddypower.com',
    'skybet.com',
    'unibet.com',
    'bwin.com',
    'sportingbet.com',
    'betway.com',
    'betvictor.com',
    'betfred.com',
    'boylesports.com',
    'mansionbet.com',
    'netbet.com',
    'titanbet.com',
    'winner.com',
    'eurogrand.com',
    '777.com',
    '888casino.com',
    '888poker.com',
    '888sport.com',
    'casumo.com',
    'leovegas.com',
    'mrgreen.com',
    'rizk.com',
    'guts.com',
    'thrills.com',
    'kaboo.com',
    'superlenny.com',
    'betit.com',
    'mtsecuretrade.com',
    'giigames.com',
    'gaminginnovationgroup.com',
    'everymatrix.com',
    'softswiss.com',
    'betconstruct.com',
    'digitain.com',
    'sbtech.com',
    'kambi.com',
    'openbet.com',
    'scientificgames.com',
    'igt.com',
    'novomatic.com',
    'playtech.com',
    'microgaming.co.uk',
    'netent.com',
    'evolutiongaming.com',
    'pragmaticplay.com',
    'yggdrasilgaming.com',
    'quickspin.com',
    'redtiger.com',
    'blueprintgaming.com',
    'ashgaming.com',
    'wms.com',
    'ballytech.com',
    'aristocrat.com',
    'konami.com',
    'ainsworth.com.au',
    'gtech.com',
    'spielo.com',
    'vgt.net',
    'cadillacjack.com',
    'incredibletechnologies.com',
    'agst.com',
    'everi.com',
    'interblockgaming.com',
    'alfastreet.si',
    'amatic.com',
    'egt-interactive.com',
    'endorphina.com',
    'gameart.net',
    'habanerosystems.com',
    'isoftbet.com',
    'platipusgaming.com',
    'spinomenal.com',
    'tomhorn.eu',
    'wazdan.com',
    'belatragames.com',
    'bgaming.com',
    'booming-games.com',
    'evoplay.games',
    'fugaso.com',
    'irondogstudio.com',
    'kalambagames.com',
    'nolimitcity.com',
    'pgsoft.com',
    'pushgaming.com',
    'relax-gaming.com',
    'stakelogic.com',
    'thunderkick.com',
    'truelab.games'
  ]);

  // Proxy to bypass X-Frame-Options and fix relative paths
  const movieProxy = createProxyMiddleware({
    target: 'https://themoviebox.org',
    changeOrigin: true,
    secure: false,
    followRedirects: true,
    selfHandleResponse: true,
    ws: true,
    proxyTimeout: 15000,
    timeout: 15000,
    on: {
      proxyReq: (proxyReq, req, res) => {
        const url = req.url || '';
        
        // Dynamic target handling for movie players
        if (req.query && req.query.remote_url) {
          const remoteUrl = req.query.remote_url as string;
          try {
            const parsed = new URL(remoteUrl);
            proxyReq.path = parsed.pathname + parsed.search;
            proxyReq.setHeader('host', parsed.host);
          } catch (e) {}
        }

        // Allow all images and media from the target domain or common CDNs
        const isMedia = /\.(jpg|jpeg|png|gif|webp|svg|mp4|m3u8|ts)$/i.test(url);
        
        // Extract domain for faster lookup
        try {
          const urlObj = new URL(url, 'https://themoviebox.org');
          const hostname = urlObj.hostname.replace('www.', '');
          
          // If it's media from the main domain, don't block it even if it matches keywords
          if (hostname === 'themoviebox.org' && isMedia) {
            // Let it pass
          } else if (blockedDomains.has(hostname)) {
            proxyReq.destroy();
            return;
          }
        } catch (e) {
          if ([...blockedDomains].some(domain => url.includes(domain)) && !isMedia) {
            proxyReq.destroy();
            return;
          }
        }

        const adKeywords = ['/ad-server/', '/popunder', '/popup', '/click-track', '/tracking'];
        if (adKeywords.some(keyword => url.toLowerCase().includes(keyword)) && !isMedia) {
          proxyReq.destroy();
          return;
        }

        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        proxyReq.setHeader('Origin', 'https://themoviebox.org');
        proxyReq.setHeader('Referer', 'https://themoviebox.org/');
        proxyReq.setHeader('Accept', '*/*');
      },
      proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        res.removeHeader('X-Frame-Options');
        res.removeHeader('Content-Security-Policy');
        res.removeHeader('Frame-Options');
        res.removeHeader('content-security-policy-report-only');

        const setCookie = proxyRes.headers['set-cookie'];
        if (setCookie) {
          res.setHeader('set-cookie', setCookie.map(cookie => 
            cookie.replace(/Domain=[^;]+;?/i, '')
                  .replace(/Secure;?/i, '')
                  .replace(/SameSite=[^;]+;?/i, 'SameSite=None')
          ));
        }

        const contentType = proxyRes.headers['content-type'] || '';
        if (contentType.includes('text/html')) {
          let html = responseBuffer.toString('utf8');
          
          const injection = `
            <style>
              iframe[src*="ads"], iframe[src*="doubleclick"], div[id*="ad-"], div[class*="ad-"], 
              div[id*="google_ads"], div[class*="google_ads"], ins.adsbygoogle, .ad-container,
              .ads-container, #ad-container, #ads-container, .popunder, .popup-ad,
              [id^="ad-"], [class^="ad-"], [id*="popunder"], [class*="popunder"] {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
              }
            </style>
            <script>
              (function() {
                // Aggressive Anti-Frame-Break
                const blockTopNav = () => {
                  window.onbeforeunload = function() {
                    return "Are you sure?"; // This blocks automatic redirects
                  };
                  
                  // Neutralize top and parent
                  Object.defineProperty(window, 'top', { get: function() { return window.self; } });
                  Object.defineProperty(window, 'parent', { get: function() { return window.self; } });
                  
                  // Intercept location changes
                  const originalLocation = window.location;
                  // Note: We can't fully override window.location, but we can intercept clicks
                };
                blockTopNav();

                // Block popups and window.open
                window.open = function() { return { focus: () => {}, close: () => {} }; };

                const PROXY_PREFIX = '/proxy-movie';
                const TARGET_DOMAIN = 'themoviebox.org';
                const BLOCKED_DOMAINS = ${JSON.stringify([...blockedDomains])};

                function wrapUrl(url) {
                  if (!url || typeof url !== 'string') return url;
                  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('javascript:')) return url;
                  
                  // Handle srcset
                  if (url.includes(',') && (url.includes(' w') || url.includes(' x'))) {
                    return url.split(',').map(part => {
                      const [u, size] = part.trim().split(/\s+/);
                      return wrapUrl(u) + (size ? ' ' + size : '');
                    }).join(', ');
                  }

                  // Ad blocker
                  if (BLOCKED_DOMAINS.some(domain => url.includes(domain))) return 'about:blank';
                  
                  if (url.startsWith(PROXY_PREFIX)) return url;
                  
                  try {
                    const u = new URL(url, window.location.href);
                    
                    // If it's a movie player domain (like vidsrc), wrap it specially
                    const moviePlayerDomains = ['vidsrc.to', 'vidsrc.me', '2embed.to', 'embed.su'];
                    if (moviePlayerDomains.some(d => u.hostname.includes(d))) {
                      return PROXY_PREFIX + '?remote_url=' + encodeURIComponent(url);
                    }

                    if (u.hostname === TARGET_DOMAIN || u.hostname.endsWith('.' + TARGET_DOMAIN)) {
                      return PROXY_PREFIX + u.pathname + u.search + u.hash;
                    }
                    if (u.origin === window.location.origin && !u.pathname.startsWith(PROXY_PREFIX)) {
                      return PROXY_PREFIX + u.pathname + u.search + u.hash;
                    }
                  } catch(e) {}
                  return url;
                }

                // Intercept Navigation
                window.addEventListener('click', e => {
                  const link = e.target.closest('a');
                  if (link && link.href) {
                    // Force navigation to stay in current frame
                    link.target = '_self';
                    
                    const wrapped = wrapUrl(link.href);
                    if (wrapped !== link.href) {
                      link.href = wrapped;
                    }
                  }
                }, true);

                // MutationObserver to fix dynamic links
                const observer = new MutationObserver(mutations => {
                  mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                      if (node.nodeType === 1) {
                        const links = node.querySelectorAll('a');
                        links.forEach(l => {
                          if (l.href) l.href = wrapUrl(l.href);
                          l.target = '_self';
                        });
                      }
                    });
                  });
                });
                observer.observe(document.documentElement, { childList: true, subtree: true });

                // Intercept Forms
                window.addEventListener('submit', e => {
                  const form = e.target;
                  if (form.action) {
                    form.action = wrapUrl(form.action);
                  }
                }, true);

                // Intercept Fetch/XHR
                const originalFetch = window.fetch;
                window.fetch = function(input, init) {
                  if (typeof input === 'string') input = wrapUrl(input);
                  else if (input instanceof Request) input = new Request(wrapUrl(input.url), input);
                  return originalFetch.call(this, input, init);
                };

                const originalOpen = XMLHttpRequest.prototype.open;
                XMLHttpRequest.prototype.open = function(method, url, ...args) {
                  return originalOpen.call(this, method, wrapUrl(url), ...args);
                };

                // Intercept History
                const originalPushState = history.pushState;
                history.pushState = function(state, title, url) {
                  return originalPushState.call(this, state, title, wrapUrl(url));
                };
                const originalReplaceState = history.replaceState;
                history.replaceState = function(state, title, url) {
                  return originalReplaceState.call(this, state, title, wrapUrl(url));
                };

                // Intercept Element Creation
                const originalCreateElement = document.createElement;
                document.createElement = function(tagName, options) {
                  const el = originalCreateElement.call(this, tagName, options);
                  const tag = tagName.toLowerCase();
                  const attrs = {
                    'img': 'src', 'script': 'src', 'iframe': 'src', 
                    'link': 'href', 'source': 'src', 'video': 'src', 
                    'audio': 'src', 'form': 'action', 'a': 'href'
                  };
                  
                  if (attrs[tag]) {
                    const attr = attrs[tag];
                    const descriptor = Object.getOwnPropertyDescriptor(el.constructor.prototype, attr) || 
                                     Object.getOwnPropertyDescriptor(HTMLElement.prototype, attr);
                    if (descriptor && descriptor.set) {
                      Object.defineProperty(el, attr, {
                        set: function(val) { descriptor.set.call(this, wrapUrl(val)); },
                        get: function() { return descriptor.get.call(this); },
                        configurable: true
                      });
                    }
                  }
                  return el;
                };

                setInterval(() => {
                  ['iframe[src*="ads"]', 'iframe[src*="doubleclick"]', 'ins.adsbygoogle', '.ad-container', '.ads-container', '#ad-container', '#ads-container', '.popunder', '.popup-ad']
                  .forEach(s => document.querySelectorAll(s).forEach(el => el.remove()));
                }, 2000);
              })();
            </script>
          `;
          
          // Advanced HTML Rewriting
          // 1. Rewrite root-relative paths
          html = html.replace(/(src|href|action|data-src|data-href)=["']\/(?!\/)/g, '$1="/proxy-movie/');
          
          // 2. Rewrite srcset
          html = html.replace(/srcset=["']([^"']+)["']/g, (match, srcset) => {
            const rewritten = srcset.split(',').map((part: string) => {
              const trimmed = part.trim();
              if (trimmed.startsWith('/')) return '/proxy-movie' + trimmed;
              return trimmed;
            }).join(', ');
            return `srcset="${rewritten}"`;
          });

          // 3. Rewrite absolute URLs to the target domain
          const domainRegex = /https?:\/\/(www\.)?themoviebox\.org/gi;
          html = html.replace(domainRegex, '/proxy-movie');
          
          // 3. Inject our script
          html = html.replace('<head>', '<head>' + injection);
          
          return html;
        }
        return responseBuffer;
      }),
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
    if (req.url?.startsWith('/proxy-movie')) {
      (movieProxy as any).upgrade(req, socket, head);
    }
  });
}

startServer();
