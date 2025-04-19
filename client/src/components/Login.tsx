const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Login = () => {
  const handleLogin = () => {
    window.location.href = `${backendUrl}/login`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-black text-white">
      <div className="text-center space-y-8 px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-md">
          🎧 Jam Together
        </h1>
        <p className="text-lg md:text-xl max-w-xl mx-auto text-gray-300">
          Collaborate on playlists with your friends in real-time. Search, vote,
          and vibe together.
        </p>
        <button
          onClick={handleLogin}
          className="bg-green-500 hover:bg-green-600 text-white text-lg font-semibold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105"
        >
          Login with Spotify
        </button>
      </div>
    </div>
  );
};

export default Login;
