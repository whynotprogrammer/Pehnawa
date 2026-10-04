const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://aadllctertzpoizthqsp.supabase.co',
  'sb_publishable_8k_hpX3pkvqRxr0BiazL3w_mxZVVA-j'
);

async function checkProfiles() {
  console.log("Checking profiles table...");
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
}

checkProfiles();
