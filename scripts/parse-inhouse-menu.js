const mammoth = require('mammoth');
const path = require('path');

async function parseDocx() {
  const filePath = path.join(process.cwd(), '_original_assets', 'OM menu in house NEW.docx');
  const result = await mammoth.extractRawText({ path: filePath });
  console.log(result.value);
}

parseDocx().catch(console.error);

