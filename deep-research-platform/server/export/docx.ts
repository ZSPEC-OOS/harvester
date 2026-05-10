import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import type { ExportSession } from "./types";

export async function buildDocxExport(session: ExportSession): Promise<Buffer> {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: session.topic, heading: HeadingLevel.TITLE }),
        new Paragraph({ children: [new TextRun(`Session ID: ${session.id}`)] }),
        new Paragraph({ children: [new TextRun(`Generated: ${new Date().toISOString()}`)] }),
        new Paragraph({ text: "Report", heading: HeadingLevel.HEADING_1 }),
        new Paragraph(session.finalReport ?? "No report available."),
      ],
    }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}
