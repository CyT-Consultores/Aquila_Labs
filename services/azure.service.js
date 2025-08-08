const { ShareServiceClient, StorageSharedKeyCredential } = require('@azure/storage-file-share');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const account = process.env.ACCOUNT;
const key = process.env.ACCOUNT_KEY;
const share = process.env.AZURE_SHARE;

// ✅ Crear credencial correctamente
const credentials = new StorageSharedKeyCredential(account, key);

// ✅ Crear cliente con credencial
const service = new ShareServiceClient(
  `https://${account}.file.core.windows.net`,
  credentials
);

async function uploadToAzure(folderRemote, localFilePath, remoteFileName) {
  const shareClient = service.getShareClient(share);
  const dirClient = shareClient.getDirectoryClient(folderRemote);

  try {
    await dirClient.createIfNotExists();
  } catch (err) {
    console.error("❌ Error creando carpeta remota:", err.message);
  }

  const fileClient = dirClient.getFileClient(remoteFileName);
  const fileContent = fs.readFileSync(localFilePath);

  await fileClient.uploadData(fileContent);
}

module.exports = { uploadToAzure };
