import mammoth from "mammoth";
import path from "path";

async function main() {
  const files = [
    "CATERING MENU (NEW).docx",
    "OM cocktail menu(new).docx",
    "OM lunch menu (new).doc"
  ];

  for (const file of files) {
    const filePath = path.join(process.cwd(), "_original_assets", file);
    console.log(`\n\n========== ${file} ==========\n`);
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      console.log(result.value);
    } catch (error) {
      console.error("Error reading:", error);
    }
  }
}

main();

