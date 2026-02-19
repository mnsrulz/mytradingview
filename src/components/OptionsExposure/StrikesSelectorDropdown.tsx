import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  TextField,
  OutlinedInput,
} from '@mui/material';

type SingleValue = {
  mode: "single";
  value: string | number;
};

type RangeValue = {
  mode: "range";
  from?: string;
  to?: string;
};

export type NumericRangeChange = SingleValue | RangeValue;

interface NumericRangeTextDropdownProps {
  value: string
  onChange: (value: string) => void;
  options: string[] | number[];
}

// Helper for label
function getRangeLabel(value: string) {
  const [min, max] = value.split('-');
  if (max) {
    return `$${min} - $${max}`;
  }
  return `${min}`;
}

export default function StrikesSelectorDropdown({
  onChange,
  options,
  value
}: NumericRangeTextDropdownProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [min, setMin] = useState(value.split('-')[0] || '1');
  const [max, setMax] = useState(value.split('-')[1] || '100');
  const [selectedRange, setSelectedRange] = useState(getRangeLabel(value));
  const isMultiRange = selectedRange.includes('-');
  const [tab, setTab] = useState(0);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (forceTab?: number) => {
    if (forceTab !== undefined) {
      setTab(forceTab);
    } else {
      setTab(isMultiRange ? 1 : 0);
    }
    setAnchorEl(null);
  };

  const handleSingleValueChange = (v: string | number) => {
    setSelectedRange(`${v}`);
    onChange(`${v}`);
    handleClose(0);
  }
  const handleMultiRangeChange = () => {
    const valueToApply = `${min}-${max}`;
    const range = getRangeLabel(valueToApply);
    setSelectedRange(range);
    onChange(valueToApply);
    handleClose(1);
  };

  const handleClear = () => {
    setMin('');
    setMax('');
  };

  return (
    <>
      <FormControl size="small" sx={{ width: isMultiRange ? 120 : 60, maxWidth: 120 }}>
        <InputLabel shrink title='Strikes'>Strikes</InputLabel>
        <OutlinedInput
          readOnly
          value={selectedRange}
          onClick={handleMenuClick}
          label="Strikes"
          sx={{
            cursor: 'pointer',
            '& input': {
              cursor: 'pointer',
            },
          }}
        />
      </FormControl>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={()=>handleClose()} sx={{ p: 0, m: 0 }}>
        <Tabs variant="fullWidth" value={tab} onChange={(_, v) => setTab(v)} sx={{ p: 0, m: 0 }}>
          <Tab label="Strikes" value={0} sx={{ p: 0, m: 0 }}></Tab>
          <Tab label="Custom" value={1} sx={{ p: 0, m: 0 }}></Tab>
        </Tabs>
        {tab == 0 && <Box sx={{ p: 0, width: 240 }}>
          <FormControl fullWidth size="small">
            {options.map((strike) => <MenuItem key={strike} selected={selectedRange === `${strike}`} value={strike} onClick={(ev) => handleSingleValueChange(strike)}>{strike}</MenuItem>)}
          </FormControl>
        </Box>
        }
        {tab == 1 && <Box sx={{ px: 1, pt: 2, pb: 0, width: 240 }}>
          <Box display="flex" gap={1} mb={2}>
            <FormControl fullWidth size="small">
              <TextField
                label="From"
                value={min}
                size='small'
                type='number'
                onChange={e => setMin(e.target.value)}
              />
            </FormControl>
            <Typography mt={1}>-</Typography>
            <FormControl fullWidth size="small">
              <TextField
                label="To"
                value={max}
                size='small'
                type='number'
                onChange={e => setMax(e.target.value)}
              />
            </FormControl>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Button variant="text" onClick={handleClear}>
              Clear
            </Button>
            <Button
              variant="contained"
              onClick={handleMultiRangeChange}
              disabled={(min && max) && (parseInt(min) > parseInt(max)) || false}
            >
              Apply
            </Button>
          </Box>
        </Box>
        }
      </Menu>
    </>
  );
}
