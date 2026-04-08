const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// 1. New Stats API (Admin Only)
router.get('/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { count: creationsCount } = await supabaseAdmin.from('creations').select('*', { count: 'exact', head: true });
    
    // Get downloads from simple tracker (using creations table for metadata for now, or just a dummy until app_stats is ready)
    // Actually simplicity: use a metadata field in creations or a separate table.
    // I'll check a dummy value first then implement real tracking.
    const { data: statsData } = await supabaseAdmin.from('app_stats').select('value').eq('key', 'pdf_downloads').single();
    
    res.json({
        total_creations: creationsCount || 0,
        pdf_downloads: statsData?.value || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Apply verifyToken to all creation routes below
router.use(verifyToken);

// 1.5 Track download (Teacher)
router.post('/track-download', async (req, res) => {
    try {
        const { data } = await supabaseAdmin.from('app_stats').select('value').eq('key', 'pdf_downloads').single();
        const newVal = (data?.value || 0) + 1;
        await supabaseAdmin.from('app_stats').update({ value: newVal }).eq('key', 'pdf_downloads');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to track' });
    }
});

// 1. Save a new creation (Teacher)
router.post('/', async (req, res) => {
  try {
    const { fileName, content, className, subject, topic, subtopic, language } = req.body;
    const userId = req.user.id; // Correct: Use verified ID from token

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('creations')
      .insert({
        user_id: userId,
        file_name: fileName || `${subject}_${topic}_${Date.now()}`,
        content,
        class: className,
        subject,
        topic,
        subtopic,
        language
      })
      .select();

    if (error) {
      console.error('SUPABASE_INSERT_ERROR:', error);
      return res.status(500).json({ error: `Database Error: ${error.message}` });
    }
    res.json(data?.[0] || { message: 'Saved successfully' });
  } catch (err) {
    console.error('SERVER_SAVE_ERROR:', err);
    res.status(500).json({ error: `Internal Server Error: ${err.message}` });
  }
});

// 2. Get my own history (Teacher - Verified session)
router.get('/my', async (req, res) => {
  try {
    const userId = req.user.id; // Only fetch data for the LOGGED IN user
    
    // OPTIMIZATION: Do NOT fetch the large 'content' field in the list view
    const { data, error } = await supabaseAdmin
      .from('creations')
      .select('id, file_name, topic, subject, class, created_at, language')
      .eq('user_id', userId)
      .eq('is_deleted', false) 
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// 2.5 New Route: Get single creation with full content (For viewing/downloading)
router.get('/get/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { data, error } = await supabaseAdmin
      .from('creations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve content' });
  }
});

// 3. Delete my own creation (Teacher - Soft Delete Ownership check)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // IMPORTANT: Verify ownership before deleting
    const { error } = await supabaseAdmin
      .from('creations')
      .update({ is_deleted: true })
      .eq('id', id)
      .eq('user_id', userId); // SECURITY: Ensure user owns this file

    if (error) throw error;
    res.json({ message: 'Moved to trash' });
  } catch (error) {
    console.error('Error deleting creation:', error);
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
