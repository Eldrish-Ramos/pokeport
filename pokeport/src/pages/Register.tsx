import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { useNavigate } from 'react-router-dom'
import './Register.css'

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      id
      username
      email
    }
  }
`

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [register, { loading, error }] = useMutation(REGISTER_MUTATION)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register({ variables: form })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch {}
  }

  return (
    <div className="auth-bg d-flex align-items-center justify-content-center min-vh-100">
      <form className="auth-card card shadow-lg p-4" onSubmit={handleSubmit}>
        <h2 className="mb-4 text-center text-danger fw-bold">Register</h2>
        <div className="mb-3">
          <label className="form-label text-light">Username</label>
          <input
            type="text"
            name="username"
            className="form-control"
            required
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
          />
        </div>
        <div className="mb-3">
          <label className="form-label text-light">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            required
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
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
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          className="btn btn-danger w-100 fw-bold"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <div className="alert alert-danger mt-3">{error.message}</div>}
        {success && <div className="alert alert-success mt-3">Registration successful! Redirecting...</div>}
        <div className="text-center mt-3">
          <span className="text-light">Already have an account? </span>
          <a href="/login" className="text-danger fw-bold">Login</a>
        </div>
      </form>
    </div>
  )
}