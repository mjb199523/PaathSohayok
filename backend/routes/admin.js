const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Apply Global Auth to all Admin routes
router.use(verifyToken);
router.use(verifyAdmin);

// Create User (Admin Only)
router.post('/users', verifyAdmin, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    // Add profile data (name, role, content_limit)
    console.log('Creating profile with limit:', req.body.content_limit);
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: user.user.id, 
        name, 
        role, 
        email,
        content_limit: parseInt(req.body.content_limit) || 0,
        content_count: 0
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return res.status(500).json({ error: 'Failed to create profile. Ensure database schema is up to date.' });
    }

    res.json({ message: 'User created successfully', user: user.user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// List Users
router.get('/users', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('profiles').select('*');

    if (error) {
       return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete User
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete from profiles
    const { error: profileError } = await supabaseAdmin.from('profiles').delete().eq('id', id);
    if (profileError) {
      return res.status(500).json({ error: 'Failed to delete profile' });
    }

    // Delete from auth.admin
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      return res.status(500).json({ error: 'Failed to delete user from auth' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
     res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update User (Edit)
router.put('/users/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, content_limit } = req.body;

    // 1. Update Auth user if password or email changed (Needs proper Supabase Admin method, email update handles separately)
    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    
    if (Object.keys(updateData).length > 0) {
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updateData);
      if (authError) return res.status(400).json({ error: authError.message });
    }

    // 2. Update Profile
    const profileUpdateData = {};
    if (name) profileUpdateData.name = name;
    
    // Safety check: Prevent changing own role or email to avoid lockouts/confusion
    if (id === req.user.id) {
        if (role && role !== 'admin') {
            return res.status(400).json({ error: 'Admins cannot demote themselves. Contact another admin for role changes.' });
        }
    } else {
        if (role) profileUpdateData.role = role;
        if (email) profileUpdateData.email = email;
    }
    
    if (content_limit !== undefined) {
      console.log('Updating content_limit to:', content_limit);
      profileUpdateData.content_limit = parseInt(content_limit) || 0;
      profileUpdateData.content_count = 0; // Reset count on limit update/refresh
    }

    if (Object.keys(profileUpdateData).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', id);
        
      if (profileError) {
        console.error('Profile update error:', profileError);
        return res.status(500).json({ error: 'Failed to update user profile. Check database logs for details.' });
      }
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// --- New Global File Management ---

// 1. List ALL teacher-generated creations with user details
router.get('/creations', verifyAdmin, async (req, res) => {
  try {
    // OPTIMIZATION: Do NOT fetch the large 'content' field in the global list
    const { data, error } = await supabaseAdmin
      .from('creations')
      .select('id, file_name, class, subject, topic, language, created_at, profiles(name, email)') 
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching global creations:', error);
    res.status(500).json({ error: 'Failed to fetch global creations' });
  }
});

// 3. Get single creation with full content (Admin)
router.get('/creations/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('creations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve content' });
  }
});

// 4. Global hard delete (Admin can delete ANY creation)
router.delete('/creations/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin
      .from('creations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Deleted successfully (Global)' });
  } catch (error) {
    console.error('Error in global delete:', error);
    res.status(500).json({ error: 'Failed to delete creation globally' });
  }
});

module.exports = router;
