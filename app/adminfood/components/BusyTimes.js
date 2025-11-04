
'use client';
import { useState, useEffect } from 'react';
import styles from '../styles/BusyTimes.module.css';

const BusyTimes = ({ onChange }) => {
  const [mounted, setMounted] = useState(false);
  const [busyTimes, setBusyTimes] = useState({
    '6a': 50,
    '9a': 50,
    '12p': 50,
    '3p': 50,
    '6p': 50,
    '9p': 50
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; 
  }

  const handleSliderChange = (time, value) => {
    const newBusyTimes = { ...busyTimes, [time]: value };
    setBusyTimes(newBusyTimes);
    onChange?.(newBusyTimes);
  };

  return (
    <div className={styles.container}>
      <h3>Popular Times</h3>
      <div className={styles.sliderContainer}>
        {Object.entries(busyTimes).map(([time, value]) => (
          <div key={time} className={styles.sliderGroup}>
            <input
              type="range"
              min="0"
              max="100"
              value={value}
              onChange={(e) => handleSliderChange(time, parseInt(e.target.value))}
              className={styles.slider}
            />
            <label>{time}</label>
          </div>
        ))}
      </div>
      <p className={styles.instruction}>
        Drag the sliders up and down to set busy times
      </p>
    </div>
  );
};

export default BusyTimes;