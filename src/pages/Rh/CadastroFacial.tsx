import React, { useEffect, useRef, useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import * as faceapi from '@vladmandic/face-api';
import { useAuth } from '@/contexts/AuthContext';

const MODELS = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model';

export default function CadastroFacial() {
  const { user } = useAuth();
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [modo, setModo] = useState<'camera' | 'arquivo'>('camera');
  const [previewData, setPreviewData] = useState<string>('');
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODELS);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODELS);
        setReady(true);
      } catch {
        setStatus('Falha ao carregar modelos');
      }
    };
    loadModels();
  }, []);

  const iniciarCamera = async () => {
    try {
      const getUserMediaCompat = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          console.debug('Solicitando getUserMedia com constraints:', constraints);
          return await navigator.mediaDevices.getUserMedia(constraints);
        }
        const legacy: any = (navigator as any).getUserMedia || (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia;
        if (legacy) {
          console.debug('Solicitando legacy getUserMedia com constraints:', constraints);
          return await new Promise((resolve, reject) => {
            legacy.call(navigator, constraints, resolve, reject);
          });
        }
        throw Object.assign(new Error('API de mídia indisponível'), { name: 'MediaAPIUnavailable' });
      };
      let videoInputs: MediaDeviceInfo[] = [];
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devicesList = await navigator.mediaDevices.enumerateDevices().catch(() => [] as MediaDeviceInfo[]);
        videoInputs = devicesList.filter((d) => d.kind === 'videoinput');
        console.log('Dispositivos de vídeo detectados:', videoInputs.map((d) => ({ label: d.label, deviceId: d.deviceId })));
        if (!videoInputs.length) setStatus('Nenhuma câmera detectada');
      }
      const tryGet = async (constraints: MediaStreamConstraints) => getUserMediaCompat(constraints);
      let stream: MediaStream | null = null;
      try {
        stream = await tryGet({ video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } }, audio: false });
      } catch (e: any) {
        if (e && e.name === 'OverconstrainedError') {
          stream = await tryGet({ video: true, audio: false });
        } else {
          if (videoInputs.length) {
            const id = videoInputs[0].deviceId;
            stream = await tryGet({ video: { deviceId: { exact: id } }, audio: false });
          } else {
            stream = await tryGet({ video: true, audio: false });
          }
        }
      }
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream as any;
        const v = videoRef.current;
        v.onloadedmetadata = () => {
          v.play().catch(() => {});
        };
      }
    } catch (err: any) {
      console.error('Erro getUserMedia (CadastroFacial):', err);
      if (err?.name === 'NotAllowedError') setStatus('Permissão negada pelo navegador');
      else if (err?.name === 'NotFoundError') setStatus('Nenhuma câmera encontrada');
      else if (err?.name === 'NotReadableError') setStatus('Câmera em uso por outro aplicativo');
      else if (err?.name === 'SecurityError') setStatus('Contexto não seguro. Use https ou localhost');
      else if (err?.name === 'MediaAPIUnavailable') setStatus('API de mídia indisponível no navegador');
      else setStatus(`Erro ${err?.name || 'desconhecido'}: ${err?.message || ''}`);
    }
  };

  const extrairDescriptorVideo = async (): Promise<number[] | null> => {
    try {
      if (!videoRef.current) return null;
      const det = await faceapi
        .detectSingleFace(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!det || !det.descriptor) return null;
      return Array.from(det.descriptor as Float32Array);
    } catch {
      return null;
    }
  };

  const padronizarImagem = async (img: HTMLImageElement): Promise<string> => {
    const maxW = 640;
    const ratio = img.width / img.height;
    const w = Math.min(maxW, img.width || maxW);
    const h = Math.round(w / ratio);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.drawImage(img, 0, 0, w, h);
    const data = canvas.toDataURL('image/jpeg', 0.9);
    return data;
  };

  const extrairDescriptorImagem = async (dataUrl: string): Promise<number[] | null> => {
    try {
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      const det = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      if (!det || !det.descriptor) return null;
      return Array.from(det.descriptor as Float32Array);
    } catch {
      return null;
    }
  };

  const onArquivoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setArquivoSelecionado(file);
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setStatus('Formato inválido; use JPEG ou PNG');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const src = String(reader.result || '');
      const img = new Image();
      img.src = src;
      await img.decode();
      const pad = await padronizarImagem(img);
      setPreviewData(pad);
      setStatus('Imagem pronta');
    };
    reader.readAsDataURL(file);
  };

  const enviarCadastro = async () => {
    setLoading(true);
    try {
      let descriptor: number[] | null = null;
      let imageData: string | null = null;
      if (modo === 'camera') {
        descriptor = await extrairDescriptorVideo();
        if (videoRef.current) {
          const canvas = document.createElement('canvas');
          const v = videoRef.current;
          const w = v.videoWidth || 640;
          const h = v.videoHeight || 480;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(v, 0, 0, w, h);
            imageData = canvas.toDataURL('image/jpeg', 0.9);
          }
        }
      } else {
        if (!previewData) {
          setStatus('Selecione uma imagem');
          return;
        }
        descriptor = await extrairDescriptorImagem(previewData);
        imageData = previewData;
      }
      if (!descriptor) {
        setStatus('Rosto não detectado');
        return;
      }
      const uid = targetUserId || String(user?.id || '');
      const resp = await fetch('/api/face/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, descriptor, imageData })
      });
      const json = await resp.json();
      if (json?.success) {
        setStatus('Cadastro facial salvo');
      } else {
        setStatus('Erro ao salvar cadastro');
      }
    } catch {
      setStatus('Erro no envio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout userRole={user?.role || 'rh'}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Cadastro Facial</h1>
          <p className="text-gray-600">Registre a imagem facial para reconhecimento</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Identificação do Servidor</CardTitle>
            <CardDescription>Informe o ID do servidor ou use seu próprio usuário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="ID do servidor" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} />
            <div className="flex gap-2">
              <Button variant={modo === 'camera' ? 'default' : 'outline'} onClick={() => setModo('camera')}>Câmera</Button>
              <Button variant={modo === 'arquivo' ? 'default' : 'outline'} onClick={() => setModo('arquivo')}>Arquivo</Button>
              <Badge variant="outline">{status || (ready ? 'Modelos prontos' : 'Carregando modelos...')}</Badge>
            </div>
            {modo === 'camera' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button onClick={iniciarCamera}>Iniciar Câmera</Button>
                  <Button onClick={enviarCadastro} disabled={!ready || loading}>Salvar Cadastro</Button>
                </div>
                <video ref={videoRef} className="w-full rounded-lg bg-black/5" muted playsInline />
              </div>
            )}
            {modo === 'arquivo' && (
              <div className="space-y-3">
                <Input type="file" accept="image/jpeg,image/png" onChange={onArquivoChange} />
                {previewData && (
                  <img src={previewData} alt="prévia" className="w-full rounded-lg border" />
                )}
                <Button onClick={enviarCadastro} disabled={!ready || loading || !previewData}>Salvar Cadastro</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}