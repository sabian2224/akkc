import { FormProvider } from '@/contexts/FormContext';
import TopBar from '@/components/TopBar';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import ApplicationForm from '@/components/ApplicationForm';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  return (
    <>
      <header>
        <TopBar />
        <Nav />
        <Hero />
      </header>
      <main>
        <FormProvider>
          <div className="wrap app-shell">
            <ApplicationForm />
            <Sidebar />
          </div>
        </FormProvider>
      </main>
      <Footer />
    </>
  );
}
