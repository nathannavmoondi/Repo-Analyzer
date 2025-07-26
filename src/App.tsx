import { useState, useEffect } from 'react';
import { Box, CssBaseline, Button, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import Navbar from './components/Navbar';
import FileTree from './components/FileTree';
import FileViewer from './components/FileViewer';
import { analyzeRepo, analyzeFile, setCurrentGitHubRepoInfo } from './services/openRouterService';
import { useRef } from 'react';

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

// Resizable sidebar styles
const Sidebar = styled(Box)({
  width: 220,
  minWidth: 140,
  maxWidth: 400,
  flexShrink: 0,
  borderRight: '1px solid #333333',
  backgroundColor: '#252526',
  overflow: 'auto',
  resize: 'horizontal',
  cursor: 'ew-resize',
  transition: 'width 0.15s',
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
  const [repoUrl, setRepoUrl] = useState<string>('https://github.com/nathannavmoondi/Rapid-Training');
  const [slidedeckLoading, setSlidedeckLoading] = useState(false);
  const [slidedeckContent, setSlidedeckContent] = useState<string | null>(null);

  // Automatically load default repository on mount
  useEffect(() => {
    const defaultUrl = 'https://github.com/nathannavmoondi/Repo-Analyzer';
    const loadDefaultRepo = async () => {
      setFileLoading(true);
      try {
        setRepoUrl(defaultUrl);
        setCurrentGitHubRepoInfo(defaultUrl);
        const fileData = await analyzeRepo(defaultUrl);
        setFiles(Array.isArray(fileData) ? fileData : []);
        setSelectedFileContent('Repo Loaded!\n\nOnboarding tool to help you learn a repo.\nPlease click a file. Code will appear here');
        setFileAnalysis('');
      } catch (error) {
        console.error('Error analyzing repo:', error);
        setSelectedFileContent('Error analyzing repository. Please check the URL and try again.');
        setRepoUrl('');
      } finally {
        setFileLoading(false);
      }
    };

    loadDefaultRepo();

    const handleAnalyzeRepo = async (e: Event) => {
      setFileLoading(true);
      try {
        const event = e as CustomEvent<string>;
        const url = event.detail.trim();
        // Only allow GitHub URLs
        if (!/^https:\/\/github\.com\//i.test(url)) {
          setSelectedFileContent('Only GitHub repository URLs are supported.');
          setFiles([]);
          setRepoUrl('');
          setFileLoading(false);
          return;
        }
        setRepoUrl(url);
        setCurrentGitHubRepoInfo(url); // Set repo info for GitHub file fetches
        const fileData = await analyzeRepo(url);
        setFiles(Array.isArray(fileData) ? fileData : []);
        setSelectedFileContent('Repo Loaded!\n\nPlease click a file to learn more about it');
        setFileAnalysis('');
      } catch (error) {
        console.error('Error analyzing repo:', error);
        setSelectedFileContent('Error analyzing repository. Please check the URL and try again.');
        setRepoUrl('');
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
    setSlidedeckContent(null); // Hide slidedeck if selecting a file
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

  // Slidedeck handler
  const handleSlidedeck = async () => {
    setSlidedeckLoading(true);
    setSlidedeckContent(null);
    try {
      const { createSlidedeckForRepo } = await import('./services/openRouterService');
      const result = await createSlidedeckForRepo(repoUrl);
      setSlidedeckContent(result);
    } catch (e) {
      console.error('Slidedeck error:', e);
      setSlidedeckContent('Error generating slidedeck.');
    } finally {
      setSlidedeckLoading(false);
    }
  };

  return (
    <MainContainer>
      <CssBaseline />
      <Navbar repoUrl={repoUrl} />
      <ContentContainer sx={{ pb: '56px' }}>
        <Sidebar sx={{ background: '#232323', borderRight: '1px solid #333', p: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Slidedeck Button at the top of the sidebar */}
          <Button
            variant="contained"
            sx={{
              background: '#ffe066',
              color: '#111',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 1,
              mt: 2,
              mb: 2,
              ml: 2,
              boxShadow: 'none',
              textTransform: 'none',
              fontSize: 16,
              alignSelf: 'flex-start',
              '&:hover': { background: '#ffd700' },
            }}
            onClick={handleSlidedeck}
            // disabled={slidedeckLoading || fileLoading}
          >
            {slidedeckLoading ? 'Generating...' : 'Slidedeck'}
          </Button>
          <FileTree
            files={files}
            onFileSelect={handleFileSelect}
          />
        </Sidebar>
        <ContentArea>
          {slidedeckLoading ? (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress sx={{ color: '#007acc' }} />
            </Box>
          ) : slidedeckContent ? (
            <Box sx={{ width: '100%', height: '100%', background: '#1e1e1e', color: '#fff', p: 3, overflow: 'auto' }}>
              <div dangerouslySetInnerHTML={{ __html: slidedeckContent }} />
            </Box>
          ) : (
            <FileViewer 
              fileContent={selectedFileContent}
              analysis={fileAnalysis}
              loading={fileLoading}
              repoUrl={repoUrl}
            />
          )}
        </ContentArea>
      </ContentContainer>
      <Box sx={{ width: '100vw', background: 'linear-gradient(90deg, #1976d2 60%, #1565c0 100%)', color: '#fff', textAlign: 'center', py: 1.5, fontSize: 15, fontWeight: 500, letterSpacing: 0.2, position: 'fixed', left: 0, bottom: 0, zIndex: 1200 }}>
        © 2025 Repo Analyzer AI - Nathan Nav Moondi and Happy Dappy Technologies. All rights reserved.
      </Box>
    </MainContainer>
  );
}

export default App
