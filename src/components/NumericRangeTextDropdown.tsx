import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Typography,
  Box,
  FormControl,
  Select,
  InputLabel,
} from '@mui/material';

interface NumericRangeTextDropdownProps {
  from?: string;
  to?: string;
  onChange: (from?: string, to?: string) => void;
  options: string[] | number[];
}

// Helper for label
function getRangeLabel(min?: string, max?: string) {
  if (min && !max) return `${min} days or more`;
  if (!min && max) return `${max} days or less`;
  if (min && max && min === max) return `${min} days`;
  if (min && max) return `${min} - ${max} days`;
  return '';
}

export default function NumericRangeTextDropdown({
  from,
  to,
  onChange,
  options
}: NumericRangeTextDropdownProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [min, setMin] = useState(from);
  const [max, setMax] = useState(to);
  const [selectedRange, setSelectedRange] = useState('');

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    const range = getRangeLabel(min, max);
    setSelectedRange(range);
    onChange(min, max);
    handleClose();
  };

  const handleClear = () => {
    setMin('');
    setMax('');
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleClick}
        sx={{
          textTransform: 'none'
        }}
      >
        {/* DTE {getRangeLabel(min, max)} */}
        DTE {selectedRange}
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <Box sx={{ p: 2, width: 240 }}>
          {/* <Typography variant="subtitle2" gutterBottom>
            DAYS TO EXPIRATION
          </Typography> */}
          <Box display="flex" gap={1} mb={2}>
            <FormControl fullWidth size="small">
              <InputLabel>From</InputLabel>
              <Select
                value={min}
                label="From"
                onChange={(e) => setMin(e.target.value)}
              >
                {options.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography mt={1}>-</Typography>
            <FormControl fullWidth size="small">
              <InputLabel>To</InputLabel>
              <Select
                value={max}
                label="To"
                onChange={(e) => setMax(e.target.value)}
              >
                {options.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Button variant="text" onClick={handleClear}>
              Clear
            </Button>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={(min && max) && (parseInt(min) > parseInt(max)) || false}
            >
              Apply
            </Button>
          </Box>
        </Box>
      </Menu>
    </>
  );
}
