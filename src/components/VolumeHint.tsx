import React, { useEffect, useState } from 'react';
import styles from './VolumeHint.module.css';

interface VolumeHintProps {
  volume: number;
  force: number;
  visible: boolean;
}

// 音量等级配置
const VOLUME_LEVELS = [
  { threshold: 0.1, text: '很安静', color: '#4CAF50' },
  { threshold: 0.3, text: '正常', color: '#2196F3' },
  { threshold: 0.6, text: '有点吵', color: '#FF9800' },
  { threshold: 0.8, text: '太吵了', color: '#f44336' },
  { threshold: 1.0, text: '震耳欲聋', color: '#9C27B0' }
];

const VolumeHint: React.FC<VolumeHintProps> = ({ volume, force, visible }) => {
  const [hint, setHint] = useState({ text: '', color: '' });
  const [show, setShow] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  useEffect(() => {
    if (!visible) return;

    const now = Date.now();
    const combinedVolume = volume * force;

    // 查找当前音量对应的等级
    const level = VOLUME_LEVELS.find(level => combinedVolume <= level.threshold) 
      || VOLUME_LEVELS[VOLUME_LEVELS.length - 1];

    // 如果音量变化超过阈值，且距离上次更新超过1秒
    if (Math.abs(combinedVolume - volume) > 0.1 && now - lastUpdateTime > 1000) {
      setHint({ text: level.text, color: level.color });
      setShow(true);
      setLastUpdateTime(now);

      // 2秒后隐藏提示
      setTimeout(() => {
        setShow(false);
      }, 2000);
    }
  }, [volume, force, visible]);

  if (!visible || !show) return null;

  return (
    <div 
      className={`${styles.hint} ${show ? styles.show : ''}`}
      style={{ color: hint.color }}
    >
      {hint.text}
    </div>
  );
};

export default VolumeHint; 