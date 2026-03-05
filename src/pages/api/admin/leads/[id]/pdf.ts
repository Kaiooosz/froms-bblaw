import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    if (Array.isArray(id)) {
        return res.status(400).json({ error: 'Invalid lead id' });
    }

    const lead = await prisma.lead.findUnique({
        where: { id: Number(id) },
        include: { // adjust fields as per your schema
            // e.g., documents: true,
        },
    });

    if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
    }

    // Generate simple PDF using pdf-lib
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const lines = [
        `Lead ID: ${lead.id}`,
        `Nome: ${lead.nomeCompleto || ''}`,
        `WhatsApp: ${lead.whatsapp || ''}`,
        `E-mail: ${lead.email || ''}`,
        `Cidade/Estado: ${lead.cidadeEstado || ''}`,
        `Representa: ${lead.representa || ''}`,
        // add more fields as needed
    ];

    let y = height - 50;
    for (const line of lines) {
        page.drawText(line, {
            x: 50,
            y,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
        });
        y -= fontSize + 5;
    }

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="lead_${lead.id}.pdf"`);
    res.send(Buffer.from(pdfBytes));
}
