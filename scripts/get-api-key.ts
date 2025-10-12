import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hgruvuhrtznijhsqvagn.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncnV2dWhydHpuaWpoc3F2YWduIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAzNTc2MiwiZXhwIjoyMDc1NjExNzYyfQ.PH71ZeC45HPdTa4EIgpEYvMDT_KKG-aGZqyKXmMiUuU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const hashApiKey = (key: string): string => {
  return createHash('sha256').update(key).digest('hex');
};

const generateApiKey = (): string => {
  const randomPart = randomBytes(32).toString('hex');
  return `ltc_${randomPart}`;
};

async function getOrCreateApiKey(email: string, createNew: boolean = false) {
  console.log(`\n🔍 Looking up user: ${email}`);

  // Find user by email in auth.users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error('❌ Error fetching users:', authError);
    return;
  }

  const user = authUsers.users.find(u => u.email === email);

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    return;
  }

  console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

  // Check for existing API key
  const { data: apiKeys, error: keyError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (keyError) {
    console.error('❌ Error fetching API keys:', keyError);
    return;
  }

  if (apiKeys && apiKeys.length > 0) {
    console.log(`\n📊 Existing API key found:`);
    console.log(`   ID: ${apiKeys[0].id}`);
    console.log(`   Name: ${apiKeys[0].name}`);
    console.log(`   Created: ${apiKeys[0].created_at}`);
    console.log(`   Last used: ${apiKeys[0].last_used || 'Never'}`);
    console.log(`\n⚠️  Note: The actual API key cannot be retrieved (only stored as hash)`);

    if (!createNew) {
      console.log(`\n💡 To generate a new API key (this will revoke the old one), run:`);
      console.log(`   yarn tsx scripts/get-api-key.ts ${email} --generate`);
      return;
    }
  } else {
    console.log(`\n📭 No existing API key found`);
  }

  if (createNew) {
    console.log(`\n🔑 Generating new API key...`);

    // Delete old keys
    if (apiKeys && apiKeys.length > 0) {
      const { error: deleteError } = await supabase
        .from('api_keys')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('⚠️  Warning: Failed to delete old keys:', deleteError);
      } else {
        console.log(`✅ Revoked ${apiKeys.length} old API key(s)`);
      }
    }

    // Generate new key
    const newApiKey = generateApiKey();
    const keyHash = hashApiKey(newApiKey);

    const { data: newKeyRecord, error: createError } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        key_hash: keyHash,
        name: 'Default API Key',
      })
      .select()
      .single();

    if (createError || !newKeyRecord) {
      console.error('❌ Error creating API key:', createError);
      return;
    }

    console.log(`\n✅ New API key created successfully!`);
    console.log(`\n🔐 API KEY (save this, you won't see it again):`);
    console.log(`\n   ${newApiKey}\n`);
    console.log(`📋 Key details:`);
    console.log(`   ID: ${newKeyRecord.id}`);
    console.log(`   Name: ${newKeyRecord.name}`);
    console.log(`   Created: ${newKeyRecord.created_at}`);
  }
}

// Parse command line arguments
const email = process.argv[2];
const shouldGenerate = process.argv.includes('--generate');

if (!email) {
  console.error('Usage: yarn tsx scripts/get-api-key.ts <email> [--generate]');
  process.exit(1);
}

getOrCreateApiKey(email, shouldGenerate).catch(console.error);
