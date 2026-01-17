import api from './api'

const login = async (email, password) => {
  const res = await api.post('/api/auth/login/', { email, password })
  if (res.data?.data?.access_token) {
    localStorage.setItem('access_token', res.data.data.access_token)
    localStorage.setItem('refresh_token', res.data.data.refresh_token)
    localStorage.setItem('user', JSON.stringify(res.data.data.user))
  }
  return res.data
}

const register = async (payload) => {
  const { email, password, full_name, mobile_no, gender } = payload
  const res = await api.post('/api/auth/register/', {
    email,
    password,
    full_name,
    mobile_no,
    gender,
    signup_type: 'email'
  })
  if (res.data?.data?.access_token) {
    localStorage.setItem('access_token', res.data.data.access_token)
    localStorage.setItem('refresh_token', res.data.data.refresh_token)
    localStorage.setItem('user', JSON.stringify(res.data.data.user))
  }
  return res.data
}

const logout = () => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

const getToken = () => localStorage.getItem('access_token')

const updateProfile = async (payload) => {
  const res = await api.patch('/api/auth/profile/', payload)
  if (res.data?.data?.user) {
    localStorage.setItem('user', JSON.stringify(res.data.data.user))
  }
  return res.data
}

const changePassword = async (currentPassword, newPassword) => {
  const res = await api.post('/api/auth/change-password/', {
    current_password: currentPassword,
    new_password: newPassword,
  })
  return res.data
}

const deleteAccount = async (password) => {
  const res = await api.post('/api/auth/delete-account/', {
    password,
  })
  if (res.data?.success) {
    logout()
  }
  return res.data
}

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  getToken,
  updateProfile,
  changePassword,
  deleteAccount,
}

export default authService
