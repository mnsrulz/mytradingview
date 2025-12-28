import { Navigation } from "@toolpad/core/AppProvider";
import HomeIcon from '@mui/icons-material/Home';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InsightsIcon from '@mui/icons-material/Insights';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FunctionsIcon from '@mui/icons-material/Functions';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CalculateIcon from '@mui/icons-material/Calculate';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TimelineIcon  from '@mui/icons-material/Timeline';
import BorderVerticalIcon  from '@mui/icons-material/BorderVertical';
// or
import TrackChangesIcon from '@mui/icons-material/TrackChanges';

const pages = [
    { title: 'Home', href: '/' },
    { title: 'Trades', href: '/trades' },
    { title: 'Option analyzer', href: '/options/analyze' },
    { title: 'Option pricing', href: '/options/pricing' },
    { title: 'History', href: '/history' },
    { title: 'Seasonal', href: '/seasonal' },
    { title: 'Greeks Report', href: '/reports/greeks' },
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
        segment: 'options/iv',
        title: 'IV',
        icon: <ElectricBoltIcon />,
        pattern: 'options/iv'
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
                segment: 'greeks',
                title: 'Greeks',
                icon: <FunctionsIcon />,
            },
            {
                segment: 'oi-anomaly',
                title: 'OI Anomaly',
                icon: <WarningAmberIcon />, // or <ReportProblemIcon />
                // icon: <ReportProblemIcon />
            },
            {
                segment: 'oi',
                title: 'OI Historical',
                icon: <TimelineIcon />
            },
            {
                segment: 'greek-walls',
                title: 'Greek Walls',
                icon: <BorderVerticalIcon />
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

export const ADMIN_NAVIGATION: Navigation = NAVIGATION.concat([
    {
        kind: 'header',
        title: 'Admin',
    },
    {
        segment: 'admin/contacts',
        title: 'Contacts',
        icon: <FunctionsIcon />,
    },
    {
        segment: 'admin/live-tracker',
        title: 'Live Tracker',
        icon: <TrackChangesIcon />,
    }
]);