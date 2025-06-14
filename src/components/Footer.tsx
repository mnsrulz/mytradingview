'use client';
import { Box, Container, Link, Typography } from '@mui/material'
import NextLink from 'next/link'
import GitHubIcon from '@mui/icons-material/GitHub';
import { ghUrl } from '@/lib/constants'
export const Footer = () => {

    return <Box component="footer" my={2}>
        <Container>
            <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
                <Link component={NextLink} href="/contact" underline="hover" color="primary">
                    Contact
                </Link>
                <Link component={NextLink} href="/disclaimer" underline="hover" color="primary">
                    Disclaimer
                </Link>
                {ghUrl && <Link
                    href={'//' + ghUrl}
                    target="_blank"
                    rel="noopener"
                    underline="hover"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                    <GitHubIcon fontSize="small" />
                </Link>
                }
            </Box>
        </Container>
    </Box>
}