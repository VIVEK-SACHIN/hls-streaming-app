const ffmpeg = require('fluent-ffmpeg');
const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs');

// Configure AWS with your credentials and region
AWS.config.update({
    accessKeyId: 'YOUR_ACCESS_KEY', // Your access key
    secretAccessKey: 'YOUR_SECRET_KEY', // Your secret key
    region: 'us-east-1' // Your region
});

const s3 = new AWS.S3();
const inputFilePath = path.resolve(__dirname, 'input.mp4'); // Path to your MP4 file
const outputDir = path.resolve(__dirname, 'hls'); // Directory for HLS files

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Function to generate HLS streams with multiple bitrates
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

// Function to create the master playlist
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
`;
    fs.writeFileSync(masterPlaylistPath, content);
    console.log('Master playlist created:', masterPlaylistPath);
};

// Function to upload files to S3
const uploadToS3 = async () => {
    const files = fs.readdirSync(outputDir);
    for (const file of files) {
        const filePath = path.join(outputDir, file);
        const fileContent = fs.readFileSync(filePath);
        const params = {
            Bucket: 'YOUR_BUCKET_NAME', // Your S3 bucket name
            Key: `hls/${file}`, // Prefix for organization in S3
            Body: fileContent,
            ContentType: file.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/MP2T' // Set content type
        };
        await s3.upload(params).promise();
        console.log(`Uploaded ${file} to S3 bucket ${params.Bucket}`);
    }
};

// Main function to execute the process
const main = async () => {
    try {
        await generateHLS();
        createMasterPlaylist();
        await uploadToS3();
        console.log('All operations completed successfully.');
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

// Run the main function
main();
