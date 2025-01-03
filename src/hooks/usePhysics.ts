import { useEffect, useRef, useCallback } from 'react';
import Matter from 'matter-js';

interface PhysicsOptions {
  width: number;
  height: number;
}

// 生成随机数的辅助函数
const random = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

// 球的配置
const BALL_CONFIG = {
  MIN_RADIUS: 10,
  MAX_RADIUS: 25,
  RESTITUTION: 0.7,  // 弹性
  FRICTION: 0.01,    // 摩擦力
  DENSITY: 0.002     // 密度
};

export const usePhysics = ({ width, height }: PhysicsOptions) => {
  const engineRef = useRef(Matter.Engine.create({
    gravity: { x: 0, y: 1.5 }  // 增加重力
  }));
  const worldRef = useRef(engineRef.current.world);

  // 初始化物理世界
  useEffect(() => {
    const engine = engineRef.current;
    
    // 创建边界墙
    const walls = [
      Matter.Bodies.rectangle(width / 2, -10, width, 20, { isStatic: true }), // 上
      Matter.Bodies.rectangle(width / 2, height + 10, width, 20, { isStatic: true }), // 下
      Matter.Bodies.rectangle(-10, height / 2, 20, height, { isStatic: true }), // 左
      Matter.Bodies.rectangle(width + 10, height / 2, 20, height, { isStatic: true }) // 右
    ];

    Matter.World.add(worldRef.current, walls);

    // 启动物理引擎
    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    return () => {
      Matter.Runner.stop(runner);
      Matter.World.clear(worldRef.current, false);
      Matter.Engine.clear(engine);
    };
  }, [width, height]);

  // 在随机位置添加小球的方法
  const addBall = useCallback(() => {
    // 随机生成球的初始位置（在上方20%的区域内）
    const x = random(50, width - 50);
    const y = random(50, height * 0.2);
    const radius = random(BALL_CONFIG.MIN_RADIUS, BALL_CONFIG.MAX_RADIUS);

    const ball = Matter.Bodies.circle(
      x,
      y,
      radius,
      {
        restitution: BALL_CONFIG.RESTITUTION,
        friction: BALL_CONFIG.FRICTION,
        density: BALL_CONFIG.DENSITY * (20 / radius), // 较小的球密度更大，让它们跳得更高
      }
    );

    // 添加随机初始力
    const force = {
      x: random(-0.005, 0.005),
      y: random(0, 0.005)
    };

    Matter.World.add(worldRef.current, ball);
    Matter.Body.applyForce(ball, ball.position, force);
    
    return ball;
  }, [width, height]);

  // 在指定位置添加小球的方法
  const addBallAtPosition = useCallback((x: number, y: number) => {
    const radius = random(BALL_CONFIG.MIN_RADIUS, BALL_CONFIG.MAX_RADIUS);
    const ball = Matter.Bodies.circle(
      x,
      y,
      radius,
      {
        restitution: BALL_CONFIG.RESTITUTION,
        friction: BALL_CONFIG.FRICTION,
        density: BALL_CONFIG.DENSITY * (20 / radius),
      }
    );

    Matter.World.add(worldRef.current, ball);
    return ball;
  }, []);

  // 对所有小球施加随机力的方法
  const applyForceToAllBalls = useCallback((baseForce: Matter.Vector) => {
    const bodies = Matter.Composite.allBodies(worldRef.current);
    bodies.forEach(body => {
      if (!body.isStatic) {
        // 为每个球生成稍微不同的力
        const randomizedForce = {
          x: baseForce.x + random(-0.002, 0.002),
          y: baseForce.y * random(0.8, 1.2)  // y方向的力有20%的随机变化
        };
        Matter.Body.applyForce(body, body.position, randomizedForce);
      }
    });
  }, []);

  return {
    engine: engineRef.current,
    world: worldRef.current,
    addBall,
    addBallAtPosition,
    applyForceToAllBalls
  };
};
