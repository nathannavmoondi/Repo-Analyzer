import { Box, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  FolderOutlined,
  InsertDriveFileOutlined,
  ChevronRight,
  ExpandMore,
  Description,
  Code,
  Javascript,
} from '@mui/icons-material';
import { useState } from 'react';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileTreeProps {
  files: FileNode[];
  onFileSelect: (path: string) => void;
}

const TreeContainer = styled(Box)({
  height: '100%',
  backgroundColor: '#232323',
  color: '#cccccc',
  overflow: 'auto',
  paddingTop: '4px',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
});

const StyledListItem = styled(ListItem)({
  padding: '1px 0',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  '&.selected': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
});

const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return <Code sx={{ color: '#3178c6' }} />; // TypeScript blue
    case 'js':
    case 'jsx':
      return <Javascript sx={{ color: '#f7df1e' }} />; // JavaScript yellow
    case 'json':
      return <Description sx={{ color: '#fac863' }} />; // JSON orange
    case 'md':
      return <Description sx={{ color: '#cccccc' }} />; // Markdown white
    default:
      return <InsertDriveFileOutlined sx={{ color: '#cccccc' }} />;
  }
};

const FileTree = ({ files, onFileSelect }: FileTreeProps) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpanded(newExpanded);
  };

  const renderTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <StyledListItem
          className={selected === node.path ? 'selected' : ''}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path);
            } else {
              setSelected(node.path);
              onFileSelect(node.path);
            }
          }}
          sx={{ 
            pl: 2 + depth * 1.5,
            cursor: 'pointer',
          }}
        >
          <ListItemIcon sx={{ minWidth: 28, display: 'flex', alignItems: 'center' }}>
            {node.type === 'folder' && (
              <Box component="span" sx={{ mr: -0.5 }}>
                {expanded.has(node.path) ? (
                  <ExpandMore sx={{ fontSize: 18, color: '#cccccc' }} />
                ) : (
                  <ChevronRight sx={{ fontSize: 18, color: '#cccccc' }} />
                )}
              </Box>
            )}
            {node.type === 'folder' ? (
              <FolderOutlined sx={{ color: '#e3cd4b', fontSize: 20 }} />
            ) : (
              getFileIcon(node.name)
            )}
          </ListItemIcon>
          <ListItemText
            primary={node.name}
            sx={{
              m: 0,
              '& .MuiTypography-root': {
                fontSize: '13px',
                fontFamily: "'SF Mono', Monaco, Menlo, Consolas, 'Ubuntu Mono', monospace",
              },
            }}
          />
        </StyledListItem>
        {node.type === 'folder' && node.children && (
          <Collapse in={expanded.has(node.path)} timeout="auto" unmountOnExit>
            {renderTree(node.children, depth + 1)}
          </Collapse>
        )}
      </div>
    ));
  };

  return (
    <TreeContainer>
      <List disablePadding>
        {renderTree(files)}
      </List>
    </TreeContainer>
  );
};

export default FileTree;
