'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);

  const carouselItems = [
    
    {
      image: '/outreach.jpg', 
      title: "Making a Difference",
      description: "Our volunteers work tirelessly to provide support to those in need."
    },
    {
      image: '/shelter.jpg', 
      title: "Safe Places to Rest",
      description: "We provide clean, comfortable shelter spaces for those seeking refuge."
    },
    {
      image: '/foodbank.jpg', 
      title: "Food Security",
      description: "Access to nutritious meals and groceries for everyone in need."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prevSlide) =>
        prevSlide === carouselItems.length - 1 ? 0 : prevSlide + 1
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const handlePrev = () => {
    setActiveSlide((prevSlide) =>
      prevSlide === 0 ? carouselItems.length - 1 : prevSlide - 1
    );
  }

  const handleNext = () => {
    setActiveSlide((prevSlide) =>
      prevSlide === carouselItems.length - 1 ? 0 : prevSlide + 1
    );
  };

  



  const styles = {
    mainContainer: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: 'white'
    },
    jumbotron: {
      padding: '4rem 2rem',
      marginBottom: '2rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '1rem',
      width: '100%'
    },
    heading: {
      fontSize: '2.5rem',
      fontWeight: '700',
      marginBottom: '1rem',
      lineHeight: '1.2'
    },
    description: {
      fontSize: '1.2rem',
      lineHeight: '1.5'
    },
    cardContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      width: '100%',
      marginTop: '2rem'
    },
    darkCard: {
      padding: '2rem',
      borderRadius: '1rem',
      height: '100%',
      backgroundColor: '#212529',
      color: 'white'
    },
    lightCard: {
      padding: '2rem',
      borderRadius: '1rem',
      height: '100%',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6'
    },
    cardHeading: {
      fontSize: '1.75rem',
      marginBottom: '1rem'
    },
    cardText: {
      marginBottom: '1.5rem'
    },
    buttonLight: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      color: 'white',
      border: '2px solid white',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      ':hover': {
      backgroundColor: 'white',
      color: '#212529',
      width: '100%'
      }
    },
    buttonDark: {
      padding: '0.75rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: '600',
      color: '#6c757d',
      border: '2px solid #6c757d',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      ':hover': {
        backgroundColor: '#6c757d',
        color: 'white'
      }
    },
    carousel: {
      position: 'relative',
      width: '100%',
      height: '500px',
      overflow: 'hidden',
      marginBottom: '2rem'
    },
    carouselItem: {
      position: 'relative',
      width: '100%',
      height: '100%'
    },
    carouselImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    carouselCaption: {
      position: 'absolute',
      bottom: '20%',
      left: '50%',
      transform: 'translateX(-50%)',
      textAlign: 'center',
      color: 'white',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      padding: '2rem',
      borderRadius: '1rem',
      width: '80%',
      maxWidth: '800px'
    },
    carouselControls: {
      position: 'absolute',
      bottom: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '1rem'
    },
    carouselDot: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: 'white',
      opacity: 0.5,
      cursor: 'pointer',
      transition: 'opacity 0.3s ease'
    },
    carouselDotActive: {
      opacity: 1
    }
  };

  return (
    <main style={{...styles.mainContainer, paddingTop: '0'}}>
      {/* Carousel Section */}
      <div style={styles.carousel}>
        {carouselItems.map((item, index) => (
          <div
            key={index}
            style={{
              ...styles.carouselItem,
              display: index === activeSlide ? 'block' : 'none'
            }}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              style={{
              objectFit: 'cover'
              }}
            />
            <div style={styles.carouselCaption}>
              <h2 style={styles.heading}>{item.title}</h2>
              <p style={styles.description}>{item.description}</p>
            </div>
          </div>
        ))}
        <div style={styles.carouselControls}>
          {carouselItems.map((_, index) => (
            <div
              key={index}
              onClick={() => setActiveSlide(index)}
              style={{
                ...styles.carouselDot,
                ...(index === activeSlide ? styles.carouselDotActive : {})
              }}
            />
          ))}
        </div>
      </div>

      {/* Jumbotron Section */}
      <div style={styles.jumbotron}>
        <div>
          <h1 style={styles.heading}>Welcome to Safe Haven</h1>
          <p style={styles.description}>
            Welcome to Safe Haven! We're here to help you find the support you need, whether it's a warm place to stay, a meal, or other essential resources. With just a few clicks, you can discover nearby shelters, food banks, and services that are ready to help. You're not alone—Safe Haven is here to guide you every step of the way. Let's get started and find the care and support you deserve!
          </p>
        </div>
      </div>

      {/* Cards Section */}
      <div style={styles.cardContainer}>
        <div style={styles.darkCard}>
          <h2 style={styles.cardHeading}>Shelters</h2>
          <p style={styles.cardText}>
            Looking for a safe place to stay? Use this tool to find nearby shelters offering a warm bed and support. Whether you need emergency housing or a temporary place to rest, we're here to help you find the right option quickly and easily. Your safe haven is just a few clicks away!
          </p>
          <button
            style={styles.buttonLight}
            onClick={() => router.push("/form")}
          >
            Find a Shelter
          </button>
        </div>

        <div style={styles.darkCard}>
          <h2 style={styles.cardHeading}>Receive Emergency Help</h2>
          <p style={styles.cardText}>
            If you are in need of immediate assistance, our team is here to help. We can connect you with resources and support services to ensure your safety and well-being.
          </p>
          <button
            style={{...styles.buttonLight, backgroundColor: 'red', color: 'white'}}
            onClick={() => router.push("/emergency-help")}
          >
            Get Help Now
          </button>
        </div>


        <div style={styles.darkCard}>
          <h2 style={styles.cardHeading}>Foodbanks</h2>
          <p style={styles.cardText}>
            Need a meal or groceries to get through the day? Use this tool to locate food banks near you offering free meals, pantry items, and support. No matter your situation, there's a place ready to help. Let's find the nourishment and care you deserve!
          </p>
          <Link href="/foodbanks" style={{ textDecoration: 'none' }}>
            <button style={styles.buttonLight}>Get a Meal</button>
          </Link>
        </div>
      </div>
    </main>
  );
}