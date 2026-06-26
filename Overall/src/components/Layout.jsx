import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="pt-16">
                <div className="px-4 py-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;