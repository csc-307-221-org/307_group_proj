import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function Login(props) {
  const [creds, setCreds] = useState({
    username: "",
    pwd: "",
  });
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);

  const isSignup = props.buttonLabel === "Sign Up";

  function handleChange(event) {
    const { name, value } = event.target;

    switch (name) {
      case "username":
        setCreds({ ...creds, username: value });
        break;

      case "password":
        setCreds({ ...creds, pwd: value });
        break;

      default:
        break;
    }
  }

  function submitForm() {
    props.handleSubmit(creds);
    setCreds({ username: "", pwd: "" });
  }

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !props.videoSrc) return;

    setVideoReady(false);

    video.load();

    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.log("Video play failed:", error);
      });
    }
  }, [props.videoSrc]);

  return (
    <>
      <video
        ref={videoRef}
        key={props.videoSrc}
        className={`login-background-video ${videoReady ? "video-ready" : ""}`}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        onLoadedData={() => setVideoReady(true)}
        onError={() => {
          console.log("Video failed to load:", props.videoSrc);
          setVideoReady(false);
        }}
      >
        <source src={props.videoSrc} type="video/mp4" />
      </video>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "100px",
        }}
      >
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
          }}
        >
          <label htmlFor="username">UserName</label>

          <input
            type="text"
            name="username"
            id="username"
            value={creds.username}
            onChange={handleChange}
          />

          <label htmlFor="password">Password</label>

          <input
            type="password"
            name="password"
            id="password"
            value={creds.pwd}
            onChange={handleChange}
          />

          <input
            type="button"
            value={props.buttonLabel || "Log In"}
            onClick={submitForm}
          />

          {isSignup ? (
            <p className="signup-text">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          ) : (
            <p className="signup-text">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          )}
        </form>
      </div>
    </>
  );
}

export default Login;
