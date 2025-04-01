// Configuration for different environments
const config = {
	// Your Render backend URL - replace with your actual backend URL
	API_URL: process.env.NODE_ENV === 'production'
		? 'https://mailmerge-pro.onrender.com'
		: 'http://localhost:5001'
};

export default config; 