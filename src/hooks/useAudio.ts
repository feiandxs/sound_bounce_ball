import { useState, useEffect, useCallback, useRef } from 'react';

interface AudioHookOptions {
  sensitivity?: number;  // 灵敏度，范围 0-1
  smoothingTimeConstant?: number;  // 平滑系数
}

// 计算音量的辅助函数
const calculateVolume = (dataArray: Uint8Array): number => {
  // 使用频率数据的前70%，因为人声主要在这个范围内
  const effectiveLength = Math.floor(dataArray.length * 0.7);
  let sum = 0;
  let peak = 0;

  for (let i = 0; i < effectiveLength; i++) {
    sum += dataArray[i];
    peak = Math.max(peak, dataArray[i]);
  }

  // 结合平均值和峰值来计算音量
  const average = sum / effectiveLength;
  return (average * 0.7 + peak * 0.3) / 255;
};

export const useAudio = ({ 
  sensitivity = 0.5,
  smoothingTimeConstant = 0.8 
}: AudioHookOptions = {}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const previousVolumeRef = useRef<number>(0);

  // 初始化音频上下文和分析器
  const initAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 512;  // 增加FFT大小以获得更好的频率分辨率
      analyser.minDecibels = -90;
      analyser.maxDecibels = -10;
      analyser.smoothingTimeConstant = smoothingTimeConstant;
      
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取麦克风权限失败');
      console.error('Audio initialization error:', err);
    }
  }, [smoothingTimeConstant]);

  // 分析音量
  const analyzeVolume = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return 0;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    
    // 计算当前音量
    const currentVolume = calculateVolume(dataArrayRef.current);
    
    // 应用平滑处理和灵敏度
    const smoothedVolume = currentVolume * 0.7 + previousVolumeRef.current * 0.3;
    previousVolumeRef.current = smoothedVolume;
    
    // 应用灵敏度并设置非线性响应
    const normalizedVolume = Math.pow(smoothedVolume * sensitivity, 1.5);
    setVolume(normalizedVolume);

    return normalizedVolume;
  }, [sensitivity]);

  // 更新灵敏度
  const setSensitivity = useCallback((newSensitivity: number) => {
    if (analyserRef.current) {
      analyserRef.current.smoothingTimeConstant = smoothingTimeConstant;
    }
  }, [smoothingTimeConstant]);

  // 清理函数
  const cleanup = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
    setIsInitialized(false);
  }, []);

  return {
    isInitialized,
    volume,
    error,
    initAudio,
    analyzeVolume,
    setSensitivity,
    cleanup
  };
}; 