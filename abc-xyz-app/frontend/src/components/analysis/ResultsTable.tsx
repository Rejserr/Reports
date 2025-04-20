import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  TextField,
  InputAdornment,
  Typography
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface ResultsTableProps {
  data: any[];
  title?: string;
}

type Order = 'asc' | 'desc';

const ResultsTable: React.FC<ResultsTableProps> = ({ data, title }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<string>('turnover');
  const [order, setOrder] = useState<Order>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  // Filter data based on search term
  const filteredData = data.filter(item => 
    item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];
    
    if (order === 'asc') {
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      }
      return aValue - bValue;
    } else {
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return bValue.localeCompare(aValue);
      }
      return bValue - aValue;
    }
  });
  
  // Get color for ABC and XYZ chips
  const getABCColor = (abc: string) => {
    switch (abc) {
      case 'A': return 'success';
      case 'B': return 'primary';
      case 'C': return 'error';
      default: return 'default';
    }
  };
  
  const getXYZColor = (xyz: string) => {
    switch (xyz) {
        case 'X': return 'info';
        case 'Y': return 'warning';
        case 'Z': return 'error';
        default: return 'default';
      }
    };
    
    return (
      <Box>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search by item code or description..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="small"
          />
        </Box>
        
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'abc'}
                    direction={orderBy === 'abc' ? order : 'asc'}
                    onClick={() => handleRequestSort('abc')}
                  >
                    ABC
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'xyz'}
                    direction={orderBy === 'xyz' ? order : 'asc'}
                    onClick={() => handleRequestSort('xyz')}
                  >
                    XYZ
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'turnover'}
                    direction={orderBy === 'turnover' ? order : 'asc'}
                    onClick={() => handleRequestSort('turnover')}
                  >
                    Turnover
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'quantity'}
                    direction={orderBy === 'quantity' ? order : 'asc'}
                    onClick={() => handleRequestSort('quantity')}
                  >
                    Quantity
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'coefficient'}
                    direction={orderBy === 'coefficient' ? order : 'asc'}
                    onClick={() => handleRequestSort('coefficient')}
                  >
                    Coefficient (%)
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow
                    key={row.item}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    hover
                  >
                    <TableCell component="th" scope="row">
                      {row.item}
                    </TableCell>
                    <TableCell>{row.description}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.abc} 
                        size="small" 
                        color={getABCColor(row.abc) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={row.xyz} 
                        size="small" 
                        color={getXYZColor(row.xyz) as any}
                      />
                    </TableCell>
                    <TableCell align="right">{row.turnover.toLocaleString()}</TableCell>
                    <TableCell align="right">{row.quantity.toLocaleString()}</TableCell>
                    <TableCell align="right">{row.coefficient}%</TableCell>
                  </TableRow>
                ))}
              {sortedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    );
  };
  
  export default ResultsTable;
  
