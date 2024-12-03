// src/components/CompanyManagement.js
import React from 'react';
import { Typography, Paper, Button } from '@mui/material';
import { toast } from 'react-toastify';

function CompanyManagement({ contract, accounts }) {
  const handleWithdrawFunds = async () => {
    try {
      await contract.methods
        .withdrawCompanyFunds()
        .send({ from: accounts[0] });

      toast.success('Средства успешно выведены!');
    } catch (error) {
      console.error('Ошибка при выводе средств:', error);
      toast.error('Ошибка при выводе средств. Проверьте консоль для деталей.');
    }
  };

  return (
    <Paper style={{ padding: '20px', marginBottom: '30px' }}>
      <Typography variant="h6" gutterBottom>Управление средствами компании</Typography>
      <Button variant="contained" color="secondary" onClick={handleWithdrawFunds}>
        Вывести средства компании
      </Button>
    </Paper>
  );
}

export default CompanyManagement;
