import { styled } from '@mui/material/styles';
import { Box, CircularProgress } from '@mui/material';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';


interface FileViewerProps {
  fileContent?: string;
  analysis?: string;
  loading?: boolean;
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

const FileViewer = ({ fileContent, analysis, loading = false }: FileViewerProps) => {
  if (loading) {
    return (
      <LoaderContainer>
        <CircularProgress sx={{ color: '#007acc' }} />
      </LoaderContainer>
    );
  }

  return (
    <ViewerContainer>
      <ContentPanel>
        <SyntaxHighlighter
          language="typescript"
          style={vs2015}
          customStyle={{
            padding: '16px',
            margin: 0,
            background: 'transparent',
          }}
          showLineNumbers={false}
          wrapLongLines={true}
        >
          {typeof fileContent === 'string' ? fileContent : JSON.stringify(fileContent, null, 2) || 'Select a file to view its contents'}
        </SyntaxHighlighter>
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

    console.log('Rendered analysis HTML no br:', tempAnalysis); // Debug log
    return tempAnalysis;
}

export default FileViewer;
