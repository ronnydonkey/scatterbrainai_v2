import AppHeader from './AppHeader';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout = ({ children }: AuthenticatedLayoutProps) => {
  return (
    <>
      <AppHeader />
      <main>
        {children}
      </main>
    </>
  );
};

export default AuthenticatedLayout;