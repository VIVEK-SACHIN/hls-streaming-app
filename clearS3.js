const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.SOME,
  credentials: {
    accessKeyId:  process.env.SOME,
    secretAccessKey:  process.env.SOME,
  }
});

async function emptyBucket(bucketName) {
  try {
    const listParams = { Bucket: bucketName };
    const data = await s3.send(new ListObjectsV2Command(listParams));
    console.log(data);
    if (data.Contents.length === 0) return;

    const deleteParams = {
      Bucket: bucketName,
      Delete: { Objects: data.Contents.map(({ Key }) => ({ Key })) },
    };

    await s3.send(new DeleteObjectsCommand(deleteParams));

    if (data.IsTruncated) {
      await emptyBucket(bucketName);
    }

    console.log(`Successfully emptied the bucket: ${bucketName}`);
  } catch (err) {
    console.error('Error emptying the bucket:', err);
  }
}

emptyBucket('test-task2');
