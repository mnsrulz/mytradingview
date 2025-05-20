import { GridColumnGroupingModel } from '@mui/x-data-grid';

export const dteOptions = [7,
    30,
    50,
    90,
    180,
    400,
    1000];
export const volumeOptions = [
    { value: 100, display: '100' },
    { value: 500, display: '500' },
    { value: 1000, display: '1K' },
    { value: 10000, display: '10K' },
    { value: 50000, display: '50K' },
    { value: 100000, display: '100K' }
];

export const oiOptions = [
    { value: 100, display: '100' },
    { value: 500, display: '500' },
    { value: 1000, display: '1K' },
    { value: 10000, display: '10K' },
    { value: 50000, display: '50K' },
    { value: 100000, display: '100K' }
];

export const columnGroupingModel: GridColumnGroupingModel = [
    {
        groupId: 'Delta Exposure',
        description: '',
        children: [
            { field: 'call_delta' },
            { field: 'put_delta' },
            { field: 'call_put_dex_ratio' }
        ],
    },
    {
        groupId: 'Gamma Exposure',
        children: [
            { field: 'call_gamma' },
            { field: 'put_gamma' },
            { field: 'net_gamma' },
        ],
    },
    {
        groupId: 'Volume',
        children: [
            { field: 'call_volume' },
            { field: 'put_volume' },
            { field: 'call_put_volume_ratio' },
        ],
    },
    {
        groupId: 'Open Interest',
        children: [
            { field: 'call_oi' },
            { field: 'put_oi' },
            { field: 'call_put_oi_ratio' },
        ],
    },
];

