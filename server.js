// Description: This script sets up an HTTP server that serves HLS (HTTP Live Streaming) content.
const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8000;
const STREAM_DIR = path.join(__dirname, 'streams');

// // CORS configuration
// app.use(cors(/*{
//     origin: '*', // Allow all origins
//     methods: ['GET', 'HEAD', 'OPTIONS'],
//     allowedHeaders: ['*'],
//     credentials: true
// })*/));

const allowedOrigins = ['https://test-hls.local', 'https://localhost:8000', 'http://localhost:8000'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Serve dynamic HLS playlist
app.get('/streams/:file', async (req, res) => {
    const requestedFile = req.params.file;
    const filePath = path.join(STREAM_DIR, requestedFile);

    if (requestedFile.endsWith('.m3u8')) {
        try {
            // Read all segment files in the stream directory
            const files = await fs.promises.readdir(STREAM_DIR);
            const segments = files
                .filter(f => f.endsWith('.ts'))
                .sort(); // Optional: ensure alphabetical (and likely chronological) order

            if (segments.length === 0) {
                return res.status(404).send('No segments available');
            }

            // Build dynamic playlist
            const playlistLines = [
                '#EXTM3U',
                '#EXT-X-VERSION:3',
                '#EXT-X-TARGETDURATION:10',
                '#EXT-X-MEDIA-SEQUENCE:0'
            ];

            for (const segment of segments) {
                playlistLines.push('#EXTINF:10.0,');
                playlistLines.push(segment);
            }

            playlistLines.push('#EXT-X-ENDLIST');

            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            res.send(playlistLines.join('\n'));
        } catch (err) {
            console.error('Error generating playlist:', err);
            res.status(500).send('Error generating playlist');
        }
        return;
    }

    // Serve .ts segment files
    if (requestedFile.endsWith('.ts')) {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                return res.status(404).send('Segment not found');
            }

            res.setHeader('Content-Type', 'video/MP2T');
            fs.createReadStream(filePath).pipe(res);
        });
        return;
    }

    res.status(404).send('File not found');
});

// Health check
app.get('/', (req, res) => {
    res.send('HLS Server Running');
});

app.listen(PORT, () => {
    console.log(`HLS server running on port ${PORT}`);
});
