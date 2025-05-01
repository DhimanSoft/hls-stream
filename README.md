# HLS Streaming Server

A simple HTTP Live Streaming (HLS) server built with Node.js and Express that serves video content using the HLS protocol.

## Features

- Dynamic HLS playlist generation
- CORS support for cross-origin requests
- Supports .m3u8 playlist and .ts segment files
- Health check endpoint
- Secure streaming with SSL/TLS support

## Prerequisites

- Node.js (v14 or higher)
- FFmpeg (for converting videos to HLS format)

## Installation

1. Clone the repository:

   Windows Server:
```bash
git clone https://github.com/DhimanSoft/hls-stream.git
cd test-hls
```
   Ubuntu/Mac Server:
```bash
git clone git@github.com:DhimanSoft/hls-stream.git
cd test-hls
```

2. Install dependencies:
```bash
npm install
```

3. Create the streams directory:
```bash
mkdir streams
```

## Configuration

1. SSL/TLS certificates are required and should be placed in the root directory:
- `test-hls.test.pem` (certificate)
- `test-hls.test-key.pem` (private key)

2. CORS configuration is set to allow requests from `https://yourdomain.com`

## Usage

1. Convert your video to HLS format:
```bash
ffmpeg -i input.mp4 \
  -profile:v baseline \
  -level 3.0 \
  -start_number 0 \
  -hls_time 10 \
  -hls_list_size 0 \
  -f hls \
  streams/stream.m3u8
```

2. Start the server:
```bash
node server.js
```

The server will start on port 8000.

## API Endpoints

- `GET /` - Health check endpoint
- `GET /streams/:file` - Serve HLS content (.m3u8 and .ts files)

## Client Implementation

```html
<video id="video" controls width="640"></video>
<script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
<script>
  const video = document.getElementById('video');
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource('http://localhost:8000/streams/stream.m3u8');
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = 'http://localhost:8000/streams/stream.m3u8';
  }
</script>
```

## Directory Structure

```
test-hls/
├── server.js           # Main server implementation
├── streams/            # Directory for HLS content
│   ├── stream.m3u8    # HLS playlist file
│   └── *.ts           # Video segments
├── index.html         # Example player implementation
└── README.md          # This file
```

## License

[MIT](LICENSE)
