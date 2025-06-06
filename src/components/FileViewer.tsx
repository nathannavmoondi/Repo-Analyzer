import { styled } from '@mui/material/styles';
import { Box, CircularProgress } from '@mui/material';
 import  SyntaxHighlighter  from 'react-syntax-highlighter';
 import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
//import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
//import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';



interface FileViewerProps {
  fileContent?: string;
  analysis?: string;
  loading?: boolean;
  filePath?: string;
}

const ViewerContainer = styled(Box)({
  height: '100%',
  width: '100%',
  backgroundColor: '#1e1e1e',
  color: '#cccccc',
  display: 'flex',
  overflow: 'hidden',
});

const ContentPanel = styled(Box)({
  flex: '1 1 50%',
  overflow: 'auto',
  '& pre': {
    margin: 0,
    borderRadius: 0,
    backgroundColor: 'transparent !important',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
  '& code': {
    fontFamily: "'SF Mono', Monaco, Menlo, Consolas, 'Ubuntu Mono', monospace",
    fontSize: '13px',
    lineHeight: '20px',
  },
  '&::-webkit-scrollbar': {
    width: '14px',
    height: '14px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#1e1e1e',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#424242',
    border: '3px solid #1e1e1e',
    borderRadius: '7px',
    '&:hover': {
      backgroundColor: '#525252',
    },
  },
});

const AnalysisPanel = styled(Box)({
  flex: '1 1 50%',
  overflow: 'auto',
  padding: '16px',
  borderLeft: '1px solid #333333',
  fontFamily: "'SF Mono', Monaco, Menlo, Consolas, 'Ubuntu Mono', monospace",
  fontSize: '13px',
  lineHeight: '1.5',
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word'
});

const LoaderContainer = styled(Box)({
  height: '100%',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#1e1e1e',
});

function getLanguageFromPath(path?: string): string {
  if (!path) return 'plaintext';
  const ext = path.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js': return 'javascript';
    case 'ts': return 'typescript';
    case 'tsx': return 'tsx';
    case 'jsx': return 'jsx';
    case 'json': return 'json';
    case 'css': return 'css';
    case 'md': return 'markdown';
    case 'py': return 'python';
    case 'java': return 'java';
    case 'c': return 'c';
    case 'cpp': return 'cpp';
    case 'h': return 'cpp';
    case 'sh': return 'bash';
    case 'yml':
    case 'yaml': return 'yaml';
    case 'html': return 'xml';
    case 'xml': return 'xml';
    case 'go': return 'go';
    case 'rb': return 'ruby';
    case 'php': return 'php';
    case 'rs': return 'rust';
    case 'cs': return 'csharp';
    case 'scss': return 'scss';
    case 'less': return 'less';
    case 'txt': return 'plaintext';
    default: return 'plaintext';
  }
}

const FileViewer = ({ fileContent, analysis, loading = false, filePath }: FileViewerProps) => {
  if (loading) {
    return (
      <LoaderContainer>
        <CircularProgress sx={{ color: '#007acc' }} />
      </LoaderContainer>
    );
  }



  const displayContent = typeof fileContent === 'string' ? fileContent : (fileContent ? JSON.stringify(fileContent, null, 2) : '');

  return (
    <ViewerContainer>
      <ContentPanel>
        {displayContent ? (
          <SyntaxHighlighter
            language='typescript'
            //{getLanguageFromPath(filePath)}
            style={vs2015}
            customStyle={{
              padding: '16px',
              margin: 0,
              background: 'transparent',
            }}
            showLineNumbers={false}
            wrapLongLines={true}
           // className="hljs"
          >
            {displayContent}
          </SyntaxHighlighter>
        ) : (
          <Box sx={{ color: '#888', p: 2 }}>Select a file to view its contents</Box>
        )}
      </ContentPanel>
      <AnalysisPanel>
        {/* Render analysis as HTML with code highlighting if present */}
        {analysis ? (
          <span
            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: renderAnalysisWithCode(analysis) }}
          />
        ) : 'File analysis will appear here'}
      </AnalysisPanel>
    </ViewerContainer>
  );
};

// Helper to render code blocks in analysis as HTML with syntax highlighting
function renderAnalysisWithCode(analysis: string): string {
  // Replace markdown code blocks with <pre><code> and inline code with <code>
  // This is a simple implementation for demonstration
let tempAnalysis = analysis;
tempAnalysis = tempAnalysis.replace(/(<br\s*\/?\s*>|<br\/>|<br>|&lt;br\s*\/?\s*&gt;|&lt;br&gt;)/gi, '');
// Remove ```html and ``` (for code block wrappers)
tempAnalysis = tempAnalysis.replace(/```html|```/gi, '');
tempAnalysis = tempAnalysis.trim();
    
    return tempAnalysis;
}

export default FileViewer;
