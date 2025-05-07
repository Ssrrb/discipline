import { UserButton } from "@clerk/nextjs";

const Navbar = () => {
  return (
    <nav className="flex items-center ml-auto">
      <div className="flex items-center">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              userButtonAvatarBox: "w-12 h-12 md:w-14 md:h-14 transition-transform hover:scale-105 border-2 border-gray-200 shadow-lg",
            },
          }}
        />
      </div>
    </nav>
  );
};

export default Navbar;
