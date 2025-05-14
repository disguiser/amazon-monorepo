import * as fs from 'fs/promises';

export function checkFileExists(path: string) {
  return new Promise(async (resolve, reject) => {
    try {
      await fs.access(path);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}
