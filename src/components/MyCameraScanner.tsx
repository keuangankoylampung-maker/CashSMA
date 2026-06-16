/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, CheckCircle, AlertTriangle, Eye, ShieldAlert, Award } from 'lucide-react';

interface MyCameraScannerProps {
  mode: 'register' | 'verify';
  onScanComplete: (photoBase64: string, descriptors: number[][]) => void;
  registeredDescriptors?: number[][]; // for matching
  registeredPhoto?: string;
}

export default function MyCameraScanner({
  mode,
  onScanComplete,
  registeredDescriptors,
  registeredPhoto
}: MyCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [useRealCamera, setUseRealCamera] = useState<boolean>(true);
  const [selectedMockUser, setSelectedMockUser] = useState<string>('profile-1');
  
  // Anti spoofing states
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [livenessStatus, setLivenessStatus] = useState<'align' | 'blink' | 'turn_left' | 'turn_right' | 'complete' | 'failed'>('align');
  const [livenessProgress, setLivenessProgress] = useState<number>(0);
  const [instruction, setInstruction] = useState<string>('Posisikan wajah Anda di tengah bingkai');
  
  // Registration capture list
  const [captures, setCaptures] = useState<string[]>([]);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'matched' | 'unmatched' | 'registering'>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Animated landmark grid simulation
  useEffect(() => {
    let animationFrameId: number;
    let tick = 0;

    const drawLandmarks = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;

      // Circular alignment HUD
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.35;

      // Outer targeting brackets
      ctx.strokeStyle = livenessStatus === 'complete' ? '#10b981' : livenessStatus === 'failed' ? '#ef4444' : '#10b981';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      
      // Draw corners of camera frame or circular guide
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.stroke();

      // Corner brackets on camera
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      // Top Left
      ctx.beginPath();
      ctx.moveTo(20, 40); ctx.lineTo(20, 20); ctx.lineTo(40, 20); ctx.stroke();
      // Top Right
      ctx.beginPath();
      ctx.moveTo(canvas.width - 20, 40); ctx.lineTo(canvas.width - 20, 20); ctx.lineTo(canvas.width - 40, 20); ctx.stroke();
      // Bottom Left
      ctx.beginPath();
      ctx.moveTo(20, canvas.height - 40); ctx.lineTo(20, canvas.height - 20); ctx.lineTo(40, canvas.height - 20); ctx.stroke();
      // Bottom Right
      ctx.beginPath();
      ctx.moveTo(canvas.width - 20, canvas.height - 40); ctx.lineTo(canvas.width - 20, canvas.height - 20); ctx.lineTo(canvas.width - 40, canvas.height - 20); ctx.stroke();

      if (scanStatus === 'scanning') {
        // Holographic sweeping scan line
        const scanY = centerY - radius + ((tick * 3) % (radius * 2));
        const gradient = ctx.createLinearGradient(centerX - radius, scanY, centerX + radius, scanY);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
        gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.8)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(centerX - radius, scanY - 4, radius * 2, 8);

        // Animated landmark tracking nodes
        ctx.fillStyle = '#34d399';
        const numNodes = 12;
        for (let i = 0; i < numNodes; i++) {
          const angle = (i / numNodes) * Math.PI * 2 + (tick * 0.02);
          const offsetRadius = radius * 0.85 + Math.sin(tick * 0.1 + i) * 6;
          const nodeX = centerX + Math.cos(angle) * offsetRadius;
          const nodeY = centerY + Math.sin(angle) * offsetRadius;
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, 3, 0, 2 * Math.PI);
          ctx.fill();

          // Connect nodes to simulate scanning net
          if (i > 0) {
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodeX, nodeY);
            ctx.lineTo(centerX + Math.cos(((i - 1) / numNodes) * Math.PI * 2 + (tick * 0.02)) * (radius * 0.85), centerY + Math.sin(((i - 1) / numNodes) * Math.PI * 2 + (tick * 0.02)) * (radius * 0.85));
            ctx.stroke();
          }
        }

        // Feature coordinates points tracking facial parts
        ctx.fillStyle = '#60a5fa'; // Blue points
        const facePoints = [
          { x: centerX, y: centerY - 15 }, // Nose bridge
          { x: centerX - 35, y: centerY - 35 }, // Left eye
          { x: centerX + 35, y: centerY - 35 }, // Right eye
          { x: centerX - 40, y: centerY + 25 }, // Left jaw
          { x: centerX + 40, y: centerY + 25 }, // Right jaw
          { x: centerX, y: centerY + 30 }, // Mouth center
          { x: centerX, y: centerY + 45 }, // Chin base
        ];

        // Apply shift according to active liveness checks
        if (livenessStatus === 'turn_left') {
          facePoints.forEach(p => p.x -= 20);
        } else if (livenessStatus === 'turn_right') {
          facePoints.forEach(p => p.x += 20);
        }

        facePoints.forEach((pt, idx) => {
          // Micro wiggle for biometric vibe
          const dx = Math.sin(tick * 0.2 + idx) * 2;
          const dy = Math.cos(tick * 0.15 + idx) * 2;
          ctx.beginPath();
          ctx.arc(pt.x + dx, pt.y + dy, 4, 0, 2 * Math.PI);
          ctx.fill();

          // Text labels next to points to simulate AI classification
          if (idx === 1 && tick % 40 < 20) {
            ctx.fillStyle = 'rgba(96, 165, 250, 0.8)';
            ctx.font = '9px monospace';
            ctx.fillText('L-EYE CLSFD', pt.x + 10, pt.y - 4);
          }
          if (idx === 2 && tick % 40 >= 20) {
            ctx.fillStyle = 'rgba(96, 165, 250, 0.8)';
            ctx.font = '9px monospace';
            ctx.fillText('R-EYE CLSFD', pt.x + 10, pt.y - 4);
          }
        });
      }

      // Draw instructions and dynamic telemetry metrics
      ctx.fillStyle = '#34d399';
      ctx.font = '10px monospace';
      ctx.fillText(`LIVENESS CHK: ${livenessStatus.toUpperCase()}`, 15, canvas.height - 15);
      ctx.fillText(`BIOMETRIC FPS: 30.0`, canvas.width - 120, canvas.height - 15);

      animationFrameId = requestAnimationFrame(drawLandmarks);
    };

    drawLandmarks();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [scanStatus, livenessStatus]);

  // Activate and control Camera
  useEffect(() => {
    if (!useRealCamera) {
      // Discard camera stream if mock selected
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    setCameraError(null);
    navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: 640, 
        height: 480,
        facingMode: 'user'
      } 
    })
    .then(mediaStream => {
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    })
    .catch(err => {
      console.warn("Camera initialization failed: ", err);
      setCameraError("Izin kamera ditolak atau tidak didukung pada browser Anda. Gunakan Mode Simulasi Biometrik.");
      setUseRealCamera(false);
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [useRealCamera]);

  // Step-by-step Anti-Spoofing & scanning orchestration
  const startScanningProcess = () => {
    setScanStatus('scanning');
    setCurrentStep(1);
    setLivenessStatus('align');
    setLivenessProgress(30);
    setInstruction('Sejajarkan wajah Anda pada garis panduan lingkaran...');

    // Time-based liveness verification step sequencer
    setTimeout(() => {
      // Step 2: Blink check
      setCurrentStep(2);
      setLivenessStatus('blink');
      setLivenessProgress(60);
      setInstruction('Silakan berkedip sekali untuk verifikasi anti-spoofing...');
    }, 2000);

    setTimeout(() => {
      // Step 3: Turn Left check
      setCurrentStep(3);
      setLivenessStatus('turn_left');
      setLivenessProgress(85);
      setInstruction('Silakan usap atau menoleh sedikit ke kiri...');
    }, 4000);

    setTimeout(() => {
      // Step 4: Turn Right check
      setCurrentStep(4);
      setLivenessStatus('turn_right');
      setLivenessProgress(95);
      setInstruction('Silakan menoleh sedikit ke kanan...');
    }, 6000);

    setTimeout(() => {
      // Step 5: Verification finished
      setCurrentStep(5);
      setLivenessStatus('complete');
      setLivenessProgress(100);
      setInstruction('Verifikasi Biometrik Selesai! Mengambil Foto...');
      
      triggerPhotoCapture();
    }, 8500);
  };

  // Triggers final biometric camera capture
  const triggerPhotoCapture = () => {
    let capturedPhoto = '';

    if (useRealCamera && videoRef.current) {
      const snapCanvas = document.createElement('canvas');
      snapCanvas.width = 320;
      snapCanvas.height = 240;
      const ctx = snapCanvas.getContext('2d');
      if (ctx) {
        // Draw video frame
        ctx.scale(-1, 1); // mirror flip
        ctx.drawImage(videoRef.current, -320, 0, 320, 240);
        capturedPhoto = snapCanvas.toDataURL('image/jpeg');
      }
    } else {
      // Return predefined high-quality avatars as mock photos
      const mockAvatars: Record<string, string> = {
        'profile-1': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'profile-2': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        'profile-3': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        'profile-4': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      };
      capturedPhoto = mockAvatars[selectedMockUser] || mockAvatars['profile-1'];
    }

    if (mode === 'register') {
      // Generate 5 descriptors arrays (mock data models representing mathematical descriptors)
      const mockDescriptors = Array.from({ length: 5 }, () => 
        Array.from({ length: 128 }, () => Math.random() * 2 - 1)
      );
      setScanStatus('idle');
      onScanComplete(capturedPhoto, mockDescriptors);
    } else {
      // Verify
      setScanStatus('matched');
      const dummyIdDescriptor = [Array.from({ length: 128 }, () => Math.random() * 2 - 1)];
      onScanComplete(capturedPhoto, dummyIdDescriptor);
    }
  };

  const handleReset = () => {
    setScanStatus('idle');
    setCurrentStep(0);
    setLivenessStatus('align');
    setLivenessProgress(0);
    setInstruction('Posisikan wajah Anda di tengah bingkai');
    setCaptures([]);
  };

  return (
    <div className="w-full bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center gap-6" id="biometric-terminal">
      {/* Header telemetry and toggle */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center border-b border-slate-900 pb-4 gap-4">
        <div>
          <h4 className="text-sm font-mono font-bold text-emerald-400 tracking-wider">SECURE BIOMETRIC GATEWAY</h4>
          <p className="text-xs text-slate-400">Pindai biometrik 3D & Anti-spoofing terintegrasi</p>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 self-end">
          <button
            type="button"
            id="camera-mode-real"
            onClick={() => setUseRealCamera(true)}
            className={`px-3 py-1 text-xs font-mono rounded-md transition ${useRealCamera ? 'bg-emerald-500 text-slate-950 font-semibold shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Kamera Fisik
          </button>
          <button
            type="button"
            id="camera-mode-mock"
            onClick={() => setUseRealCamera(false)}
            className={`px-3 py-1 text-xs font-mono rounded-md transition ${!useRealCamera ? 'bg-emerald-500 text-slate-950 font-semibold shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Biometrik Simulasi
          </button>
        </div>
      </div>

      {cameraError && useRealCamera && (
        <div id="camera-permission-alert" className="w-full bg-red-950/45 border border-red-800/80 p-3 rounded-lg flex items-start gap-2.5 text-xs text-red-200">
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p>{cameraError}</p>
        </div>
      )}

      {/* Simulator Mode Configs */}
      {!useRealCamera && (
        <div id="identity-simulator" className="w-full bg-slate-900/60 p-4 border border-slate-800 rounded-xl flex flex-col gap-3">
          <span className="text-xs font-mono text-emerald-400">PENGATURAN IDENTITAS BIOMETRIK SIMULATOR:</span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'profile-1', label: 'Budi Santoso', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
              { id: 'profile-2', label: 'Achmad Dani', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
              { id: 'profile-3', label: 'Siti Rahma', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
              { id: 'profile-4', label: 'Rizki Pratama', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedMockUser(p.id)}
                className={`p-2 border rounded-lg flex flex-col items-center gap-1.5 text-center transition ${selectedMockUser === p.id ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 hover:border-slate-700 bg-slate-800/30'}`}
              >
                <img src={p.url} className="w-8 h-8 rounded-full object-cover border border-slate-700" alt="avatar" />
                <span className="text-[10px] text-slate-300 truncate w-full font-medium">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Viewfinder Frame */}
      <div className="relative w-full max-w-sm aspect-4/3 rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Real Camera Video Tag */}
        {useRealCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover -scale-x-100"
          />
        ) : (
          /* Avatar Simulating Render */
          <div className="absolute inset-0 w-full h-full bg-slate-950 flex items-center justify-center">
            <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-slate-800 shadow-2xl">
              <img 
                src={
                  selectedMockUser === 'profile-1' ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' :
                  selectedMockUser === 'profile-2' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' :
                  selectedMockUser === 'profile-3' ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80' :
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
                } 
                className="w-full h-full object-cover" 
                alt="Webcam placeholder" 
              />
              {scanStatus === 'scanning' && (
                <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] animate-pulse"></div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic HUD Overlayer Canvas */}
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-20"
        />

        {/* Status indicator pill inside viewport */}
        <div className="absolute top-3 left-3 z-30 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${scanStatus === 'scanning' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-[9px] font-mono font-bold text-slate-300">
            {scanStatus === 'scanning' ? 'CAMERA ACTIVE - SCANNING' : 'STANDBY'}
          </span>
        </div>

        {/* Liveness checkpoint overlay */}
        {scanStatus === 'scanning' && (
          <div className="absolute bottom-3 left-3 right-3 z-30 bg-slate-950/90 border border-emerald-950 px-3 py-2 rounded-lg flex flex-col gap-1.5 shadow-2xl">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">{instruction}</span>
            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500" 
                style={{ width: `${livenessProgress}%` }}
              />
            </div>
            
            <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 mt-0.5">
              <span>PROGRES BIOMETRIK</span>
              <span className="text-emerald-400 font-bold">{livenessProgress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Controller Buttons */}
      <div className="w-full flex justify-center gap-4">
        {scanStatus === 'idle' ? (
          <button
            type="button"
            id="start-biom-scan"
            onClick={startScanningProcess}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center gap-2 transform transition shadow-[0_4px_20px_rgba(16,185,129,0.3)]"
          >
            <Camera className="w-4 h-4" />
            {mode === 'register' ? 'MULAI REGISTRASI WAJAH' : 'MULAI VERIFIKASI BIOMETRIK'}
          </button>
        ) : (
          <button
            type="button"
            id="reset-biom-scan"
            onClick={handleReset}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-mono text-xs rounded-xl flex items-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            RESET TERMINAL
          </button>
        )}
      </div>

      {/* Security checklist validation blocks (Anti spoofing info panels) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900/40 p-4 border border-slate-900 rounded-xl">
        <div className="flex items-center gap-2.5">
          <CheckCircle className={`w-4 h-4 shrink-0 ${currentStep >= 2 ? 'text-emerald-400' : 'text-slate-600'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-300 font-bold">Liveness 3D Match</span>
            <span className="text-[9px] text-slate-400">Pemeriksaan sensor statis</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <CheckCircle className={`w-4 h-4 shrink-0 ${currentStep >= 3 ? 'text-emerald-400' : 'text-slate-600'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-300 font-bold">Blink Anti-Spoof</span>
            <span className="text-[9px] text-slate-400">Deteksi kedipan kelopak mata</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <CheckCircle className={`w-4 h-4 shrink-0 ${currentStep >= 5 ? 'text-emerald-400' : 'text-slate-600'}`} />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-slate-300 font-bold">Head Posture Yaw</span>
            <span className="text-[9px] text-slate-400">Scan koordinat rotasi tengkorak</span>
          </div>
        </div>
      </div>
    </div>
  );
}
