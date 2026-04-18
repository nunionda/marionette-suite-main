import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const EXPORT_DIR = path.join(process.cwd(), "public", "exports");
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

export async function generatePdf(projectId: string): Promise<string> {
  // Use frontend URL — Script Writer runs on :5174
  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5174";
  const targetUrl = `${FRONTEND_URL}/render/project/${projectId}`;
  
  console.log(`[PDF_GEN] Launching Puppeteer for ${targetUrl}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    await page.setViewport({ width: 1200, height: 1600 });
    
    // Wait for the page to completely load all network requests (images)
    await page.goto(targetUrl, { waitUntil: "networkidle0", timeout: 60000 });
    
    // Extra padding for React to fully render any delayed components
    await new Promise(r => setTimeout(r, 2000));
    
    const fileName = `export_${projectId}_${Date.now()}.pdf`;
    const filePath = path.join(EXPORT_DIR, fileName);
    
    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
    
    console.log(`[PDF_GEN] PDF generated successfully at ${fileName}`);
    return `/public/exports/${fileName}`;
  } finally {
    await browser.close();
  }
}
