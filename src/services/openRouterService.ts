// Slidedeck generator for a repo
export async function createSlidedeckForRepo(repoUrl: string): Promise<string> {
  const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
  const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  const headers = {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://github.com/repo-analyzer',
  };
  console.log('creating slidedeck for repo:', repoUrl);
  const prompt = `Create a slidedeck analyzing the github repo (${repoUrl}). It should tell a brand new person all about this repo,
   what it does, what technology it uses and how it flows. Keep it basic don't get too detailed.\n\n
   Each section must be wrapped into its own separate <div class=\"content-block\">. 
   Within each <div class=\"content-block\">, use appropriate HTML tags:\n- Use <h2> for the main title of that section.\n- Use <p> for all paragraphs of text.\n- Use <ul> or <ol> for lists, with <li> for list items.\n\nThe slidedeck should be comprehensive and lengthy.\nIt must NOT include a <head> HTML element.\n
   Include nice formatting, colors, and code blocks where appropriate.
  Use <pre> and <code> for code blocks, and <span> or <b> for highlights.\n
  Do not include html and body tags in your response. Only return the HTML fragment for the slidedeck.\n
   `;
  const messages = [
    { role: 'system', content: 'You are a code analysis and documentation expert.' },
    { role: 'user', content: prompt }
  ];
  const response = await axios.post(
    API_URL,
    {
      model: 'anthropic/claude-sonnet-4',
      messages
    },
    { headers }
  );
  let html = response.data.choices[0].message.content;
  // Remove <head>, <style>, and inline style attributes if present
  html = html.replace(/<head[\s\S]*?<\/head>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  html = html.replace(/ style="[^"]*"/gi, '');
  return html.trim();
}
// Utility: Extracts owner, repo, branch from a GitHub URL or owner/repo string and sets window.currentRepoInfo
export function setCurrentGitHubRepoInfo(repoUrl: string) {
  let owner = '', repo = '', branch = 'master';
  let repoMatch = repoUrl.match(/github.com[/:]([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?/);
  if (!repoMatch) {
    // Try owner/repo format
    const simpleMatch = repoUrl.match(/^([\w.-]+)\/([\w.-]+)$/);
    if (simpleMatch) {
      owner = simpleMatch[1];
      repo = simpleMatch[2];
    } else {
      throw new Error('Invalid GitHub repo URL or format.');
    }
  } else {
    owner = repoMatch[1];
    repo = repoMatch[2].replace(/\.git$/, '');
    if (repoMatch[3]) branch = repoMatch[3];
    else branch = 'master';
  }
  (window as any).currentRepoInfo = { owner, repo, branch };
}
import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://github.com/repo-analyzer',
};

export const analyzeRepo = async (repoUrl: string = 'https://github.com/nathannavmoondi/Resume-Qualify-Demo') => {
  try {
    // Only allow GitHub URLs
    if (!/^https:\/\/github\.com\//i.test(repoUrl)) {
      throw new Error('Only GitHub repository URLs are supported.');
    }
    // Accepts full URL or owner/repo
    let owner = '', repo = '', branch = 'master';
    let repoMatch = repoUrl.match(/github.com[/:]([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?/);
    if (!repoMatch) {
      // Try owner/repo format
      const simpleMatch = repoUrl.match(/^([\w.-]+)\/([\w.-]+)$/);
      if (simpleMatch) {
        owner = simpleMatch[1];
        repo = simpleMatch[2];
      } else {
        throw new Error('Invalid GitHub repo URL or format.');
      }
    } else {
      owner = repoMatch[1];
      repo = repoMatch[2].replace(/\.git$/, '');
      if (repoMatch[3]) branch = repoMatch[3];
      else branch = 'master';
    }
    // Always use master branch unless a branch is explicitly specified
    const treeResp = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
    const tree = treeResp.data.tree;
    // Build file tree structure, sort folders first, hide .jpg/.jpeg files
    function buildTree(treeArr: any[]): FileNode[] {
      const root: any = {};
      for (const item of treeArr) {
        // Hide dist, node_modules, and .jpg/.jpeg files (case-insensitive)
        if (item.path.startsWith('dist/') || item.path.startsWith('node_modules/')) continue;
        if (item.type !== 'tree' && /\.(jpg|jpeg)$/i.test(item.path)) continue;
        const parts = item.path.split('/');
        let curr = root;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (!curr[part]) {
            curr[part] = {
              name: part,
              path: '/' + parts.slice(0, i + 1).join('/'),
              type: i === parts.length - 1 ? (item.type === 'tree' ? 'folder' : 'file') : 'folder',
              children: {}
            };
          }
          curr = curr[part].children;
        }
      }
      function toArray(obj: any): FileNode[] {
        // Sort: folders first, then files, both alphabetically
        const nodes = Object.values(obj).map((node: any) => ({
          name: node.name,
          path: node.path,
          type: node.type,
          children: node.type === 'folder' ? toArray(node.children) : undefined
        }));
        return nodes.sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'folder' ? -1 : 1;
        });
      }
      return toArray(root);
    }
    return buildTree(tree);
  } catch (error) {
    throw error;
  }
};

export interface FileAnalysis {
  content: string;
  analysis: string;
}

async function fetchFileContent(filePath: string): Promise<string> {
  try {
    // Check if it's a GitHub path or local path
    if (filePath.startsWith('http')) {
      // Handle GitHub URL (should be raw.githubusercontent.com, but if not, convert)
      let rawUrl = filePath;
      if (rawUrl.includes('github.com')) {
        rawUrl = rawUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        // Always use master branch in the URL if not specified
        rawUrl = rawUrl.replace('/main/', '/master/');
      }
      const response = await axios.get(rawUrl);
      return response.data;
    } else if (filePath.startsWith('/')) {
      // Try to parse as GitHub repo path: /path/to/file in a repo
      // Expect a global variable or context to know which repo is active
      // For now, assume window.currentRepoInfo = { owner, repo, branch }
      // (You may want to refactor this to pass repo info explicitly)
      const repoInfo = (window as any).currentRepoInfo;
      if (repoInfo && repoInfo.owner && repoInfo.repo) {
        const branch = repoInfo.branch || 'master';
        const rawUrl = `https://raw.githubusercontent.com/${repoInfo.owner}/${repoInfo.repo}/${branch}${filePath}`;
        const response = await axios.get(rawUrl);
        return response.data;
      } else {
        throw new Error('Missing GitHub repo info for file path.');
      }
    } else {
      // filePath is now always absolute from the backend (local)
      const response = await axios.post('http://localhost:5173/__vite_plugin_os__/readFile', {
        path: filePath
      });
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw new Error('Could not fetch file contents');
  }
}

export const analyzeFile = async (fileUrl: string): Promise<FileAnalysis> => {
  try {
    // First fetch the file content
    const content = await fetchFileContent(fileUrl);

    // Then analyze it with OpenRouter
    const response = await axios.post<OpenRouterResponse>(
      API_URL,
      {
        //model: 'openai/gpt-3.5-turbo',
        //model: 'google/gemini-2.5-pro-preview',
        model: 'anthropic/claude-sonnet-4',        
        messages: [
          {
            role: 'system',            
          content:
    `You are a code analysis expert. Provide a beautiful, visually appealing, and clear HTML analysis of the code.
- Use compact, modern HTML styles: avoid excessive blank lines, avoid huge headings, use h3 or h4 for section titles, and keep spacing tight and professional.
- Use <pre> and <code> for code, and <span> or <b> for highlights.
- Use subtle color highlights for important points, but keep the layout compact and readable.
- Do not include line numbers in your analysis.
- Don't use headers, instead use bold.
- Do NOT add extra blank lines after each header or section. Text is white.
- Do not define paddings or margins.
- Do NOT include <html>, <body>, or <head> tags in your response. Only return the HTML fragment for the analysis panel.`
   },
          {
            role: 'user',
            content: `Analyze this code and explain its purpose and key functionality. Format your response as beautiful HTML with colors and code blocks.  
            IMPORTANT!!  Do not add line breaks after each header or section. Don't return entire code. Text is white. Code is:  \n\n${content}`
          }
        ]
      },
      { headers }
    );

    // Remove all <br> tags (including encoded and variants) from the analysis HTML
    let analysisHtml = response.data.choices[0].message.content;
    // Remove all <br> tag variants (HTML and encoded)
analysisHtml = analysisHtml.replace(/(<br\s*\/?\s*>|<br\/>|<br>|&lt;br\s*\/?\s*&gt;|&lt;br&gt;)/gi, '');
// Remove ```html and ``` (for code block wrappers)
analysisHtml = analysisHtml.replace(/```html|```/gi, '');
analysisHtml = analysisHtml.trim();

    return {
      content,
      analysis: analysisHtml
    };
  } catch (error) {
    console.error('Error analyzing file:', error);
    throw error;
  }
};
