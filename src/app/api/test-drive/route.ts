import { google } from 'googleapis'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
        const key = (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n')
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID

        if (!email || !key || !folderId) {
            return NextResponse.json({
                ok: false,
                error: 'Variáveis de ambiente faltando',
                missing: {
                    GOOGLE_SERVICE_ACCOUNT_EMAIL: !email,
                    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: !key,
                    GOOGLE_DRIVE_FOLDER_ID: !folderId,
                }
            }, { status: 500 })
        }

        const auth = new google.auth.GoogleAuth({
            credentials: { client_email: email, private_key: key },
            scopes: ['https://www.googleapis.com/auth/drive'],
        })

        const drive = google.drive({ version: 'v3', auth })

        // Tenta listar arquivos na pasta raiz (só lê — não cria nada)
        const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed=false`,
            fields: 'files(id, name)',
            pageSize: 5,
        })

        return NextResponse.json({
            ok: true,
            message: '✅ Conexão com Google Drive funcionando!',
            folder_id: folderId,
            service_account: email,
            files_in_root: res.data.files?.length ?? 0,
            sample_files: res.data.files?.map(f => f.name) ?? [],
        })
    } catch (error: any) {
        return NextResponse.json({
            ok: false,
            error: error.message,
            details: error.response?.data || null,
        }, { status: 500 })
    }
}
