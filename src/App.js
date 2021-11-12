
import './App.css';
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Shape, Text } from 'react-konva';
import { Button } from 'antd';
import 'antd/dist/antd.css';
function BaseTriangle() {                                     // 绘制三角形底座
  return (
    <Shape
      sceneFunc={(context, shape) => {
        context.beginPath();
        context.moveTo(400, 500);
        context.lineTo(350, 560);
        context.lineTo(450, 560);
        context.closePath();
        context.fillStrokeShape(shape);
      }}
      fill="#00BFFF"
      stroke=""
      strokeWidth={4}
      shadowBlur={1}
    />
  );
}
const WIDTH = 30;                                             // 小正方形边长
const X0 = 10, XL = 100, XR = 490, XM = 800;                  // x坐标默认间隔 与 三个托盘x坐标
const Y0 = 10, Y1 = 455;                                      // y默认间隔 与 托盘y坐标
let nowStep = 0;
function App() {
  const getRow = (no) => {                                    // 获取所在金字塔层数
    let now = no - getFirst(no);
    let num = Math.floor((nowRight - nowLeft + 1) / 3) + ((nowRight - nowLeft + 1) % 3 === 2);
    if (getGroup(no) === 3) num = nowRight - nowLeft + 1 - num * 2;
    let x = Math.ceil((Math.sqrt(1 + 8 * num) - 1) / 2);
    let row = Math.ceil((-Math.sqrt((2 * x + 1) * (2 * x + 1) - 8 * (now + 1)) + (2 * x - 1)) / 2);
    if (isNaN(row)) return 0;
    return row + 1;
  }
  const getGroup = (no, L = nowLeft, R = nowRight) => {       // 获取所在组
    if (R === L) return 0;
    if (no < L || no > R) return 0;                           // 0组表示不显示
    switch ((R - L + 1) % 3) {
      case 0: return Math.floor((no - L) / ((R - L + 1) / 3)) + 1;
      case 1: return Math.min(Math.floor((no - L) / ((R - L) / 3)) + 1, 3);
      default: return Math.floor((no - L) / ((R - L + 2) / 3)) + 1;
    }
  }
  const getGroupFirst = (x, L = nowLeft, R = nowRight) => {   // 获取第 x 组的第一个编号
    if (!x) return 0;
    switch ((R - L + 1) % 3) {
      case 0: return L + (x - 1) * ((R - L + 1) / 3);
      case 1: return L + (x - 1) * ((R - L) / 3);
      default: return L + (x - 1) * ((R - L + 2) / 3);
    }
  }
  const getFirst = (no, L = nowLeft, R = nowRight) => {       // 获取所在组的第一个编号
    return getGroupFirst(getGroup(no, L, R), L, R);
  }
  const getGroupLast = (x, L = nowLeft, R = nowRight) => {    // 获取第 x 组的第一个编号
    if (!x) return 0;
    if (x === 3) return R;
    switch ((R - L + 1) % 3) {
      case 0: return L + x * ((R - L + 1) / 3) - 1;
      case 1: return L + x * ((R - L) / 3) - 1;
      default: return L + x * ((R - L + 2) / 3) - 1;
    }
  }
  const getOffset = (no) => {                                 // x 坐标偏移公式
    let now = no - getFirst(no);
    let num = Math.floor((nowRight - nowLeft + 1) / 3) + ((nowRight - nowLeft + 1) % 3 === 2);
    if (getGroup(no) === 3) num = nowRight - nowLeft + 1 - num * 2;
    let x = Math.ceil((Math.sqrt(1 + 8 * num) - 1) / 2);
    let row = Math.ceil((-Math.sqrt((2 * x + 1) * (2 * x + 1) - 8 * (now + 1)) + (2 * x - 1)) / 2);
    if (isNaN(row)) return 0;
    return (x + (x - row)) * row * WIDTH / 2;
  }
  const generateTotalShapes = (time, L = nowLeft, R = nowRight) => {  // 称量动画
    if (nowRight - nowLeft > 1000) return [];
    let ans = [];
    for (let i = nowLeft; i <= nowRight; ++i) {
      ans.push({
        id: i.toString(),
        x: X0 + (i - nowLeft) * (X0 + WIDTH) - time * ((getFirst(i) - nowLeft) * (X0 + WIDTH)) / animationTime,
        y: Y0 + time * ((getGroup(i, L, R) - 1) * (Y0 + WIDTH)) / animationTime
      });
    }
    return ans;
  }
  const generateGroupShapes = (time) => {                     // 分组动画
    if (nowRight - nowLeft > 1000) return [];
    let ans = [];
    for (let i = nowLeft; i <= nowRight; ++i) {
      ans.push({
        id: i.toString(),
        x: X0 + (i - getFirst(i)) * (X0 + WIDTH) + time * ((getGroup(i) === 2 ? XR : (getGroup(i) === 1 ? XL : XM)) - (i - getFirst(i) + 1) * X0) / animationTime - time * getOffset(i) / animationTime,
        y: Y0 + Math.max(getGroup(i) - 1, 0) * (Y0 + WIDTH) + time * (Y1 - WIDTH * getRow(i) - Y0 - Math.max(getGroup(i) - 1, 0) * (Y0 + WIDTH)) / animationTime
      });
    }
    return ans;
  }
  const generateReserveShapes = (no, time) => {               // 丢弃动画
    if (nowRight - nowLeft > 1000) return [];
    let ans = [];
    for (let i = nowLeft; i <= nowRight; ++i) {
      ans.push({
        id: i.toString(),
        x: (i - getFirst(i)) * WIDTH + (getGroup(i) === 2 ? XR : (getGroup(i) === 1 ? XL : XM)) - getOffset(i) + (getGroup(i) === no ? (time * (X0 + (i - getFirst(i)) * (X0 + WIDTH) - ((i - getFirst(i)) * WIDTH + (getGroup(i) === 2 ? XR : (getGroup(i) === 1 ? XL : XM)) - getOffset(i))) / animationTime) : 0),
        y: getGroup(i) === no ? (Y1 - WIDTH * getRow(i) + time * (Y0 - Y1 + WIDTH * getRow(i)) / animationTime) : (Y1 - WIDTH * getRow(i)),
        opacity: getGroup(i) === no ? 0.8 : (0.8 / animationTime * (animationTime - time))
      });
    }
    return ans;
  }
  const [total, setTotal] = useState(0);
  const [nowLeft, setNowLeft] = useState(0);
  const [nowRight, setNowRight] = useState(-1);
  const [fake, setFake] = useState(0);
  const [animationTime, setAnimationTime] = useState(25);
  const getTotalEl = useRef();
  const animationTimeEl = useRef();
  const resultRef = useRef();
  const nextStepRef = useRef();
  const [rot, setRot] = useState(0);
  const [rects, setRects] = useState([]);
  useEffect(() => {
    nextStepRef.current.removeAttribute('disabled');
    if (total > 0) resultRef.current.innerHTML = `<p>生成了编号为 ${0} ~ ${total - 1} 的 ${total} 个硬币，其中 ${fake} 号为假币。</p>`
    setRects(() => {
      let x = generateTotalShapes(0);
      return x;
    });
  }, [total]);
  const GroupRect = () => {
    for (let i = 1; i <= animationTime; ++i)setTimeout(() => { setRects(generateTotalShapes(i)); }, 1000 / 60 * i);
  }
  const leftHeight = () => {
    for (let i = 1; i <= animationTime; ++i)setTimeout(() => { setRot(-5 * i / animationTime); }, 1000 / 60 * i);
  }
  const BackFromLeft = () => {
    for (let i = animationTime - 1; i >= 0; --i)setTimeout(() => { setRot(-5 * i / animationTime); }, 1000 / 60 * (animationTime - i));
  }
  const rightHeight = () => {
    for (let i = 1; i <= animationTime; ++i)setTimeout(() => { setRot(5 * i / animationTime); }, 1000 / 60 * i);
  }
  const BackFromRight = () => {
    for (let i = animationTime - 1; i >= 0; --i)setTimeout(() => { setRot(5 * i / animationTime); }, 1000 / 60 * (animationTime - i));
  }
  const Down2Left = () => {
    for (let i = 1; i <= animationTime; ++i)setTimeout(() => { setRects(generateGroupShapes(i)); }, 1000 / 60 * i);
  }
  const Left2Up = () => {
    for (let i = animationTime - 1; i >= 0; --i)setTimeout(() => { setRects(generateGroupShapes(i)); }, 1000 / 60 * (animationTime - i));
  }
  const Down2Right = () => {
    for (let i = 1; i <= animationTime; ++i)setTimeout(() => { setRects(generateGroupShapes(i)); }, 1000 / 60 * i);
  }
  const Right2Up = () => {
    for (let i = animationTime - 1; i >= 0; --i) setTimeout(() => { setRects(generateGroupShapes(i)); }, 1000 / 60 * (animationTime - i));
  }
  const totalSubmit = () => {
    let t = parseInt(getTotalEl.current.value);
    setFake(parseInt(Math.floor(Math.random() * t)));
    setNowRight(t - 1);
    setNowLeft(0);
    setTotal(t);
    nowStep = 0;
  }
  const animationTimeSubmit = () => {
    setAnimationTime(parseInt(animationTimeEl.current.value));
  }
  const nextStep = () => {
    let fakeGroup;
    switch (nowStep % 3) {
      case 0: // 分组阶段
        GroupRect();
        resultRef.current.innerHTML += `<p>第 ${nowStep} 步：将编号为 ${nowLeft} ~ ${nowRight} 的硬币分成三组：${getGroupFirst(1)} ~ ${getGroupLast(1)}、${getGroupFirst(2)} ~ ${getGroupLast(2)}、${getGroupFirst(3)} ~ ${getGroupLast(3)}。</p>`;
        ++nowStep;
        break;
      case 1: // 称量阶段
        fakeGroup = getGroup(fake);
        let orz = '天平平衡';
        if (fakeGroup === 2) { orz = '天平向左倾斜'; leftHeight(); }
        if (fakeGroup === 1) { orz = '天平向左倾斜'; rightHeight(); }
        Down2Left();
        resultRef.current.innerHTML += `<p>第 ${nowStep} 步：将第 1 组编号为 ${getGroupFirst(1)}~${getGroupLast(1)} 的硬币和第 2 组编号为 ${getGroupFirst(2)}~${getGroupLast(2)} 的硬币放到机器上称量，${orz}，说明假币在第 ${fakeGroup} 组。</p>`;
        ++nowStep;
        break;
      case 2: // 丢弃阶段
        fakeGroup = getGroup(fake);
        if (fakeGroup === 2) BackFromLeft();
        if (fakeGroup === 1) BackFromRight();
        Reserve(fakeGroup);
        resultRef.current.innerHTML += `<p>第 ${nowStep} 步：将第 ${fakeGroup} 组编号为 ${getGroupFirst(fakeGroup)} ~ ${getGroupLast(fakeGroup)} 的硬币保留，${(getGroupFirst(fakeGroup) === getGroupLast(fakeGroup)) ? '' : '作为进入下一次分治的硬币，'
          }其他硬币丢弃。</p > `;
        if (getGroupFirst(fakeGroup) === getGroupLast(fakeGroup)) {
          nextStepRef.current.setAttribute('disabled', 'disabled');
          resultRef.current.innerHTML += `<p>通过 ${(nowStep + 1) / 3} 次比较，成功找到假币为 ${fake} 号。</p > `;
        }
        ++nowStep;
        break;
      default:
    }
  }
  const Reserve = (group) => {
    for (let i = 1; i <= animationTime; ++i) setTimeout(() => { setRects(generateReserveShapes(group, i)); }, 1000 / 60 * i);
    setTimeout(() => {
      setNowRight(getGroupLast(group));
      setNowLeft(getGroupFirst(group));
    }, (animationTime + 1) * 1000 / 60);
  }
  const download = (filename, text) => {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  const save2File = () => {
    download('result.txt', resultRef.current.innerText);
  }
  return (
    <>
      <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
        <div style={{ marginLeft: '8px' }}>
          硬币个数：
          <input type='text' ref={getTotalEl} defaultValue="28" />
          个
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={totalSubmit}>更新</Button>
        </div>
        <div style={{ marginLeft: '8px' }}>
          动画速度：
          <input type='text' ref={animationTimeEl} defaultValue="25" />
          帧（1/60秒）
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={animationTimeSubmit}>更新</Button>
        </div>
        <div>
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={GroupRect}>
            Group
          </Button>
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={leftHeight}>
            left Height
          </Button>
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={BackFromLeft}>
            Back From Left
          </Button>
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={rightHeight}>
            Right Height
          </Button>
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={BackFromRight}>
            Back From Right
          </Button>
        </div>
        <div>
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={() => { Reserve(1) }}>
            保留第一组
          </Button>
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={() => { Reserve(2) }}>
            保留第二组
          </Button>
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={() => { Reserve(3) }}>
            保留第三组
          </Button>
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={Down2Left}>
            Down to Left
          </Button>
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={Left2Up}>
            Left to Up
          </Button>
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={Down2Right}>
            Down to Right
          </Button>
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={Right2Up}>
            Right to Up
          </Button>
        </div>
        <div>
          <Button style={{ marginLeft: '8px', marginTop: '8px' }} type='primary' onClick={nextStep} ref={nextStepRef}>
            下一步
          </Button>
        </div>
        <Stage width={window.innerWidth * 0.8} height={window.innerHeight - 40 * 5} >
          <Layer>
            {rects.map((rect) => (
              <Rect
                key={rect.id}
                id={rect.id}
                x={rect.x}
                y={rect.y + (getGroup(parseInt(rect.id)) === 1 ? -1 : (getGroup(parseInt(rect.id)) === 2 ? 1 : 0)) * (200 * Math.sin(Math.PI / 180 * rot) - 10 * (1 - Math.cos(Math.PI / 180 * rot)))}
                width={WIDTH}
                height={WIDTH}
                fill={(parseInt(rect.id) === fake) ? "#FF4000" : "#00BFFF"}
                shadowBlur={2}
                shadowOpacity={0.5}
                opacity={('opacity' in rect) ? rect.opacity : 0.8}
              />
            ))}
            {rects.map((rect) => (
              <Text
                x={rect.x + 3}
                y={rect.y + 7 + (getGroup(parseInt(rect.id)) === 1 ? -1 : (getGroup(parseInt(rect.id)) === 2 ? 1 : 0)) * (200 * Math.sin(Math.PI / 180 * rot) - 10 * (1 - Math.cos(Math.PI / 180 * rot)))}
                text={rect.id}
                fontSize={16}
                fill="white"
                opacity={('opacity' in rect) ? rect.opacity : 1}
              >
              </Text>
            ))}
            <BaseTriangle />
            <Rect
              x={200}
              y={475 - 200 * Math.sin(Math.PI / 180 * rot) - 10 * Math.cos(Math.PI / 180 * rot)}
              width={10}
              height={30}
              fill='#00BFFF'
              id='leftSupport'
              stroke=""
              shadowBlur={1}
            />
            <Rect
              x={100}
              y={465 - 200 * Math.sin(Math.PI / 180 * rot) - 10 * Math.cos(Math.PI / 180 * rot)}
              width={210}
              height={10}
              fill='#00BFFF'
              id='leftPlate'
              stroke=""
              shadowBlur={1}
            />
            <Rect
              x={590}
              y={475 + 200 * Math.sin(Math.PI / 180 * rot) - 10 * Math.cos(Math.PI / 180 * rot)}
              width={10}
              height={30}
              fill='#00BFFF'
              id='rightSupport'
              stroke=""
              shadowBlur={1}
            />
            <Rect
              x={490}
              y={465 + 200 * Math.sin(Math.PI / 180 * rot) - 10 * Math.cos(Math.PI / 180 * rot)}
              width={210}
              height={10}
              fill='#00BFFF'
              id='rightPlate'
              stroke=""
              shadowBlur={1}
            />
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
            />
          </Layer>
        </Stage>
      </div>
      <div style={{ display: 'inline-block', verticalAlign: 'top', paddingLeft: window.innerWidth * 0.0, maxWidth: window.innerWidth * 0.18, paddingLeft: '8px', paddingTop: '8px' }} >
        <div ref={resultRef}>
        </div>
        <Button style={{ marginLeft: '8px', marginTop: '8px' }} onClick={save2File} >保存结果到文本文件</Button>
      </div>
    </>
  );
}
export default App;