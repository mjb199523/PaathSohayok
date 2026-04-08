const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');

// Login Route
router.post('/login', async (req, res) => {
  try {
    if (!supabase || !supabaseAdmin) {
       return res.status(500).json({ error: 'Supabase client not initialized. Check .env' });
    }

    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Get the user's info using the admin client to bypass RLS
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('name, role')
      .eq('id', data.user.id)
      .limit(1);

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Failed to access user profiles', details: profileError.message });
    }

    const profile = profiles?.[0];
    const actualRole = profile?.role || 'teacher';

    if (role && role !== actualRole) {
      return res.status(401).json({ error: 'Role mismatch' });
    }

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name,
        role: actualRole
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// Profile Route
const { verifyToken } = require('../middleware/auth');
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
