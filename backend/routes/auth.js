const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ WARNING: Supabase credentials missing from .env. Auth features will not work.');
}

const supabase = (supabaseUrl && supabaseKey) 
    ? createClient(supabaseUrl, supabaseKey) 
    : { auth: { signInWithPassword: () => ({ error: { message: 'Supabase credentials missing' } }) } }; // Dummy

// Login Route
router.post('/login', async (req, res) => {
  try {
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

    // Create an admin client to bypass RLS when reading the profile
    const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Get the user's info from a profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('name, role')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    const actualRole = profile?.role || 'teacher';

    if (role && role !== actualRole) {
      return res.status(401).json({ error: 'No User found' });
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

// For Admin: Create/Add User
router.post('/register', async (req, res) => {
  // Only Admin should be allowed here - but that needs verification
  // For now let's just implement the logic
});

module.exports = router;
