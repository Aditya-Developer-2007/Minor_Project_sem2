const test = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Script User',
        email: 'script@test.com',
        password: 'password123'
      })
    });
    const data = await response.json();
    console.log('Registration Status:', response.status);
    console.log('Registration Data:', data);
  } catch (err) {
    console.error('Registration Failed:', err.message);
  }
};

test();
