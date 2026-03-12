import { google } from 'googleapis';

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '';

function getDriveClient() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
    return google.drive({ version: 'v3', auth });
}

async function getOrCreateFolder(drive: any, name: string, parentId: string): Promise<string> {
    // Busca pasta existente
    const res = await drive.files.list({
        q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });

    if (res.data.files && res.data.files.length > 0) {
        return res.data.files[0].id as string;
    }

    // Cria pasta
    const folder = await drive.files.create({
        requestBody: {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
        },
        fields: 'id',
    });

    return folder.data.id as string;
}

export async function uploadToDrive(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    userEmail: string,
    funnelType: string,
    tipo: string
): Promise<string> {
    const drive = getDriveClient();

    // Cria estrutura de pastas: Root / userEmail / funnelType / tipo
    const userFolderId = await getOrCreateFolder(drive, userEmail, ROOT_FOLDER_ID);
    const funnelFolderId = await getOrCreateFolder(drive, funnelType, userFolderId);
    const tipoFolderId = await getOrCreateFolder(drive, tipo, funnelFolderId);

    // Upload do arquivo
    const { Readable } = require('stream');
    const stream = Readable.from(buffer);

    const file = await drive.files.create({
        requestBody: {
            name: filename,
            parents: [tipoFolderId],
        },
        media: {
            mimeType,
            body: stream,
        },
        fields: 'id',
    });

    return file.data.id as string;
}

export async function getDownloadUrl(fileId: string): Promise<string> {
    const drive = getDriveClient();

    // Torna o arquivo acessível via link temporário
    await drive.permissions.create({
        fileId,
        requestBody: {
            role: 'reader',
            type: 'anyone',
        },
    });

    const file = await drive.files.get({
        fileId,
        fields: 'webContentLink, webViewLink',
    });

    return (file.data.webContentLink || file.data.webViewLink) as string;
}

export async function deleteFromDrive(fileId: string): Promise<void> {
    const drive = getDriveClient();
    await drive.files.delete({ fileId });
}
