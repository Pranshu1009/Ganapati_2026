import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  function handleSubmit(e) {
    e.preventDefault()
    const result = login(username, password)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="login-screen">
      <div className="login-glow" aria-hidden="true" />
      <form className="login-card reveal" onSubmit={handleSubmit}>
        <div className="login-brand">
          <span className="brand-mark large" aria-hidden="true" />
          <h1>Gokul Dhara Society</h1>
          <p>Ganapati Pandal · Committee Login</p>
        </div>

        <label>
          Username
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setError('')
            }}
            placeholder="Enter username"
            autoComplete="username"
            autoCapitalize="none"
            required
          />
        </label>

        <label>
          Password
          <div className="password-row">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="btn tiny"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn primary wide">
          Login
        </button>

        <p className="login-note">Use the shared committee username and password to continue.</p>
      </form>
    </div>
  )
}
