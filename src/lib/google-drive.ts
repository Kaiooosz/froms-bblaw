import { put, del, getDownloadUrl as blobGetDownloadUrl } from '@vercel/blob'

export async function uploadToDrive(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    userEmail: string,
    funnelType: string,
    tipo: string
): Promise<string> {
    const pathname = `documentos/${userEmail}/${funnelType}/${tipo}/${filename}`

    const blob = await put(pathname, buffer, {
        access: 'private',
        contentType: mimeType,
    })

    return blob.url
}

export async function getDownloadUrl(url: string): Promise<string> {
    return blobGetDownloadUrl(url)
}

export async function deleteFromDrive(url: string): Promise<void> {
    await del(url)
}
