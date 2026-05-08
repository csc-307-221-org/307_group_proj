import { useEffect, useState } from "react";

function getWindowSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function useWindowScale(percent = 0.7) {
  const [windowSize, setWindowSize] = useState(getWindowSize);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize(getWindowSize());
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxSize = Math.min(windowSize.width, windowSize.height) * percent;

  return { maxSize };
}

export default useWindowScale;
