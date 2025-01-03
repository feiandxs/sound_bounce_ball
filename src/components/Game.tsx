import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './Game.module.css';
import { usePhysics } from '../hooks/usePhysics';
import { useAudio } from '../hooks/useAudio';
import Matter from 'matter-js';
import Controls from './Controls';
import VolumeHint from './VolumeHint';

interface GameProps {
  width?: number;
  height?: number;
}

const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
const INITIAL_BALL_COUNT = 50;
const MAX_BALLS = 500;

const Game: React.FC<GameProps> = ({ 
  width = window.innerWidth, 
  height = window.innerHeight 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { engine, world, addBall, addBallAtPosition, applyForceToAllBalls } = usePhysics({ width, height });
  const requestRef = useRef<number>();
  const ballColors = useRef<Map<number, string>>(new Map());
  const ballsRef = useRef<Matter.Body[]>([]);
  const [ballCount, setBallCount] = useState(INITIAL_BALL_COUNT);
  const [clickMode, setClickMode] = useState(false);
  const [sensitivity, setSensitivity] = useState(0.5);
  const [forceMultiplier, setForceMultiplier] = useState(1.0);
  const [showVolumeHint, setShowVolumeHint] = useState(true);
  const [currentVolume, setCurrentVolume] = useState(0);

  // 初始化音频处理
  const { 
    isInitialized: isAudioInitialized,
    volume,
    error: audioError,
    initAudio,
    analyzeVolume,
    setSensitivity: setAudioSensitivity,
    cleanup: cleanupAudio
  } = useAudio({ sensitivity });

  // 初始化音频
  useEffect(() => {
    initAudio();
    return () => cleanupAudio();
  }, [initAudio, cleanupAudio]);

  // 初始化物理世界和小球
  useEffect(() => {
    console.log('Canvas size:', width, height);
    
    // 添加初始小球
    for (let i = 0; i < INITIAL_BALL_COUNT; i++) {
      const ball = addBall();
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      ballColors.current.set(ball.id, color);
      ballsRef.current.push(ball);
      console.log('Ball created:', { id: ball.id, color, position: ball.position });
    }

    // 添加日志以检查小球是否被创建
    const balls = Matter.Composite.allBodies(world).filter(body => !body.isStatic);
    console.log('Total balls:', balls.length);
    console.log('Ball positions:', balls.map(b => ({ x: b.position.x, y: b.position.y })));
  }, [addBall, world, width, height]);

  // 声音影响小球
  useEffect(() => {
    let animationId: number;

    const updateBalls = () => {
      if (isAudioInitialized) {
        const volume = analyzeVolume();
        if (volume && volume > 0.01) {
          setCurrentVolume(volume);  // 更新当前音量
          const force = {
            x: random(-0.05, 0.05) * volume * sensitivity * forceMultiplier,
            y: -0.25 * volume * sensitivity * forceMultiplier
          };
          applyForceToAllBalls(force);
        } else {
          setCurrentVolume(0);
        }
      }
      animationId = requestAnimationFrame(updateBalls);
    };

    updateBalls();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isAudioInitialized, analyzeVolume, applyForceToAllBalls, sensitivity, forceMultiplier]);

  // 渲染循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2d context');
      return;
    }

    console.log('Setting canvas size:', width, height);
    canvas.width = width;
    canvas.height = height;

    const render = () => {
      // 清空画布
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // 更新物理引擎
      Matter.Engine.update(engine);

      // 渲染所有物体
      const bodies = Matter.Composite.allBodies(world);
      
      // 先渲染墙体
      bodies.filter(body => body.isStatic).forEach(body => {
        ctx.beginPath();
        const vertices = body.vertices;
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let j = 1; j < vertices.length; j++) {
          ctx.lineTo(vertices[j].x, vertices[j].y);
        }
        ctx.lineTo(vertices[0].x, vertices[0].y);
        ctx.fillStyle = '#333333';
        ctx.fill();
        ctx.strokeStyle = '#444444';
        ctx.stroke();
      });

      // 再渲染小球（这样小球会在墙体上方）
      bodies.filter(body => !body.isStatic).forEach(body => {
        const pos = body.position;
        const radius = (body as Matter.Body & { circleRadius?: number }).circleRadius || 20;
        const baseColor = ballColors.current.get(body.id) || '#FFFFFF';
        
        // 添加阴影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // 创建径向渐变
        const gradient = ctx.createRadialGradient(
          pos.x - radius * 0.3, // 光源 x 偏移
          pos.y - radius * 0.3, // 光源 y 偏移
          radius * 0.1,        // 内圆半径
          pos.x,
          pos.y,
          radius
        );
        
        // 解析基础颜色
        const baseColorRgb = hexToRgb(baseColor);
        if (!baseColorRgb) return;
        
        // 创建高光色和暗部色
        const highlightColor = `rgba(${baseColorRgb.r + 50}, ${baseColorRgb.g + 50}, ${baseColorRgb.b + 50}, 1)`;
        const shadowColor = `rgba(${Math.max(0, baseColorRgb.r - 50)}, ${Math.max(0, baseColorRgb.g - 50)}, ${Math.max(0, baseColorRgb.b - 50)}, 1)`;
        
        gradient.addColorStop(0, highlightColor);    // 高光
        gradient.addColorStop(0.5, baseColor);       // 原色
        gradient.addColorStop(1, shadowColor);       // 暗部

        // 绘制球体
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 添加高光点
        ctx.beginPath();
        ctx.arc(
          pos.x - radius * 0.3,
          pos.y - radius * 0.3,
          radius * 0.2,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        // 重置阴影
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      });

      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [width, height, engine, world]);

  // 添加小球
  const handleAddBall = () => {
    if (ballCount >= MAX_BALLS) return;
    
    const ball = addBall();
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    ballColors.current.set(ball.id, color);
    ballsRef.current.push(ball);
    setBallCount(prev => prev + 1);
    console.log('New ball added:', { id: ball.id, color, position: ball.position });
  };

  // 移除小球
  const handleRemoveBall = () => {
    if (ballCount <= 1) return;

    const ballToRemove = ballsRef.current.pop();
    if (ballToRemove) {
      Matter.World.remove(world, ballToRemove);
      ballColors.current.delete(ballToRemove.id);
      setBallCount(prev => prev - 1);
      console.log('Ball removed:', { id: ballToRemove.id });
    }
  };

  // 处理画布点击
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!clickMode || ballCount >= MAX_BALLS) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ball = addBallAtPosition(x, y);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    ballColors.current.set(ball.id, color);
    ballsRef.current.push(ball);
    setBallCount(prev => prev + 1);
    console.log('New ball added at click position:', { id: ball.id, color, position: ball.position });
  };

  // 处理灵敏度变化
  const handleSensitivityChange = (newSensitivity: number) => {
    setSensitivity(newSensitivity);
    setAudioSensitivity(newSensitivity);
  };

  // 处理重新请求麦克风权限
  const handleRequestAudioAccess = useCallback(() => {
    cleanupAudio();  // 清理现有的音频上下文
    initAudio();     // 重新初始化音频
  }, [cleanupAudio, initAudio]);

  return (
    <div className={styles.gameContainer} onClick={handleCanvasClick}>
      <canvas
        ref={canvasRef}
        className={styles.gameCanvas}
      />
      <VolumeHint 
        volume={currentVolume}
        force={forceMultiplier}
        visible={showVolumeHint}
      />
      <Controls
        ballCount={ballCount}
        onAddBall={handleAddBall}
        onRemoveBall={handleRemoveBall}
        maxBalls={MAX_BALLS}
        minBalls={1}
        clickMode={clickMode}
        onClickModeChange={setClickMode}
        sensitivity={sensitivity}
        onSensitivityChange={handleSensitivityChange}
        forceMultiplier={forceMultiplier}
        onForceMultiplierChange={setForceMultiplier}
        showVolumeHint={showVolumeHint}
        onShowVolumeHintChange={setShowVolumeHint}
        audioError={audioError}
        onRequestAudioAccess={handleRequestAudioAccess}
      />
    </div>
  );
};

// 辅助函数
const random = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// 辅助函数：将16进制颜色转换为RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export default Game;
