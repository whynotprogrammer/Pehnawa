const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://aadllctertzpoizthqsp.supabase.co',
  'sb_publishable_8k_hpX3pkvqRxr0BiazL3w_mxZVVA-j'
);

async function test() {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'bhavyaa036@gmail.com',
      password: 'password123',
    });
    console.log('Data:', data);
    console.log('Error:', error);
  } catch (err) {
    console.error('Exception:', err);
  }
}
test();
