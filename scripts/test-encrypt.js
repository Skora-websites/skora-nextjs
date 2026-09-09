/* Verify pdfkit -> pdf-lib-plus-encrypt pipeline produces a real encrypted PDF */
const PDFDocument = require("pdfkit");
const { PDFDocument: EncPDFDocument } = require("pdf-lib-plus-encrypt");
const fs = require("fs");

async function main() {
  // 1. Generate a PDF with pdfkit (same as the download route)
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const buffers = [];
  doc.on("data", (c) => buffers.push(c));
  const done = new Promise((r) => doc.on("end", r));
  doc.fontSize(22).text("SKORA");
  doc.moveDown();
  doc.fontSize(11).text("Dear Ashish Mishra,");
  doc.moveDown();
  doc.text("Annual Salary: Rs. 4,99,82,000");
  doc.end();
  await done;
  const plain = Buffer.concat(buffers);

  // 2. Encrypt with pdf-lib-plus-encrypt (same as the download route)
  const password = "916024207846dd66";
  const encDoc = await EncPDFDocument.load(plain);
  await encDoc.encrypt({
    userPassword: password,
    ownerPassword: password + "-owner",
    permissions: {
      printing: "highResolution",
      modifying: false,
      copying: false,
      annotating: false,
      fillingForms: false,
      contentAccessibility: true,
      documentAssembly: false,
    },
  });
  const encrypted = await encDoc.save({ useObjectStreams: false });
  fs.writeFileSync("encrypted-test.pdf", encrypted);

  // 3. Verify
  const raw = Buffer.from(encrypted).toString("latin1");
  console.log("plain PDF size:", plain.length, "bytes");
  console.log("encrypted PDF size:", encrypted.length, "bytes");
  console.log("has /Encrypt dictionary:", raw.includes("/Encrypt"));
  console.log("has /Filter /Standard (RC4/AES):", /\/Filter\s*\/Standard/.test(raw));
  console.log("has valid %%EOF trailer:", raw.trimEnd().endsWith("%%EOF"));

  // 4. Confirm it still loads (pdf-lib can open with ignoreEncryption for structure check)
  try {
    const check = await EncPDFDocument.load(encrypted, { ignoreEncryption: true });
    console.log("reloads OK, page count:", check.getPageCount());
  } catch (e) {
    console.log("reload FAILED:", e.message);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
