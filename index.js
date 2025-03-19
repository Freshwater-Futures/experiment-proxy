const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const zlib = require('zlib');

const app = express();
const port = process.env.PORT || 3000;

// Proxy configuration
const proxyOptions = {
  target: 'https://www.telstrasuper.com.au/',
  changeOrigin: true,
  secure: true,
  selfHandleResponse: true, // Handle the response ourselves
  // Handle responses
  onProxyRes: function(proxyRes, req, res) {
    // Remove Cloudflare-specific headers that might cause issues
    delete proxyRes.headers['cf-ray'];
    delete proxyRes.headers['cf-cache-status'];
    delete proxyRes.headers['cf-request-id'];

    const contentEncoding = proxyRes.headers['content-encoding'];
    const contentType = proxyRes.headers['content-type'];
    
    let chunks = [];
    
    proxyRes.on('data', chunk => chunks.push(chunk));
    
    proxyRes.on('end', () => {
      let body = Buffer.concat(chunks);
      
      // Handle gzipped content
      if (contentEncoding === 'gzip') {
        body = zlib.gunzipSync(body);
      } else if (contentEncoding === 'br') {
        body = zlib.brotliDecompressSync(body);
      } else if (contentEncoding === 'deflate') {
        body = zlib.inflateSync(body);
      }

      // Convert to string if it's HTML
      if (contentType && contentType.includes('text/html')) {
        body = body.toString('utf8');

        // Check if this is the claims page
        if (req.url.includes('how-to-make-a-claim')) {
          // Define the button HTML with styles
          const buttonHtml = `
            <div style="
              margin: 20px 0;
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
              text-align: center;
            ">
              <button onclick="initiateClaimProcess()" style="
                padding: 15px 30px;
                font-size: 24px;
                font-weight: bold;
                color: white;
                background-color: #007bff;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
              ">
                Initiate Claim
              </button>
            </div>
            <script>
              function initiateClaimProcess() {
                alert('Initiating claim process...');
                // Add your claim process logic here
              }
            </script>
          `;

          // Insert the button after any opening tag with id="main"
          body = body.replace(
            /<[^>]+\bid="main"[^>]*>/i,
            match => `${match}${buttonHtml}`
          );
        }
      }

      // Set appropriate headers
      res.set('Content-Type', contentType);
      if (!contentEncoding) {
        res.removeHeader('Content-Encoding');
      }
      res.set('Content-Length', Buffer.byteLength(body));
      
      res.end(body);
    });
  },
  // Log proxy events for debugging
  logLevel: 'debug'
};

// Create the proxy middleware
const proxy = createProxyMiddleware(proxyOptions);

// Use the proxy middleware for all routes
app.use('/', proxy);

// Error handling
app.use((err, req, res, next) => {
  console.error('Proxy Error:', err);
  res.status(500).send('Proxy Error');
});

app.listen(port, () => {
  console.log(`Reverse proxy server running on http://localhost:${port}`);
}); 