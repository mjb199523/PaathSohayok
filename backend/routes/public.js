const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// 1. Fetch Lesson Content for SEO Public Pages
router.get('/lesson/:grade/:subject/:topic', async (req, res) => {
    try {
        const { grade, subject, topic } = req.params;

        // Try to find a exact match (case-insensitive search)
        // We replace dashes in URLs back to spaces for DB search if needed
        const dbGrade = grade.replace('class-', 'Class ').replace('-', ' ');
        const dbSubject = subject.replace('-', ' ');
        const dbTopic = topic.replace('-', ' ');

        const { data, error } = await supabaseAdmin
            .from('creations')
            .select('*')
            .ilike('class', `%${dbGrade}%`)
            .ilike('subject', `%${dbSubject}%`)
            .ilike('topic', `%${dbTopic}%`)
            .eq('is_deleted', false)
            .limit(1)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Lesson not found' });
        }

        res.json(data);
    } catch (err) {
        console.error('Public Fetch Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Fetch Related Lessons
router.get('/related/:subject', async (req, res) => {
    try {
        const { subject } = req.params;
        const dbSubject = subject.replace('-', ' ');

        const { data, error } = await supabaseAdmin
            .from('creations')
            .select('id, class, subject, topic, language')
            .ilike('subject', `%${dbSubject}%`)
            .eq('is_deleted', false)
            .limit(5);

        if (error) throw error;
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch related' });
    }
});

// 3. Dynamic Sitemap XML
router.get('/sitemap', async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('creations')
            .select('class, subject, topic, created_at')
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

        if (error) throw error;

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        // Static URLs
        const staticUrls = ['', '/login'];
        staticUrls.forEach(url => {
            xml += '  <url>\n';
            xml += `    <loc>https://www.paathsohayok.in${url}</loc>\n`;
            xml += '    <changefreq>daily</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        // Dynamic URLs
        data.forEach(item => {
            const slug = `learn/${item.class.toLowerCase().replace(' ', '-')}/${item.subject.toLowerCase().replace(' ', '-')}/${item.topic.toLowerCase().replace(' ', '-')}`;
            xml += '  <url>\n';
            xml += `    <loc>https://www.paathsohayok.in/${slug}</loc>\n`;
            xml += `    <lastmod>${new Date(item.created_at).toISOString().split('T')[0]}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.6</priority>\n';
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        res.status(500).send('Error generating sitemap');
    }
});

module.exports = router;
