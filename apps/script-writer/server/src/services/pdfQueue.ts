import { generatePdf } from "./pdfGenerator";

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface PdfJob {
  id: string;
  projectId: string;
  status: JobStatus;
  url?: string;
  error?: string;
  createdAt: number;
}

const jobs = new Map<string, PdfJob>();
const queue: string[] = [];
let isProcessing = false;

export function addJob(projectId: string): string {
  const id = crypto.randomUUID();
  const job: PdfJob = { id, projectId, status: "pending", createdAt: Date.now() };
  jobs.set(id, job);
  queue.push(id);
  
  // Trigger processing asynchronously
  processQueue().catch(console.error);
  
  return id;
}

export function getJob(id: string): PdfJob | undefined {
  return jobs.get(id);
}

async function processQueue() {
  if (isProcessing || queue.length === 0) return;
  
  isProcessing = true;
  
  while (queue.length > 0) {
    const jobId = queue.shift()!;
    const job = jobs.get(jobId);
    
    if (!job) continue;
    
    try {
      job.status = "processing";
      console.log(`[PDF_QUEUE] Processing job ${jobId} for project ${job.projectId}`);
      const fileUrl = await generatePdf(job.projectId);
      job.status = "completed";
      job.url = fileUrl;
      console.log(`[PDF_QUEUE] Completed job ${jobId}`);
    } catch (err: any) {
      job.status = "failed";
      job.error = err.message || "Unknown error generating PDF";
      console.error(`[PDF_QUEUE] Failed job ${jobId}:`, err);
    }
  }
  
  isProcessing = false;
}
