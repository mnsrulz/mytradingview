import { Navigation } from "@toolpad/core/AppProvider";
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import LayersIcon from '@mui/icons-material/Layers';
import HomeIcon from '@mui/icons-material/Home';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TocIcon from '@mui/icons-material/Toc';
import InsightsIcon from '@mui/icons-material/Insights';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FunctionsIcon from '@mui/icons-material/Functions';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalculateIcon from '@mui/icons-material/Calculate';

const pages = [
    { title: 'Home', href: '/' },
    { title: 'Trades', href: '/trades' },
    { title: 'Option analyzer', href: '/options/analyze' },
    { title: 'Option pricing', href: '/options/pricing' },
    { title: 'History', href: '/history' },
    { title: 'Seasonal', href: '/seasonal' },
    { title: 'Greeks Report', href: '/reports/OptionGreeksSummary' },
    { title: 'Calculator', href: '/calculator' }
];

export const NAVIGATION: Navigation = [
    {
        segment: '',
        title: 'Home',
        icon: <HomeIcon />,
    },
    {
        segment: 'trades',
        title: 'Trades',
        icon: <TrendingUpIcon />,
    },
    {
        kind: 'divider',
    },
    {
        kind: 'header',
        title: 'Options'        
    },
    {
        segment: 'options/analyze',
        title: 'DEX/GEX',
        icon: <InsightsIcon />,
        pattern: 'options/analyze{/:symbol}*'
    },
    {
        segment: 'options/pricing',
        title: 'Pricing',
        icon: <AttachMoneyIcon />,
        pattern: 'options/pricing{/:symbol}*'
    },
    {
        kind: 'divider',
    },
    {
        kind: 'header',
        title: 'Analytics',
    },
    {
        segment: 'reports',
        title: 'Reports',
        icon: <AssessmentIcon />,
        children: [
            {
                segment: 'OptionGreeksSummary',
                title: 'Greeks',
                icon: <FunctionsIcon />,
            },
        ],
    },
    {
        segment: 'seasonal',
        title: 'Seasonal',
        icon: <CalendarMonthIcon />,
    },    
    {
        segment: 'history',
        title: 'History',
        icon: <AssessmentIcon />,
    },
    {
        segment: 'calculator',
        title: 'Calculator',
        icon: <CalculateIcon />,
    },
];