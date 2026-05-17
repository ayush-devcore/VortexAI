// ─────────────────────────────────────────────────────────
// Cloud Storage — S3 / Cloudinary Stubs
// ─────────────────────────────────────────────────────────
// To activate: npm install @aws-sdk/client-s3 or cloudinary

const logger = require('./logger');

const provider = process.env.STORAGE_PROVIDER || 'local';

/** Upload a file (stub — returns mock URL) */
async function uploadFile(fileBuffer, fileName, mimeType) {
  if (provider === 's3') {
    // const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    // const s3 = new S3Client({ region: process.env.AWS_REGION });
    // await s3.send(new PutObjectCommand({ Bucket, Key: fileName, Body: fileBuffer, ContentType: mimeType }));
    logger.info(`[S3 Stub] Upload: ${fileName}`);
    return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${fileName}`;
  }

  if (provider === 'cloudinary') {
    // const cloudinary = require('cloudinary').v2;
    // const result = await cloudinary.uploader.upload_stream(...)
    logger.info(`[Cloudinary Stub] Upload: ${fileName}`);
    return `https://res.cloudinary.com/vortex/image/upload/${fileName}`;
  }

  logger.info(`[Local Storage] ${fileName}`);
  return `/uploads/${fileName}`;
}

/** Delete a file (stub) */
async function deleteFile(fileUrl) {
  logger.info(`[Storage Stub] Delete: ${fileUrl}`);
  return true;
}

module.exports = { uploadFile, deleteFile };
