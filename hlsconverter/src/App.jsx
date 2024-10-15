import React, { useState, useEffect } from "react";
import axios from "axios";
import VideoPlayer from "./VideoPlayer";
import ReactPlayer from 'react-player';
import VideoUploadForm from "./VideoUploadForm";
// import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from "react-bootstrap";

const App = () => {
  const [videoSources, setVideoSources] = useState([]);

  useEffect(() => {
    fetchVideoSources();
  }, []);

  const getVideosSourceList = async (file) => {
    try {
      const response = await axios.get("http://localhost:8000/videos");

      if (response.status === 200) {
        return response.data.videoUrls;
      } else {
        return [];
      }
    } catch (error) {
      console.error("Error uploading video file: ", error);
      return [];
    }
  };
  const getUniqueUrl = (url) => {
    return `${url}?_t=${new Date().getTime()}`;
  };

  const fetchVideoSources = async () => {
    const response = await getVideosSourceList();
    console.log(response);
    setVideoSources(response);
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col xs lg="6">
          <VideoUploadForm />
        </Col>
      </Row>
      <Row>
        <Col>
          <hr></hr>
        </Col>
      </Row>
      {videoSources
        .reduce((result, value, index) => {
          index % 2 === 0
            ? result.push([value])
            : result[result.length - 1].push(value);
          return result;
        }, [])
        .map((item, index) => {
          return (
            <Row className="justify-content-md-center" key={index}>
              {item.map((val, idx) => {
                console.log(val);
                return (
                  <Col
                    key={idx}
                    // key={val}
                    xs={6}
                    className="p-3 border justify-content-md-center"
                  >
                    {/* <VideoPlayer videoSource={val} /> */}
                    {/* <ReactPlayer
                      // key={val}
                      url={getUniqueUrl(val)}
                      // url={val}
                      controls
                      playing
                      width="100%"
                      height="100%"
                    /> */}
                     <VideoPlayer
                    src={val}  // Pass the video URL as the src prop
                  />
                  </Col>
                );
              })}
            </Row>
          );
        })}
    </Container>
  );
};

export default App;
