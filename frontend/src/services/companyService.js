import api from './api'

const buildForm = (fileField, file) => {
  const form = new FormData()
  form.append(fileField, file)
  return form
}

const register = async (payload) => {
  const { companyName, addressLine1, addressLine2, city, state, country, postalCode, website, industry } = payload
  const address = [addressLine1, addressLine2].filter(Boolean).join(', ')
  const body = {
    company_name: companyName,
    address,
    city,
    state,
    country,
    postal_code: postalCode,
    website,
    industry,
  }
  const res = await api.post('/api/company/register/', body)
  return res.data
}

const getProfile = async () => {
  const res = await api.get('/api/company/profile/')
  return res.data
}

const updateProfile = async (payload) => {
  const res = await api.put('/api/company/profile/', payload)
  return res.data
}

const updateCompanyInfo = async (companyName, description) => {
  const body = { company_name: companyName, description }
  const res = await api.patch('/api/company/profile/', body)
  return res.data
}

const updateFoundingInfo = async (payload) => {
  const body = {
    founded_date: payload.yearOfEstablishment,
    website: payload.companyWebsite,
    description: payload.companyVision,
  }
  const res = await api.patch('/api/company/profile/', body)
  return res.data
}

const updateSocialLinks = async (socialLinks) => {
  const body = { social_links: socialLinks }
  const res = await api.patch('/api/company/profile/', body)
  return res.data
}

const uploadLogo = async (file) => {
  const form = buildForm('logo', file)
  const res = await api.post('/api/company/upload-logo/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

const uploadBanner = async (file) => {
  const form = buildForm('banner', file)
  const res = await api.post('/api/company/upload-banner/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

const companyService = {
  register,
  getProfile,
  updateProfile,
  updateCompanyInfo,
  updateFoundingInfo,
  updateSocialLinks,
}

export default companyService