import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useState } from 'react';
import RepoDialog from './RepoDialog';

interface NavbarProps {
  repoUrl?: string;
}

const Navbar = ({ repoUrl }: NavbarProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#000', boxShadow: 'none', borderBottom: '1px solid #222' }}>
        <Toolbar variant="dense" sx={{ minHeight: 48, display: 'flex', alignItems: 'center', px: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img src="/favicon.ico" alt="favicon" style={{ width: 26, height: 26, marginRight: 10, marginTop: 1, borderRadius: 4, boxShadow: '0 1px 4px #0002' }} />
            <Typography variant="h6" component="div" sx={{ color: '#fff', fontWeight: 700, fontSize: 20, letterSpacing: 0.5 }}>
              Repo Analyzer (Nathan Moondi DEMO)
            </Typography>
          </Box>
          {repoUrl && (
            <Box sx={{ ml: 2, maxWidth: 500, display: 'flex', alignItems: 'center' }}>
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#4fa3ff',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textDecoration: 'underline',
                  display: 'inline-block',
                  maxWidth: 500,
                }}
                title={repoUrl}
              >
                {repoUrl}
              </a>
            </Box>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Button
            color="primary"
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #1976d2 60%, #1565c0 100%)',
              color: '#fff',
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              boxShadow: 'none',
              textTransform: 'none',
              fontSize: 15,
              ml: 2,
              '&:hover': { background: '#1565c0' },
            }}
            onClick={() => setIsDialogOpen(true)}
          >
            Open
          </Button>
        </Toolbar>
      </AppBar>
      <RepoDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  );
};

export default Navbar;
