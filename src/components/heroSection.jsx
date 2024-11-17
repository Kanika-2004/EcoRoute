import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import treesfImage from '../assests/treesf.svg.svg';
import leavesImage from '../assests/leaves.svg';
import { Link } from 'react-scroll';

import 'animate.css';



import { ArrowRightCircle } from 'react-bootstrap-icons';
import 'animate.css';
import TrackVisibility from 'react-on-screen';

export const Banner = () => {
  const [loopNum, setLoopNum] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState('');
  const [delta, setDelta] = useState(300 - Math.random() * 100);
  const [index, setIndex] = useState(1);
  const toRotate = [ "Options", "Insights", "Choices" ];
  const period = 2000;

  useEffect(() => {
    let ticker = setInterval(() => {
      tick();
    }, [delta]);

    return () => { clearInterval(ticker) };
  }, [text])

  const tick = () => {
    let i = loopNum % toRotate.length;
    let fullText = toRotate[i];
    let updatedText = isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1);

    setText(updatedText);

    if (isDeleting) {
      setDelta(prevDelta => prevDelta / 2);
    }

    if (!isDeleting && updatedText === fullText) {
      setIsDeleting(true);
      setIndex(prevIndex => prevIndex - 1);
      setDelta(period);
    } else if (isDeleting && updatedText === '') {
      setIsDeleting(false);
      setLoopNum(loopNum + 1);
      setIndex(1);
      setDelta(500);
    } else {
      setIndex(prevIndex => prevIndex + 1);
    }
  }

  return (
    <section className="banner" id="home">
      <Container>
        <Row >
          <Col>
            <TrackVisibility>
              {({ isVisible }) =>
              <div className={isVisible ? "animate__animated animate__fadeIn" : ""}>
                <span className="tagline">Welcome To EcoRoute</span>
                <h1>{`Eco`} <span className="txt-rotate" dataperiod="1000" data-rotate='[ "Options", "Insights", "Choices" ]'><span className="wrap">{text}</span></span></h1>
                  <p>EcoRoute website helps you make environmentally conscious travel choices by calculating CO2 emissions for different vehicles based on your location.
                  Click now to start your eco-friendly journey!
                  </p>
                  <Link to="form-section" smooth={true} duration={100}>
                  <button onClick={() => console.log('connect')}>Start Now <ArrowRightCircle size={20} /></button>
                  </Link>
              </div>}
            </TrackVisibility>
          </Col>
          {/* <Col xs={12} md={6} xl={5}>
          <img src={leavesImage} alt="Header Img" />
        </Col> */}
        </Row>
      </Container>
    </section>
  )
}