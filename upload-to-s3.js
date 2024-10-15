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
async function uploadToS3(filePath,videoId,hlsupload) {
    try {
        

      if(hlsupload&&videoId)  {
        const directoryPath=path.resolve(__dirname, `uploads/hls-videos/${videoId}`);
        const files = fs.readdirSync(directoryPath);
        for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const fileName = path.basename(filePath);
        const fileContent = fs.readFileSync(filePath);
        const key=`hls-videos/${videoId}/${fileName}`;
        try{
            fileUpload(fileName,fileContent,key);
        }catch(e){
            throw new Error(`Failed to upload file to S3: ${e.message}`);
        }
        }
    }
    else{
        const fileName = path.basename(filePath);
        const fileContent = fs.readFileSync(filePath);
        const key=fileName;
        fileUpload(fileName,fileContent,key);
    }
       
    } catch (error) {
        console.error('Error uploading files:', error);
    }
}


async function fileUpload(fileName,fileContent,key) {
    const uploadParams = {
        Bucket: 'test-task2', // Your S3 bucket name
        Key: key,      // The name for the file in S3
        Body: fileContent,          // The file content
        ContentType: fileName.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' :fileName.endsWith('.mp4') ? 'video/mp4':'video/MP2T',   // Set the MIME type to video/mp4
        ACL:'public-read' 
    };

    // Upload the file to S3
    s3.upload(uploadParams, (err, data) => {
        if (err) {
            console.error('Error uploading MP4 to S3:', err);
            throw new Error(`Failed to upload file to S3: ${err.message}`);
        } else {
            console.log(`File uploaded successfully. S3 URL: ${data.Location}`);
        }
    });
}  
// uploadToS3(null,"304f1a9a-9159-41ce-9dc2-73dd47a34872",true);
module.exports = uploadToS3;

