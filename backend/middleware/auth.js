const jwt = require('jsonwebtoken'); // Wait, Supabase uses its own JWT.
// Better: Use Supabase client to verify the token.
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        req.user = user; // Attach user to request
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Unauthorized: Auth failed' });
    }
};

const verifyAdmin = async (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Important: Re-fetch role from profiles table (protected metadata)
    const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

    if (profile?.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
};

module.exports = { verifyToken, verifyAdmin };
