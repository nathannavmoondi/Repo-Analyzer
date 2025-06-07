import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { useState } from 'react';

interface RepoDialogProps {
  open: boolean;
  onClose: () => void;
}

const RepoDialog = ({ open, onClose }: RepoDialogProps) => {

  const [repoUrl, setRepoUrl] = useState('');
  const handleSubmit = async () => {
    // If no URL provided, use default, but only when Analyze is clicked
    const url = repoUrl.trim() || 'https://github.com/nathannavmoondi/Resume-Qualify-Demo';
    onClose();
    window.dispatchEvent(new CustomEvent('analyze-repo', { 
      detail: url 
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>      <DialogTitle>Open PUBLIC Github Repository</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="GitHub Repository URL"
          type="text"
          fullWidth
          variant="outlined"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/nathannavmoondi/Resume-Qualify-Demo"
          helperText="Enter a GitHub repository URL (or press ENTER)"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Analyze
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RepoDialog;
