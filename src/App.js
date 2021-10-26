

import logo from './logo.svg';
import './App.css';
import React, { Component } from 'react';
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

function App() {
  // Stage is a div container
  // Layer is actual canvas element (so you may have several canvases in the stage)
  // And then we have canvas shapes inside the Layer

  // const rectRef = React.useRef();

  return (
    <>
      <button onClick={()=>{
        // const node = rectRef.current;
        const anim = new Konva.Animation(
          (frame) => {
          }
        )
      }}>
        Toggle animation
      </button>
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          
          <BaseTriangle />
          <Shape
            x={200}
            y={490}
            width={400}
            height={10}
            fill="#00BFFF"
            shadowBlur={1}
          />
        </Layer>
      </Stage>
    </>
  );
}

export default App;
