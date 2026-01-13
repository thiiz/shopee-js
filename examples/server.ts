import { serve } from "bun";

// Disable SSL verification for development proxy to avoid ERR_TLS_CERT_ALTNAME_INVALID
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const PROXY_TARGET = "https://openplatform.sandbox.test-stable.shopee.sg";

const server = serve({
  port: 8080,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // 1. Proxy API requests
    if (path.startsWith("/api/v2")) {
      const targetUrl = `${PROXY_TARGET}${path}${url.search}`;
      console.log(`[Proxy] ${req.method} ${targetUrl}`);
      
      try {
        // Create new headers and override Host to match target
        const headers = new Headers(req.headers);
        headers.set("Host", new URL(PROXY_TARGET).host);

        const proxyReq = new Request(targetUrl, {
          method: req.method,
          headers,
          body: req.body,
        });

        const response = await fetch(proxyReq);
        
        // Add CORS headers to response
        const newHeaders = new Headers(response.headers);
        newHeaders.set("Access-Control-Allow-Origin", "*");
        newHeaders.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        newHeaders.set("Access-Control-Allow-Headers", "Content-Type");

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });

      } catch (err) {
        console.error("Proxy Error:", err);
        return new Response(JSON.stringify({ error: "Proxy Error" }), { status: 500 });
      }
    }

    // 2. Serve Static Files
    let filePath = "." + path;
    if (path === "/") filePath = "./examples/index.html";
    else if (path.startsWith("/examples/")) filePath = "." + path; // already correct
    else if (path.startsWith("/dist/")) filePath = "." + path;
    else filePath = "./examples" + path; // fallback for style.css, app.js if requested at root

    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file);
    }
    
    // Try looking in root if not found (for package.json etc if needed)
    const rootFile = Bun.file("." + path);
    if (await rootFile.exists()) {
        return new Response(rootFile);
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
console.log(`Proxying API requests to ${PROXY_TARGET}`);
