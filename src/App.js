
import './App.css';
import React, { useState, useRef } from 'react';
import { Stage, Layer, Rect, Shape, Text } from 'react-konva';
import Konva from 'konva';

function BaseTriangle() {
  return (
    <Shape
      sceneFunc={(context, shape) => {
        context.beginPath();
        context.moveTo(400, 500);
        context.lineTo(350, 560);
        context.lineTo(450, 560);
        context.closePath();
        // (!) Konva specific method, it is very important
        context.fillStrokeShape(shape);
      }}
      fill="#00BFFF"
      stroke=""
      strokeWidth={4}
      shadowBlur={1}
    />
  );
}

const ro = 0;
const initialRectangles =
{
  x: 400 - 200 * Math.cos(Math.PI / 180 * ro) + 10 * Math.sin(Math.PI / 180 * ro),
  y: 500 - 200 * Math.sin(Math.PI / 180 * ro) - 10 * Math.cos(Math.PI / 180 * ro),
  width: 400,
  height: 10,
  fill: '#00BFFF',
  id: 'rect1',
  rotation: ro,
  centeredScaling: true
};



function App() {

  const getRow = (no) => {
    let x = Math.ceil((Math.sqrt(1 + 8 * total) - 1) / 2);
    let row = Math.ceil((-Math.sqrt((2 * x + 1) * (2 * x + 1) - 8 * (no + 1)) + (2 * x - 1)) / 2);
    // console.log((2 * total + 1) * (2 * total + 1) - 4 * (total * total + total - 2 * (total - no)));
    // console.log(no, Math.floor((2 * total + 1 + Math.sqrt((2 * total + 1) * (2 * total + 1) - 4 * (total * total + total - 2 * (total - no)))) / 2))
    if (isNaN(row)) return 0;
    return row + 1;
  }

  const getShift = (no) => {
    let x = Math.ceil((Math.sqrt(1 + 8 * total) - 1) / 2);
    let row = Math.ceil((-Math.sqrt((2 * x + 1) * (2 * x + 1) - 8 * (no + 1)) + (2 * x - 1)) / 2);
    if (isNaN(row)) return 0;
    return (x + (x - row)) * row * 15;
  }
  const generateShapes = (total, time, row) => {
    return [...Array(total)].map((_, i) => ({
      id: i.toString(),
      x: i * 40 + 10 + (7.6 - 0.4 * i) * time - getShift(i) / 25 * time,
      y: 10 + time * (18 - ((getRow(i) - 1) * 30 / 25))
    }));
  }

  const INITIALIZE_STATE = generateShapes(0, 0, 0);
  // Stage is a div container
  // Layer is actual canvas element (so you may have several canvases in the stage)
  // And then we have canvas shapes inside the Layer

  // const rectRef = React.useRef();
  const [total, setTotal] = useState(0);
  const [fake, setFake] = useState(0);
  const [animationTime, setAnimationTime] = useState(25);
  const getTotalEl = useRef();
  const animationTimeEl = useRef();

  const balanceEl = useRef(null);
  const [rot, setRot] = useState(0);

  const [rects, setRects] = useState(INITIALIZE_STATE);
  const leftHeight = () => {
    for (let i = 1; i <= animationTime; ++i)setTimeout(() => { setRot(-i / 5); }, 1000 / 60 * i);
  }
  const BackFromLeft = () => {
    for (let i = animationTime - 1; i >= 0; --i)setTimeout(() => { setRot(-i / 5); }, 1000 / 60 * (animationTime - i));
  }
  const rightHeight = () => {
    for (let i = 1; i <= animationTime; ++i)setTimeout(() => { setRot(i / 5); }, 1000 / 60 * i);
  }
  const BackFromRight = () => {
    for (let i = animationTime - 1; i >= 0; --i)setTimeout(() => { setRot(i / 5); }, 1000 / 60 * (animationTime - i));
  }
  const Down2Left = () => {
    for (let i = 1; i <= animationTime; ++i) {
      setTimeout(() => { setRects(generateShapes(total, i, 1)); }, 1000 / 60 * i);
    }
  }
  const Left2Up = () => {
    for (let i = animationTime - 1; i >= 0; --i) {
      setTimeout(() => { setRects(generateShapes(total, i, 1)); }, 1000 / 60 * (animationTime - i));
    }
  }
  const totalSubmit = () => {
    let t = parseInt(getTotalEl.current.value);
    setTotal(t);
    setFake(parseInt(Math.floor(Math.random() * t)));
    setRects(generateShapes(parseInt(getTotalEl.current.value), 0, 0));
  }
  const animationTimeSubmit = () => {
    setAnimationTime(parseInt(animationTimeEl.current.value));
  }
  return (
    <>
      <div>
        硬币个数：
        <input type='text' ref={getTotalEl} defaultValue="21" />
        个
        <button type='submit' onClick={totalSubmit}>更新</button>
      </div>
      <div>
        动画速度：
        <input type='text' ref={animationTimeEl} defaultValue="25" />
        帧（1/60秒）
        <button type='submit' onClick={animationTimeSubmit}>更新</button>
      </div>
      <div>
        <button onClick={leftHeight}>
          left Height
        </button>
        <button onClick={BackFromLeft}>
          Back From Left
        </button>
        <button onClick={rightHeight}>
          Right Height
        </button>
        <button onClick={BackFromRight}>
          Back From Right
        </button>
      </div>
      <button onClick={Down2Left}>
        Down to Left
      </button>
      <button onClick={Left2Up}>
        Left to Up
      </button>
      {/* <button onClick={Down2Right}>
        Down to Right
      </button> */}
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {rects.map((rect) => (
            <Rect
              key={rect.id}
              id={rect.id}
              x={rect.x}
              y={rect.y}
              width={30}
              height={30}
              fill={(parseInt(rect.id) == fake) ? "#FF4000" : "#00BFFF"}
              shadowBlur={2}
              shadowOpacity={0.5}
              opacity={0.8}
            />
          ))}
          {rects.map((rect) => (
            <Text
              x={rect.x + 5}
              y={rect.y + 7}
              text={rect.id}
              fontSize={16}
              fill="white"
            >
            </Text>
          ))}
          <BaseTriangle />
          <Rect
            x={400 - 200 * Math.cos(Math.PI / 180 * rot) + 10 * Math.sin(Math.PI / 180 * rot)}
            y={500 - 200 * Math.sin(Math.PI / 180 * rot) - 10 * Math.cos(Math.PI / 180 * rot)}
            width={400}
            height={10}
            fill='#00BFFF'
            id='rect1'
            rotation={rot}
            stroke=""
            shadowBlur={1}
            ref={balanceEl}
          />
        </Layer>
      </Stage>
    </>
  );
}

export default App;
