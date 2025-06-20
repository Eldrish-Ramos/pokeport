import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import './Login.css'

const LOGIN_MUTATION = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(identifier: $identifier, password: $password) {
      token
      theme
    }
  }
`

export default function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const { setTheme } = useTheme()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data } = await login({ variables: form })
      localStorage.setItem('token', data.login.token)
      window.dispatchEvent(new Event('authchange'))
      setTheme(data.login.theme || 'default') // Apply user's theme immediately
      setSuccess(true)
      setTimeout(() => navigate('/'), 1000)
    } catch {}
  }

  return (
    <div className="auth-bg d-flex align-items-center justify-content-center min-vh-100">
      <form className="auth-card card shadow-lg p-4" onSubmit={handleSubmit}>
        <h2 className="mb-4 text-center text-danger fw-bold">Login</h2>
        <div className="mb-3">
          <label className="form-label text-light">Username or Email</label>
          <input
            type="text"
            name="identifier"
            className="form-control"
            required
            value={form.identifier}
            onChange={handleChange}
            autoComplete="username"
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-light">Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            required
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
        </div>
        <button
          type="submit"
          className="btn btn-danger w-100 fw-bold"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div className="alert alert-danger mt-3">{error.message}</div>}
        {success && <div className="alert alert-success mt-3">Login successful! Redirecting...</div>}
        <div className="text-center mt-3">
          <span className="text-light">Don't have an account? </span>
          <a href="/register" className="text-danger fw-bold">Register</a>
        </div>
      </form>
    </div>
  )
}