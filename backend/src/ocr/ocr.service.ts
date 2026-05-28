import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';

const TMP_PREFIX = 'launchup-ocr-';

/**
 * Partial OCR service.
 * - Currently returns a stubbed transcription when given a file path.
 * - Designed as a placeholder so a real OCR engine (Tesseract, AWS Textract, etc.)
 *   can be integrated later.
 */
@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  async parseImageFile(filePath: string): Promise<{ text: string }> {
    // Minimal safety: ensure file exists
    try {
      const abs = path.resolve(filePath);
      await fs.access(abs);
      // Try to use tesseract.js if available
      try {
        // dynamic import so app still runs if the package isn't installed yet
        const tesseract = await import('tesseract.js');
        const { createWorker } = tesseract;
        const worker = createWorker();
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data } = await worker.recognize(abs);
        await worker.terminate();
        return { text: data.text };
      } catch (err) {
        this.logger.warn('tesseract.js not available or failed — returning placeholder');
        const stub = `OCR_PLACEHOLDER: parsed ${path.basename(abs)} - integrate real OCR engine`;
        return { text: stub };
      }
    } catch (err) {
      return { text: '' };
    }
  }

  async parseBuffer(_buf: Buffer): Promise<{ text: string }> {
    // Write buffer to a temp file then call parseImageFile to reuse logic
    try {
      const tmpFile = path.join(os.tmpdir(), `${TMP_PREFIX}${Date.now()}.png`);
      await fs.writeFile(tmpFile, _buf);
      const res = await this.parseImageFile(tmpFile);
      // best-effort cleanup
      try {
        await fs.unlink(tmpFile);
      } catch {}
      return res;
    } catch (err) {
      return { text: 'OCR_PLACEHOLDER: buffer received (error writing temp file)' };
    }
  }
}
