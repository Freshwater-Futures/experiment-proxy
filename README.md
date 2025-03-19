# Freshwater Futures Reverse Proxy

A minimal reverse proxy server that forwards requests to https://www.freshwaterfutures.com while handling Cloudflare-specific headers.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
node index.js
```

The proxy server will start on port 3000 by default. You can change the port by setting the `PORT` environment variable.

## Features

- Forwards all requests to https://www.freshwaterfutures.com
- Handles Cloudflare-specific headers
- Includes basic error handling
- Debug logging enabled for troubleshooting

## Usage

Once the server is running, you can access the proxied site at:
```
http://localhost:3000
```

## Configuration

The proxy configuration can be modified in `index.js`. Key settings include:
- `changeOrigin`: Set to true to handle cross-origin requests
- `secure`: Set to true to handle HTTPS
- `logLevel`: Set to 'debug' for detailed logging 