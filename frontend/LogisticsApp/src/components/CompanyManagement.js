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
    <Paper elevation={3} sx={{ padding: '30px', marginBottom: '20px', borderRadius: '10px', backgroundColor: '#f7f9fc' }}>
      <Typography variant="h6" gutterBottom>Управление средствами компании</Typography>
      <Button variant="contained" color="secondary" onClick={handleWithdrawFunds}>
        Вывести средства компании
      </Button>
    </Paper>
  );
}

export default CompanyManagement;
