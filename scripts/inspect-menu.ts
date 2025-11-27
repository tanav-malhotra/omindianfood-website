import mammoth from "mammoth";
import path from "path";

async function main() {
  const filePath = path.join(process.cwd(), "_original_assets", "OM menu in house NEW.docx");
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    console.log(result.value);
  } catch (error) {
    console.error("Error reading docx:", error);
  }
}

main();

