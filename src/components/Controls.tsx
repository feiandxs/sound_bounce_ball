import React from 'react';
import styles from './Controls.module.css';

interface ControlsProps {
  ballCount: number;
  onAddBall: () => void;
  onRemoveBall: () => void;
  maxBalls?: number;
  minBalls?: number;
  clickMode: boolean;
  onClickModeChange: (enabled: boolean) => void;
}

const Controls: React.FC<ControlsProps> = ({
  ballCount,
  onAddBall,
  onRemoveBall,
  maxBalls = 100,
  minBalls = 1,
  clickMode,
  onClickModeChange
}) => {
  return (
    <div className={styles.controls}>
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
    </div>
  );
};

export default Controls;
