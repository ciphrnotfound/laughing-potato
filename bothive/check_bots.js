const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBots() {
    const { data, error } = await supabase
        .from('bots')
        .select('id, name, description, created_at')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching bots:', error);
        process.exit(1);
    }

    console.log('--- BOTS LIST ---');
    data.forEach((bot, index) => {
        console.log(`${index + 1}. [${bot.id}] ${bot.name}: ${bot.description} (Created: ${bot.created_at})`);
    });
}

checkBots();
