const express = require('express');
const path = require('path');
const app = express();



const outputDir = path.resolve(__dirname, 'hls'); // Directory where HLS files will be saved
// Serve the HLS files through Express
app.use('/hls', express.static(outputDir));

// Serve the HTML file with the video player
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>HLS Video Streaming</title>
    </head>
    <body>
        <h1>HLS Video Streaming </h1>
        <video id="video" controls width="640" height="360" autoplay muted></video>
        <br>
         <div class="error-message" id="error-message" style="display:none;">
        Your browser does not support HLS streaming. Please try using a different browser.
    </div>
        <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
        <script>
        const errorMessage = document.getElementById('error-message');
          if (Hls.isSupported()) {
            const video = document.getElementById('video');
              const hls = new Hls();
            hls.loadSource('/hls/master.m3u8');
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                video.play();
            });
            // Add error handling
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    switch(data.fatal) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error("Network error encountered.");
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error("Media error encountered.");
                            break;
                        case Hls.ErrorTypes.OTHER_ERROR:
                            console.error("Other error encountered.");
                            break;
                    }
                }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
           console.log("into else block")
            video.src = '/hls/master.m3u8';
            video.addEventListener('loadedmetadata', function() {
              video.play();
            });
          }
            else {
            // Display error message if neither HLS.js nor native HLS is supported
            errorMessage.style.display = 'block';
        }
        </script>
        <h1>Normal video player </h1>
        <video id="videonormal" controls width="640" height="360" autoplay muted src="https://test-task2.s3.amazonaws.com/input.mp4" ></video>

    </body>
    </html>
  `);
});

// Start the Express server
let port = 5000
app.listen(port, () => {
  console.log('HLS streaming server is running on http://localhost:' + port);
});


// 'https://s3.amazonaws.com/test-task2/hls/master.m3u8';

//hls.loadSource('/hls/output.m3u8');after const hls 

// const inputFilePath = path.resolve(__dirname, 'input.mp4'); // Path to your MP4 file

// Input MP4 file path and output HLS directory

// Create the output directory if it doesn't exist
// if (!fs.existsSync(outputDir)) {
//   fs.mkdirSync(outputDir);
// }

// FFmpeg command to convert MP4 to HLS
// ffmpeg(inputFilePath)
//   .output(`${outputDir}/output.m3u8`)
//   .addOption('-hls_time', '10')     // Set segment duration to 10 seconds
//   .addOption('-hls_list_size', '0') // Include all segments in the .m3u8 file
//   .addOption('-hls_segment_filename', `${outputDir}/segment_%03d.ts`) // Segment filename pattern
//   .on('end', async () => {
//     console.log('MP4 file has been converted to HLS format successfully.');

//   })
//   .on('error', (err) => {
//     console.error('An error occurred during the conversion: ' + err.message);
//   })
//   .run();
