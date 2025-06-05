import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useState } from 'react';
import RepoDialog from './RepoDialog';

const Navbar = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1e1e1e' }}>
        <Toolbar variant="dense">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#ffffff' }}>
            Repo Analyzer
          </Typography>
          <Button color="inherit" onClick={() => setIsDialogOpen(true)}>
            Open
          </Button>
        </Toolbar>
      </AppBar>
      <RepoDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  );
};

export default Navbar;
