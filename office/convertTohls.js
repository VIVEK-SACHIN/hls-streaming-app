const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');


// Input MP4 file path and output HLS directory
const inputFilePath = path.resolve(__dirname, 'input.mp4'); // Path to your MP4 file
const outputDir = path.resolve(__dirname, 'hls'); // Directory where HLS files will be saved

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const generateHLS = () => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
            .output(`${outputDir}/3000k.m3u8`)
            .addOption('-hls_time', '10')
            .addOption('-hls_list_size', '0')
            .addOption('-hls_segment_filename', `${outputDir}/3000k_%03d.ts`)
            .output(`${outputDir}/1500k.m3u8`)
            .addOption('-hls_time', '10')
            .addOption('-hls_list_size', '0')
            .addOption('-hls_segment_filename', `${outputDir}/1500k_%03d.ts`)
            .output(`${outputDir}/800k.m3u8`)
            .addOption('-hls_time', '10')
            .addOption('-hls_list_size', '0')
            .addOption('-hls_segment_filename', `${outputDir}/800k_%03d.ts`)
            .on('end', () => {
                console.log('HLS streams generated successfully.');
                resolve();
            })
            .on('error', (err) => {
                console.error('Error generating HLS:', err);
                reject(err);
            })
            .run();
    });
};

const createMasterPlaylist = () => {
    const masterPlaylistPath = path.join(outputDir, 'master.m3u8');
    const content = `
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720
3000k.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=854x480
1500k.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
800k.m3u8
`
;
    fs.writeFileSync(masterPlaylistPath, content);
    console.log('Master playlist created:', masterPlaylistPath);
};

const main = async () => {
    try {
        await generateHLS();
        createMasterPlaylist();
        console.log('All operations completed successfully.');
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

// Run the main function
main();