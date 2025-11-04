import './styles/globals.css';
import Chatbot from './components/chatbot';
import Header from './components/header';
import Footer from './components/footer';

export const metadata = {
  title: 'Safe Haven',
  description: 'Your home comfort awaits',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Chatbot />
        </div>
      </body>
    </html>
  );
}