const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:5000/api/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password
      })
    });
    
    if (!response.ok) {
      throw new Error('Signup failed');
    }
    
    const data = await response.json();
    // Handle successful signup
  } catch (error) {
    console.error('Error:', error);
    // Handle error appropriately
  }
}; 