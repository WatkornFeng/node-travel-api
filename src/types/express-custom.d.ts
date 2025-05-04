import { File as MulterFile } from "multer";

declare global {
  namespace Express {
    interface Request {
      uploadPicture: Buffer;
      uploadCover: Buffer;
      userId?: string;
      file?: MulterFile;
      files?:
        | {
            [fieldname: string]: MulterFile[];
          }
        | MulterFile[];
    }
  }
}
