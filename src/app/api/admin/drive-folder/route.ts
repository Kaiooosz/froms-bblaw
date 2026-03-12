import { auth } from "@/auth"
import { google } from 'googleapis'
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

function getDriveClient() {
    const authClient = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
    })
    return google.drive({ version: 'v3', auth: authClient })
}

export async function GET(req: Request) {
    try {
        const session = await auth()
        const isAdmin = (session?.user as any)?.role === 'ADMIN'
            || session?.user?.email === 'bezerraborges@gmail.com'
            || session?.user?.email === 'amborgesvinicius@gmail.com'

        if (!session || !isAdmin) {
            return NextResponse.json({ message: 'Não autorizado' }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const userEmail = searchParams.get('email')

        if (!userEmail) {
            return NextResponse.json({ message: 'E-mail obrigatório' }, { status: 400 })
        }

        const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || ''
        const drive = getDriveClient()

        // Busca pasta do usuário pelo e-mail dentro da pasta raiz
        const res = await drive.files.list({
            q: `name='${userEmail}' and mimeType='application/vnd.google-apps.folder' and '${rootFolderId}' in parents and trashed=false`,
            fields: 'files(id, name)',
            spaces: 'drive',
        })

        if (!res.data.files || res.data.files.length === 0) {
            return NextResponse.json({
                found: false,
                message: 'Nenhuma pasta encontrada para este cliente. O cliente ainda não enviou documentos.',
            })
        }

        const folderId = res.data.files[0].id
        const folderUrl = `https://drive.google.com/drive/folders/${folderId}`

        return NextResponse.json({ found: true, folderId, folderUrl })
    } catch (error: any) {
        console.error('Drive folder lookup error:', error)
        return NextResponse.json({ message: 'Erro ao buscar pasta', error: error.message }, { status: 500 })
    }
}
