export const Footer = () => {
  return (
    <footer className="text-default-300 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="pt-8 flex flex-col md:flex-row justify-center items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-default-400">© {new Date().getFullYear()} MikuOS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};