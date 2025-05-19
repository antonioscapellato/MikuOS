// NextJS
import Head from 'next/head';
import { useRouter } from 'next/router';

// Components
import ChatInput from '@/components/chat/ChatInput';
import { Hero } from '../components/basic/Hero';
import { Features } from '../components/basic/Features';
import { Footer } from '../components/basic/Footer';

// Auth
import { useAuth } from '@/components/auth/AuthProvider';
import { useAuthModal } from '@/context/AuthModalContext';

// SEO
const seoData = {
  title: "Miku - Your Perfect AI Agentic Assistant",
  description: "Miku is an advanced AI agentic assistant designed to understand, learn, and adapt to your needs, working autonomously to help you accomplish tasks with unprecedented efficiency.",
  image: "https://miku.so/miku_logo_white.png",
  url: "https://miku.so",
};

export default function Home() {
  const router = useRouter();

  const { user, loading } = useAuth();
  const { openModal } = useAuthModal();

  const handleSubmit = async (message: string) => {
    if (!user) {
      openModal();
      return;
    }
    
    // Generate a simple slug from the message
    const slug = `${message.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 8)}`;
    
    // Redirect to the chat page with the slug
    router.push(`/chat/${slug}?q=${encodeURIComponent(message)}`);
  };

  return (
    <>
      <Head>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={seoData.image} />
        <meta property="og:url" content={seoData.url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.image} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="overflow-hidden">

        {/* Hero Section */}
        <Hero />

        <div className="max-w-2xl mx-auto">
          <ChatInput onSubmit={handleSubmit} disabled={loading} messages={[]} />
        </div>
        
        {/* Footer */}
        <Footer />

      </main>
    </>
  );
}
