'use client';
import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'

export default function Page() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResponse(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (res.ok) {
        setResponse({ type: 'success', message: 'Message sent successfully!' })
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setResponse({ type: 'error', message: data.error || 'Something went wrong.' })
      }
    } catch (error) {
      setResponse({ type: 'error', message: 'Failed to send message.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        Contact Us
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Name"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
        />
        <TextField
          label="Subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
        />
        <TextField
          label="Message"
          name="message"
          required
          multiline
          rows={5}
          value={form.message}
          onChange={handleChange}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </Button>

        {response && (
          <Alert severity={response.type} sx={{ mt: 2 }}>
            {response.message}
          </Alert>
        )}
      </Box>
    </Container>
  )
}