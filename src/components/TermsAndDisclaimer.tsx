'use client';
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { Link } from '@mui/material'

const TermsAndDisclaimer = () => {
  return <Container>
    <Typography variant="h4" gutterBottom>
      Terms of Use & Disclaimer
    </Typography>

    <Typography variant="body1">
      Last Updated: [14 Jun 2025]
    </Typography>

    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        1. Acceptance of Terms
      </Typography>
      <Typography variant="body1">
        By using this application (MyTradingView), you agree to be bound by these Terms of Use. If you do not accept these terms, you should not use the application.
      </Typography>
    </Box>

    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        2. Informational Purposes Only
      </Typography>
      <Typography variant="body1">
        This application is intended for educational and informational purposes only. It is not intended to provide, and should not be relied upon for, financial, investment, legal, or tax advice.
      </Typography>
    </Box>

    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        3. No Financial Advice
      </Typography>
      <Typography variant="body1">
        The content and tools available through MyTradingView do not constitute financial advice or a recommendation to buy or sell any security. All financial decisions are made at your own risk.
      </Typography>
    </Box>

    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        4. Limitation of Liability
      </Typography>
      <Typography variant="body1">
        To the fullest extent permitted by law, the developers of this application disclaim all liability for any loss or damages resulting from the use or inability to use this application.
      </Typography>
    </Box>

    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        5. Changes to These Terms
      </Typography>
      <Typography variant="body1">
        These terms may be updated periodically. Continued use of the application indicates your acceptance of any changes made.
      </Typography>
    </Box>

    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        6. Contact
      </Typography>
      <Typography variant="body1">
        If you have any questions about these terms, please reach out to us through our{' '}
        <Link href="/contact" underline="hover">
          Contact
        </Link>{' '}
        page.        
      </Typography>
    </Box>
  </Container>
};

export default TermsAndDisclaimer;