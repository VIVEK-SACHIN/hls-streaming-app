
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require('fs');
const { exec } = require("child_process");
const AWS = require("aws-sdk");
const uploadToS3 = require('./upload-to-s3');

const s3 = new AWS.S3();
const app = express();
app.use(cors({origin: ['*']}));

app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin', "*");
    res.header("Acess-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next();
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
const outputDir = path.resolve(__dirname, 'uploads'); 
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
app.use("/uploads", express.static("uploads"));

// Multer configuration
//Multer is a middleware for handling multipart/form-data, which is primarily used for uploading files.
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + uuidv4() + path.extname(file.originalname));
    }
});

// Multer middleware
const upload = multer({ storage: storage });



const linkFilePath = './videoLinks.txt';

const storelink = (videoLink) => {
    const newLinkLine = `${videoLink}\n`
    fs.appendFileSync(linkFilePath, newLinkLine, 'utf-8');
    console.log('[INFO] video URL stored successfully.')
}



// AWS S3 configuration






app.post("/upload", upload.single('file'), (req, res) => {
  console.log("[INFO] File uploaded.");

  // Generate a unique ID for the video
  const videoId = uuidv4();
  const videoPath = req.file?.path;

  // Ensure the uploaded file exists
  if (!videoPath || !fs.existsSync(videoPath)) {
    return res.status(400).json({ error: "File not found or invalid." });
  }

  const outputPath = `./uploads/hls-videos/${videoId}`;
  const hlsPath = `${outputPath}/playlist.m3u8`;

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Define the ffmpeg command for generating multiple HLS resolutions
  const ffmpegCommand = `ffmpeg -hide_banner -y -i ${videoPath} \
    -vf scale=w=640:h=360:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod  -b:v 800k -maxrate 856k -bufsize 1200k -b:a 96k -hls_segment_filename ${outputPath}/360p_%03d.ts ${outputPath}/360p.m3u8 \
    -vf scale=w=842:h=480:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 1400k -maxrate 1498k -bufsize 2100k -b:a 128k -hls_segment_filename ${outputPath}/480p_%03d.ts ${outputPath}/480p.m3u8 \
    -vf scale=w=1280:h=720:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 2800k -maxrate 2996k -bufsize 4200k -b:a 128k -hls_segment_filename ${outputPath}/720p_%03d.ts ${outputPath}/720p.m3u8 \
    -vf scale=w=1920:h=1080:force_original_aspect_ratio=decrease -c:a aac -ar 48000 -c:v h264 -profile:v main -crf 20 -sc_threshold 0 -g 48 -keyint_min 48 -hls_time 4 -hls_playlist_type vod -b:v 5000k -maxrate 5350k -bufsize 7500k -b:a 192k -hls_segment_filename ${outputPath}/1080p_%03d.ts ${outputPath}/1080p.m3u8`;

  // Run ffmpeg command to generate HLS files
  exec(ffmpegCommand, async (error, stdout, stderr) => {
    if (error) {
      console.error(`[ERROR] exec error: ${error}`);
      return res.status(500).json({ error: "Error while processing your file. Please try again." });
    }

    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    fs.copyFileSync('./playlist.m3u8', `${outputPath}/playlist.m3u8`);
    
    // Function to upload a file to S3
    // const uploadToS3 = async (filePath, key, contentType) => {
    //   const fileContent = fs.readFileSync(filePath);
    //   const params = {
    //     Bucket: 'test-task2',
    //     Key: key,
    //     Body: fileContent,
    //     ContentType: contentType,
    //     ACL: 'public-read' 
    //   };
    //   return s3.upload(params).promise();
    // };

    // Function to upload all segment files to S3
    // const uploadSegmentsToS3 = async (outputPath, resolution, videoId) => {
    //   const files = fs.readdirSync(outputPath).filter(file => file.startsWith(`${resolution}_`));
    //   for (const file of files) {
    //     const filePath = `${outputPath}/${file}`;
    //     const key = `hls-videos/${videoId}/${file}`;
    //     await uploadToS3(filePath, key, 'video/MP2T'); 
    //   }
    // };

    try {
      // Upload the playlist and HLS files to S3
    //   await uploadToS3(`${outputPath}/playlist.m3u8`, `hls-videos/${videoId}/playlist.m3u8`, 'application/vnd.apple.mpegurl');
    //   await uploadToS3(`${outputPath}/360p.m3u8`, `hls-videos/${videoId}/360p.m3u8`, 'application/vnd.apple.mpegurl');
    //   await uploadToS3(`${outputPath}/480p.m3u8`, `hls-videos/${videoId}/480p.m3u8`, 'application/vnd.apple.mpegurl');
    //   await uploadToS3(`${outputPath}/720p.m3u8`, `hls-videos/${videoId}/720p.m3u8`, 'application/vnd.apple.mpegurl');
    //   await uploadToS3(`${outputPath}/1080p.m3u8`, `hls-videos/${videoId}/1080p.m3u8`, 'application/vnd.apple.mpegurl');
     await uploadToS3(null,videoId,true);
      // Upload segment files for each resolution
    //   await uploadSegmentsToS3(outputPath, "360p", videoId);
    //   await uploadSegmentsToS3(outputPath, "480p", videoId);
    //   await uploadSegmentsToS3(outputPath, "720p", videoId);
    //   await uploadSegmentsToS3(outputPath, "1080p", videoId);

      // Generate the video URL
      const videoUrl = `https://test-task2.s3.amazonaws.com/hls-videos/${videoId}/playlist.m3u8`;

      // Optionally, store the link in a database or further processing
      storelink(videoUrl);

      // Send the response
      res.json({ message: "File uploaded successfully.", videoUrl: videoUrl, videoId: videoId });
    } catch (uploadError) {
      console.error(`[ERROR] Error uploading to S3: ${uploadError}`);
      const videoUrl = `http://localhost:8000/uploads/hls-videos/${videoId}/playlist.m3u8`

      try{
          storelink(videoUrl);
      } catch(error){
          console.error(`[ERROR] error while storing video URL: ${error}`);
          res.json({"error": "Error while processing your file. Please try again."})
      }
      res.json({"message": "File uploaded successfully.", videoUrl: videoUrl, videoId: videoId})
    }
  });
});


const readLinks = () => {
    const data = fs.readFileSync(linkFilePath, 'utf-8');
    const links = data.trim().split('\n');
    return links;
}

// Route to fetch all available videos
app.get("/videos", (req, res) => {
    res.json({
        "videoUrls": readLinks()
    });
});

app.listen(8000, () => {
    console.log("[INFO] App is running at port 8000");
});