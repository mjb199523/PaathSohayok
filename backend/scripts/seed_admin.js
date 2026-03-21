const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seedAdmin() {
  const email = 'manashjyoti.barman07@gmail.com';
  const password = 'Manash123!@#';
  const name = 'Manashjyoti Barman';

  console.log(`🚀 Creating Admin: ${email}...`);

  try {
    // 1. Create User in Auth
    const { data: user, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('ℹ️ User already exists in Auth.');
      } else {
        throw authError;
      }
    }

    const userId = user?.user?.id || (await supabaseAdmin.from('profiles').select('id').eq('email', email).single()).data?.id;

    if (!userId) {
        console.error('❌ Could not determine User ID.');
        return;
    }

    // 2. Add/Update Profile with Admin role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: userId, 
        name, 
        email, 
        role: 'admin' 
      });

    if (profileError) throw profileError;

    console.log('✅ Admin account seeded successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('Role: admin');
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  }
}

seedAdmin();
