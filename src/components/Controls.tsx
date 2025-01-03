import React, { useState } from 'react';
import styles from './Controls.module.css';

interface ControlsProps {
  ballCount: number;
  onAddBall: () => void;
  onRemoveBall: () => void;
  maxBalls?: number;
  minBalls?: number;
  clickMode: boolean;
  onClickModeChange: (enabled: boolean) => void;
  sensitivity: number;
  onSensitivityChange: (value: number) => void;
  forceMultiplier: number;
  onForceMultiplierChange: (value: number) => void;
  showVolumeHint: boolean;
  onShowVolumeHintChange: (enabled: boolean) => void;
  audioError?: string | null;
  onRequestAudioAccess?: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  ballCount,
  onAddBall,
  onRemoveBall,
  maxBalls = 100,
  minBalls = 1,
  clickMode,
  onClickModeChange,
  sensitivity,
  onSensitivityChange,
  forceMultiplier,
  onForceMultiplierChange,
  showVolumeHint,
  onShowVolumeHintChange,
  audioError,
  onRequestAudioAccess
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`${styles.controls} ${isExpanded ? '' : styles.collapsed}`}>
      <button 
        className={styles.toggleButton}
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
      >
        {isExpanded ? '🍔' : '⚙️'}
      </button>
      
      <div className={styles.controlsContent}>
        <div className={styles.ballCount}>
          <button
            className={styles.button}
            onClick={onRemoveBall}
            disabled={ballCount <= minBalls}
          >
            -
          </button>
          <span>{ballCount}</span>
          <button
            className={styles.button}
            onClick={onAddBall}
            disabled={ballCount >= maxBalls}
          >
            +
          </button>
        </div>
        <div className={styles.modeSwitch}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={clickMode}
              onChange={(e) => onClickModeChange(e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.modeLabel}>点击生成模式</span>
        </div>
        <div className={styles.modeSwitch}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={showVolumeHint}
              onChange={(e) => onShowVolumeHintChange(e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.modeLabel}>显示音量提示</span>
        </div>
        <div className={styles.sensitivityControl}>
          <label className={styles.sensitivityLabel}>
            声音灵敏度: {Math.round(sensitivity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={sensitivity * 100}
            onChange={(e) => onSensitivityChange(Number(e.target.value) / 100)}
            className={styles.sensitivitySlider}
          />
        </div>
        <div className={styles.sensitivityControl}>
          <label className={styles.sensitivityLabel}>
            力道大小: {Math.round(forceMultiplier * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={forceMultiplier * 100}
            onChange={(e) => onForceMultiplierChange(Number(e.target.value) / 100)}
            className={styles.sensitivitySlider}
          />
        </div>
        {audioError && (
          <div className={styles.audioError}>
            <div className={styles.error}>
              {audioError}
            </div>
            <button 
              className={styles.retryButton}
              onClick={(e) => {
                e.stopPropagation();
                onRequestAudioAccess?.();
              }}
            >
              重新请求麦克风权限
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Controls;
