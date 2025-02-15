import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';

function Header({ currentAccount, handleTabChange, currentTab }) {
  // Функция для обрезки адреса аккаунта
  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <AppBar position="static" elevation={1} sx={{ backgroundColor: '#ffffff', color: '#333' }}>

      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Logistics App
        </Typography>
        <Box>
          <Typography variant="body1" style={{ marginRight: '20px' }}>
            Аккаунт: {truncateAddress(currentAccount)}
          </Typography>
          {/* Можно добавить дополнительные кнопки или меню здесь */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
