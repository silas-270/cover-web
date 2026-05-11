import { PDFDocument } from 'pdf-lib';

export async function convertImagesToPdfBuffer(imageFiles: File[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    
    // Standard A4 dimensions in points (1 pt = 1/72 inch)
    const A4_WIDTH = 595.28;
    const A4_HEIGHT = 841.89;
    const MARGIN = 0;

    for (const file of imageFiles) {
        const imageBytes = await file.arrayBuffer();
        let pdfImage;
        
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
            pdfImage = await pdfDoc.embedJpg(imageBytes);
        } else if (file.type === 'image/png') {
            pdfImage = await pdfDoc.embedPng(imageBytes);
        } else {
            throw new Error(`Nicht unterstütztes Format: ${file.type}. Nur JPG und PNG sind erlaubt.`);
        }

        // Get original dimensions
        const { width: imgWidth, height: imgHeight } = pdfImage.scale(1);
        
        const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
        
        // Calculate fit-to-page dimensions
        const maxWidth = A4_WIDTH - 2 * MARGIN;
        const maxHeight = A4_HEIGHT - 2 * MARGIN;
        
        const scaleX = maxWidth / imgWidth;
        const scaleY = maxHeight / imgHeight;
        
        // Fit within margins, optionally preventing upscaling (but here we fit it up to the margins for consistency)
        const scale = Math.min(scaleX, scaleY); 
        
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        
        // Center on page
        const x = (A4_WIDTH - scaledWidth) / 2;
        const y = (A4_HEIGHT - scaledHeight) / 2;
        
        page.drawImage(pdfImage, {
            x,
            y,
            width: scaledWidth,
            height: scaledHeight,
        });
    }

    return await pdfDoc.save();
}
