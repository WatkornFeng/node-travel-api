// src/types/express.d.ts
import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      file?: Multer.File;
      files?: { [fieldname: string]: Multer.File[] } | Multer.File[];
      uploadPicture: Buffer;
      uploadCover: Buffer;
    }
  }
}

// This is necessary to let TypeScript know this file is a global declaration file
export {};
