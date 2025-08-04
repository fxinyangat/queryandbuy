import React, { useState } from 'react';
import { Paper, InputBase, IconButton } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: 600,
        margin: '20px auto'
      }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="What would you like to buy?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <IconButton type="submit" sx={{ p: '10px' }}>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchBar; 