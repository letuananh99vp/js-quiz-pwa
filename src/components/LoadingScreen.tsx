const LoadingScreen = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <img
        src="pwa-512x512.png"
        alt="Logo"
        className="w-12 h-12 rounded-xl  animate-bounce"
      />
    </div>
  );
};

export default LoadingScreen;
