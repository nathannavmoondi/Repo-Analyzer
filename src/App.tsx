import { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { styled } from '@mui/material/styles';
import Navbar from './components/Navbar';
import FileTree from './components/FileTree';
import FileViewer from './components/FileViewer';
import { analyzeRepo, analyzeFile, setCurrentGitHubRepoInfo } from './services/openRouterService';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

const MainContainer = styled(Box)({
  height: '100vh',
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#1e1e1e',
  overflow: 'hidden',
});

const ContentContainer = styled(Box)({
  display: 'flex',
  flexGrow: 1,
  width: '100%',
  overflow: 'hidden',
});

const Sidebar = styled(Box)({
  width: 300,
  flexShrink: 0,
  borderRight: '1px solid #333333',
  backgroundColor: '#252526',
  overflow: 'auto',
});

const ContentArea = styled(Box)({
  display: 'flex',
  flex: 1,
  backgroundColor: '#1e1e1e',
  overflow: 'auto',
});

function App() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [selectedFileContent, setSelectedFileContent] = useState<string>('Welcome to Repo Analyzer\n\nClick "Open" in the navbar to analyze a GitHub repository.');
  const [fileAnalysis, setFileAnalysis] = useState<string>('');
  const [fileLoading, setFileLoading] = useState(false);

  // No automatic loading of default repository on mount

  useEffect(() => {
    const handleAnalyzeRepo = async (e: Event) => {
      setFileLoading(true);
      try {
        const event = e as CustomEvent<string>;
        setCurrentGitHubRepoInfo(event.detail); // Set repo info for GitHub file fetches
        const fileData = await analyzeRepo(event.detail);
        setFiles(Array.isArray(fileData) ? fileData : []);
      } catch (error) {
        console.error('Error analyzing repo:', error);
        setSelectedFileContent('Error analyzing repository. Please check the URL and try again.');
      } finally {
        setFileLoading(false);
      }
    };

    window.addEventListener('analyze-repo', handleAnalyzeRepo);
    return () => {
      window.removeEventListener('analyze-repo', handleAnalyzeRepo);
    };
  }, []);

  const handleFileSelect = async (filePath: string) => {
    setFileLoading(true);
    try {
      const result = await analyzeFile(filePath);
      setSelectedFileContent(result.content);
      setFileAnalysis(result.analysis);
    } catch (error) {
      console.error('Error analyzing file:', error);
      setSelectedFileContent('Error analyzing file. Please try again.');
      setFileAnalysis('Error analyzing file.');
    } finally {
      setFileLoading(false);
    }
  };

  return (
    <MainContainer>
      <CssBaseline />
      <Navbar />
      <ContentContainer>
        <Sidebar>
          <FileTree files={files} onFileSelect={handleFileSelect} />
        </Sidebar>
        <ContentArea>
          <FileViewer 
            fileContent={selectedFileContent}
            analysis={fileAnalysis}
            loading={fileLoading}
          />
        </ContentArea>
      </ContentContainer>
    </MainContainer>
  );
}

export default App
