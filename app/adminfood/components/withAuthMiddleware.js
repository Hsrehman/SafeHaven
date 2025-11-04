import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const withAuthMiddleware = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const userEmail = localStorage.getItem("userEmail") || sessionStorage.getItem("userEmail");
          
          if (!userEmail) {
            router.push("/adminfood");
            return;
          }
          const regResponse = await fetch(`/api/adminfood/getRegistrationData?email=${encodeURIComponent(userEmail)}`);
          const regResult = await regResponse.json();
          
          if (!regResult.success || !regResult.userData.registrationComplete) {
            router.push("/adminfood/registration");
            return;
          }
          
          setIsAuthorized(true);
        } catch (error) {
          console.error("Auth check failed:", error);
          router.push("/adminfood");
        } finally {
          setLoading(false);
        }
      };
      
      checkAuth();
    }, [router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    return isAuthorized ? <WrappedComponent {...props} /> : null;
  };
};

export default withAuthMiddleware;