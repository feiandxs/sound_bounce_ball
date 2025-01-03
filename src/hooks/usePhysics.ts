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

export const usePhysics = ({ width, height }: PhysicsOptions) => {
  const engineRef = useRef(Matter.Engine.create({
    gravity: { x: 0, y: 0.5 }
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
    console.log('Walls created at:', walls.map(w => ({ x: w.position.x, y: w.position.y })));

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
    const x = random(50, width - 50);  // 距离边缘留出一定空间
    const y = random(50, height * 0.2); // 在上方20%的区域内随机生成

    const ball = Matter.Bodies.circle(
      x,
      y,
      20,
      {
        restitution: 0.8,  // 弹性
        friction: 0.005,   // 摩擦力
        density: 0.001,    // 密度
      }
    );

    // 添加随机初始力
    const force = {
      x: random(-0.005, 0.005),  // 随机水平力
      y: random(0, 0.005)        // 随机向下的力
    };

    Matter.World.add(worldRef.current, ball);
    Matter.Body.applyForce(ball, ball.position, force);

    console.log('Ball added:', { 
      id: ball.id, 
      position: ball.position,
      force,
      radius: (ball as any).circleRadius
    });
    
    return ball;
  }, [width, height]);

  // 在指定位置添加小球的方法
  const addBallAtPosition = useCallback((x: number, y: number) => {
    const ball = Matter.Bodies.circle(
      x,
      y,
      20,
      {
        restitution: 0.8,
        friction: 0.005,
        density: 0.001,
      }
    );

    // 添加较小的随机初始力
    const force = {
      x: random(-0.002, 0.002),
      y: random(0, 0.002)
    };

    Matter.World.add(worldRef.current, ball);
    Matter.Body.applyForce(ball, ball.position, force);

    console.log('Ball added at position:', {
      id: ball.id,
      position: ball.position,
      force,
      radius: (ball as any).circleRadius
    });

    return ball;
  }, []);

  // 对所有小球施加力的方法
  const applyForceToAllBalls = useCallback((force: Matter.Vector) => {
    const bodies = Matter.Composite.allBodies(worldRef.current);
    bodies.forEach(body => {
      if (!body.isStatic) {
        Matter.Body.applyForce(body, body.position, force);
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
