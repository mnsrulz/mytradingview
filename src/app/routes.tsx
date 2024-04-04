'use client'
import * as React from 'react';
import Box from '@mui/material/Box';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import {
    MemoryRouter,
    Route,
    Routes,
    matchPath,
    useLocation,
} from 'react-router-dom';

import { StaticRouter } from 'react-router-dom/server';
import { ButtonGroup, Button } from '@mui/material';

function Router(props: { children?: React.ReactNode }) {
    const { children } = props;
    if (typeof window === 'undefined') {
        return <StaticRouter location="/drafts">{children}</StaticRouter>;
    }

    return (
        <MemoryRouter initialEntries={['/drafts']} initialIndex={0}>
            {children}
        </MemoryRouter>
    );
}

function useRouteMatch(patterns: readonly string[]) {
    const { pathname } = useLocation();

    for (let i = 0; i < patterns.length; i += 1) {
        const pattern = patterns[i];
        const possibleMatch = matchPath(pattern, pathname);
        if (possibleMatch !== null) {
            return possibleMatch;
        }
    }

    return null;
}

function MyTabs() {
    // You need to provide the routes in descendant order.
    // This means that if you have nested routes like:
    // users, users/new, users/edit.
    // Then the order should be ['users/add', 'users/edit', 'users'].
    const routeMatch = useRouteMatch(['/inbox/:id', '/drafts', '/trash']);
    const currentTab = routeMatch?.pattern?.path;

    return (
        // <Tabs value={currentTab}>
        //   <Tab label="Inbox" value="/inbox/:id" to="/inbox/1" component={Link} />
        //   <Tab label="Drafts" value="/drafts" to="/drafts" component={Link} />
        //   <Tab label="Trash" value="/trash" to="/trash" component={Link} />
        // </Tabs>
        <ButtonGroup variant="contained" aria-label="Basic button group">
            <Button><Link href="/" className=''>Home</Link></Button>
            <Button><Link href="/trades" className=''>Trades</Link></Button>
            <Button><Link href="/history">History</Link></Button>
        </ButtonGroup>
    );
}

function CurrentRoute() {
    const location = useLocation();

    return (
        <Typography variant="body2" sx={{ pb: 2 }} color="text.secondary">
            Current route: {location.pathname}
        </Typography>
    );
}

export default function TabsRouter() {
    return (
        <Router>
            <Box sx={{ width: '100%', padding: '0px 0px 20px 0px' }} >
                {/* <Routes>
          <Route path="*" element={<CurrentRoute />} />
        </Routes> */}
                <MyTabs />
            </Box>
        </Router>
    );
}