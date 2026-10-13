import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingChatWidget from '../components/FloatingChatWidget';

export default function MainLayout({ children }) {
  return (
    <div id="top" className="min-h-screen overflow-x-clip">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <FloatingChatWidget />
    </div>
  );
}
