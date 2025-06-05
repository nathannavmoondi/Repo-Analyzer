import { Plugin } from 'vite';
import fs from 'fs/promises';
import path from 'path';

export function fsPlugin(): Plugin {
  // Helper to recursively get file tree
  async function getFileTree(dir: string, root: string): Promise<any[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const excludeFolders = ['dist', 'node_modules'];
    const result = await Promise.all(entries
      .filter(entry => !(entry.isDirectory() && excludeFolders.includes(entry.name)))
      .map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          return {
            name: entry.name,
            path: fullPath, // absolute path
            type: 'folder',
            children: await getFileTree(fullPath, root)
          };
        } else {
          return {
            name: entry.name,
            path: fullPath, // absolute path
            type: 'file'
          };
        }
      }));
    return result;
  }

  return {
    name: 'vite-plugin-fs',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Always set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Handle CORS preflight requests
        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }
        if (req.url === '/__vite_plugin_os__/readFile') {
          try {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const body = JSON.parse(Buffer.concat(chunks).toString());
            const filePath = body.path;
            const normalizedPath = path.normalize(filePath);
            if (!normalizedPath.includes('..')) {
              const content = await fs.readFile(normalizedPath, 'utf-8');
              res.setHeader('Content-Type', 'text/plain');
              res.end(content);
            } else {
              res.statusCode = 403;
              res.end('Access denied');
            }
          } catch (error) {
            console.error('Error reading file:', error);
            res.statusCode = 500;
            res.end('Error reading file');
          }
        } else if (req.url === '/__vite_plugin_os__/readDir') {
          try {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const body = JSON.parse(Buffer.concat(chunks).toString());
            const dirPath = body.path;
            const normalizedPath = path.normalize(dirPath);
            if (!normalizedPath.includes('..')) {
              const tree = await getFileTree(normalizedPath, normalizedPath);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(tree));
            } else {
              res.statusCode = 403;
              res.end('Access denied');
            }
          } catch (error) {
            console.error('Error reading directory:', error);
            res.statusCode = 500;
            res.end('Error reading directory');
          }
        } else {
          next();
        }
      });
    }
  };
}
