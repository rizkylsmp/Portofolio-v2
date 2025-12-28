/**
 * Utility untuk mapping gambar dari multiple folder secara dinamis
 * Menggunakan import.meta.glob untuk auto-import semua gambar
 */

export interface ImageMap {
  [key: string]: string;
}

export interface FolderImagesMap {
  [folderName: string]: string[];
}

/**
 * Map semua gambar dari satu folder
 * @example
 * const sinkronaImages = getImagesFromFolder(
 *   import.meta.glob<{ default: string }>(
 *     'path/to/sinkrona/*.png',
 *     { eager: true }
 *   )
 * );
 */
export const getImagesFromFolder = (
  modules: Record<string, any>
): string[] => {
  return Object.entries(modules)
    .map(([, module]) => (module as any).default || module)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
};

/**
 * Map semua gambar dari multiple folder sekaligus
 * @example
 * const allProjectImages = getImagesFromFolders({
 *   sinkrona: import.meta.glob<{ default: string }>(
 *     '../assets/images/projects/sinkrona/*.png',
 *     { eager: true }
 *   ),
 *   renwa: import.meta.glob<{ default: string }>(
 *     '../assets/images/projects/renwa/*.png',
 *     { eager: true }
 *   ),
 * });
 * // Result: { sinkrona: [...], renwa: [...] }
 */
export const getImagesFromFolders = (
  folderModules: Record<string, Record<string, any>>
): FolderImagesMap => {
  const result: FolderImagesMap = {};

  Object.entries(folderModules).forEach(([folderName, modules]) => {
    result[folderName] = getImagesFromFolder(modules);
  });

  return result;
};

/**
 * Konversi object images ke array dan sort berdasarkan nama
 */
export const imagesToArray = (imageMap: ImageMap): string[] => {
  return Object.entries(imageMap)
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, url]) => url);
};

/**
 * Filter gambar berdasarkan pattern
 */
export const filterImages = (imageMap: ImageMap, pattern: string): string[] => {
  return Object.entries(imageMap)
    .filter(([name]) => name.includes(pattern))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([, url]) => url);
};
