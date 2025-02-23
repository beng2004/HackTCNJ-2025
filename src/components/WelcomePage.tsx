import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return <button className="w-full bg-[#7B3F00] text-white rounded-md py-2 px-4 hover:bg-[#5d2f00] 
  transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5
  disabled:bg-[#7B3F00]/50 disabled:cursor-not-allowed" onClick={() => loginWithRedirect()}>Log In</button>;
};

const WelcomePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#deb887]">
      {/* Cork board background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            radial-gradient(circle at 25px 25px, rgba(0,0,0,0.2) 2%, transparent 0%),
            radial-gradient(circle at 75px 75px, rgba(0,0,0,0.2) 2%, transparent 0%)
          `,
          backgroundSize: '100px 100px',
        }} />
      </div>

      <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-md transform transition-all hover:scale-[1.02] border-2 border-[#7B3F00]">
        {/* Decorative pushpins */}
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-red-500 rounded-full shadow-lg" />
        <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-500 rounded-full shadow-lg" />
        
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-[#7B3F00]">Digital Bulletin Board</h1>
          
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              Your virtual space for sharing ideas, announcements, and memories.
            </p>
            <p className="text-sm text-gray-500">
              Pin notes, share flyers, and collaborate with others in real-time.
            </p>
          </div>

          <div className="bg-[#fff8dc] p-6 rounded-lg border border-[#deb887] shadow-inner">
            <p className="text-[#7B3F00] font-medium mb-4">
              Ready to get started?
            </p>
                 <LoginButton />
          </div>

          <div className="pt-4 text-sm text-gray-500">
            <p>Powered by Auth0 secure authentication</p>
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-8">
        <div className="bg-white/90 p-4 rounded-lg shadow-lg">
          <p className="text-[#7B3F00] font-medium">✨ Create sticky notes</p>
        </div>
        <div className="bg-white/90 p-4 rounded-lg shadow-lg">
          <p className="text-[#7B3F00] font-medium">📌 Share flyers</p>
        </div>
        <div className="bg-white/90 p-4 rounded-lg shadow-lg">
          <p className="text-[#7B3F00] font-medium">🤝 Collaborate</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;