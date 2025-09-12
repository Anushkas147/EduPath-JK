// This endpoint is no longer needed for Google OAuth authentication
export default async function handler(req, res) {
  res.status(404).json({ message: 'Registration is handled through Google OAuth' });
}