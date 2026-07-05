import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(request) {
  try {
    const { tailoredText, jobTitle } = await request.json();

    if (!tailoredText) {
      return NextResponse.json({ error: "No content provided." }, { status: 400 });
    }

    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const page = doc.addPage([612, 792]);
    const { width, height } = page.getSize();

    const margin = 56;
    let y = height - margin;
    const lineHeight = 14;
    const fontSize = 10;
    const boldSize = 12;

    function wrapText(text, maxWidth) {
      const words = text.split(" ");
      const lines = [];
      let current = "";
      for (const word of words) {
        const test = current ? current + " " + word : word;
        if (font.widthOfTextAtSize(test, fontSize) > maxWidth) {
          lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);
      return lines;
    }

    function addLine(text, size = fontSize, bold = false) {
      const f = bold ? fontBold : font;
      const lines = size > fontSize ? [text] : wrapText(text, width - margin * 2);
      for (const line of lines) {
        if (y < margin + lineHeight) {
          const newPage = doc.addPage([612, 792]);
          y = height - margin;
        }
        page.drawText(line, {
          x: margin,
          y: y,
          size,
          font: f,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight + (size > fontSize ? 4 : 0);
      }
    }

    const lines = tailoredText.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        y -= lineHeight * 0.5;
        continue;
      }

      const isSection = /^(EDUCATION|EXPERIENCE|SKILLS|SUMMARY|PROFESSIONAL SUMMARY|CERTIFICATIONS|PROJECTS)/i.test(trimmed);
      const prevIsSection = false;

      if (isSection) {
        y -= lineHeight * 0.5;
        addLine(trimmed, boldSize, true);
        y -= 4;
      } else if (trimmed.startsWith("-") || trimmed.startsWith("•") || trimmed.startsWith("*")) {
        const text = trimmed.replace(/^[-•*]\s*/, "• ");
        addLine(text, fontSize, false);
      } else if (font.widthOfTextAtSize(trimmed, boldSize) < width - margin * 2 && /^[A-Z][A-Z\s]+$/.test(trimmed)) {
        addLine(trimmed, boldSize, true);
        y -= 4;
      } else {
        addLine(trimmed, fontSize, false);
      }
    }

    const pdfBytes = await doc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="tailored-resume-${jobTitle ? jobTitle.replace(/\s+/g, "-").toLowerCase() : "optimized"}.pdf"`,
        "Content-Length": String(pdfBytes.length),
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate PDF." },
      { status: 500 }
    );
  }
}
