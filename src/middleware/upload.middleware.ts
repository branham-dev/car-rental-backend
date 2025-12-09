import type { Context, Next } from "hono";
import fs from "fs";
import path from "path";

export const uploadSingle = (fieldName: string) => {
  return async (c: Context, next: Next) => {
    try {
      // Parse multipart/form-data
      const formData = await c.req.formData();
      const file = formData.get(fieldName) as File | null;

      if (!file) {
        return c.json({ error: `No file uploaded in field ${fieldName}` }, 400);
      }

      // Ensure uploads folder exists
      const uploadDir = path.resolve('./uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      // Save file to disk
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filePath = path.join(uploadDir, file.name);
      fs.writeFileSync(filePath, buffer);

      // Attach file info to request
      (c.req as any).files = {
        [fieldName]: {
          filepath: filePath,
          originalFilename: file.name,
          size: file.size,
          type: file.type,
        },
      };

      console.log("File saved:", (c.req as any).files);

      return next();
    } catch (err) {
      console.error("Upload error:", err);
      return c.json({ error: 'File upload failed' }, 500);
    }
  };
};
