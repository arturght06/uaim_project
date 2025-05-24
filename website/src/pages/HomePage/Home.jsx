import React, { useRef, useState, useEffect } from "react";
import styles from "./Home.module.css";
import EventList from "../../components/Events/EventList/EventList";

const videoList = [
  "https://ik.imagekit.io/ybxfqvwjs/Filmik_o_EVENT_Gotowy.mp4?updatedAt=1747938669145",
  "https://ik.imagekit.io/ybxfqvwjs/Filmik_z_EVENT_gotowy_.mp4?tr=orig&updatedAt=1747938671470",
  "https://ik.imagekit.io/ybxfqvwjs/Generated%20File%20May%2022,%202025%20-%208_14PM.mp4?updatedAt=1747938674881",
  "https://ik.imagekit.io/ybxfqvwjs/Film_z_Eventu_Gotowy.mp4?updatedAt=1747938675297",
  "https://ik.imagekit.io/ybxfqvwjs/Gotowy_Film_Link_i_Billboard.mp4?updatedAt=1747938675696",
  "https://ik.imagekit.io/ybxfqvwjs/Film_z_Drona_Gotowy_.mp4?updatedAt=1747938676493",
  "https://ik.imagekit.io/ybxfqvwjs/Generated%20File%20May%2022,%202025%20-%208_08PM.mp4?updatedAt=1747938678032",
  "https://ik.imagekit.io/ybxfqvwjs/Generated%20File%20May%2022,%202025%20-%208_13PM.mp4?updatedAt=1747938679873",
];

// Helper to get random index different from currentIndex
const getRandomIndex = (excludeIndex) => {
  let idx;
  do {
    idx = Math.floor(Math.random() * videoList.length);
  } while (idx === excludeIndex);
  return idx;
};

const Home = () => {
  const videoRefs = [useRef(null), useRef(null)];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeVideo, setActiveVideo] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Pick a random starting index on mount
    const randomStartIndex = Math.floor(Math.random() * videoList.length);
    setCurrentIndex(randomStartIndex);
    setHasMounted(true);

    if (videoRefs[0].current) {
      videoRefs[0].current.src = videoList[randomStartIndex];
      videoRefs[0].current.play().catch(() => {});
    }

    if (videoRefs[1].current) {
      const nextIndex = getRandomIndex(randomStartIndex);
      videoRefs[1].current.src = videoList[nextIndex];
      videoRefs[1].current.load();
    }
  }, []);

  const handleVideoTransition = () => {
    // Pick a random next index different from current one
    const nextIndex = getRandomIndex(currentIndex);
    const nextVideoRefIndex = 1 - activeVideo;
    const nextVideo = videoRefs[nextVideoRefIndex].current;

    if (!nextVideo) return;

    nextVideo.src = videoList[nextIndex];
    nextVideo.load();
    nextVideo.play().catch(() => {});

    setTimeout(() => {
      setCurrentIndex(nextIndex);
      setActiveVideo(nextVideoRefIndex);
    }, 50);
  };

  useEffect(() => {
    const currentVideo = videoRefs[activeVideo].current;

    const handleTimeUpdate = () => {
      if (!currentVideo) return;
      const timeLeft = currentVideo.duration - currentVideo.currentTime;

      if (timeLeft < 1 && !currentVideo._hasTriggeredNext) {
        currentVideo._hasTriggeredNext = true;
        handleVideoTransition();
      }
    };

    if (currentVideo) {
      currentVideo._hasTriggeredNext = false;
      currentVideo.addEventListener("timeupdate", handleTimeUpdate);
    }

    return () => {
      if (currentVideo) {
        currentVideo.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [activeVideo]);

  return (
    <>
      <div className={styles.videoContainer}>
        {[0, 1].map((i) => (
          <video
            key={i}
            ref={videoRefs[i]}
            className={`${styles.video} ${
              activeVideo === i ? styles.active : styles.inactive
            } ${
              i === 0 && activeVideo === 0 && hasMounted
                ? styles.initialFadeIn
                : ""
            }`}
            muted
            playsInline
            controls={false}
            autoPlay={activeVideo === i}
          />
        ))}
      </div>

      <div className={styles.rootContainer}>
        <div className={styles.container}>
          <h1>Witaj w EVE.NT!</h1>
          <p>
            Przeglądaj nadchodzące wydarzenia, rezerwuj miejsca i ciesz się
            kulturą.
          </p>
          <EventList></EventList>
        </div>
      </div>
    </>
  );
};

export default Home;
