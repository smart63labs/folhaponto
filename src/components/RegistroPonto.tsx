import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Calendar,
  Timer,
  LogIn,
  LogOut,
  Wifi,
  WifiOff,
  Fingerprint
} from "lucide-react";
import { Camera, ScanFace } from "lucide-react";
import * as faceapi from '@vladmandic/face-api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { useAuth } from "@/contexts/AuthContext";

interface RegistroAtual {
  tipo: 'entrada' | 'saida' | 'intervalo_inicio' | 'intervalo_fim';
  horario: string;
  localizacao?: string;
  id: string;
}

interface RegistroDia {
  data: string;
  registros: RegistroAtual[];
  horasTrabalhadasDia: string;
  status: 'completo' | 'incompleto' | 'pendente';
}

export const RegistroPonto: React.FC = () => {
  const { isOnline, addToOfflineQueue, getPendingSyncCount } = useOfflineStorage();
  const { user } = useAuth();
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [registrosHoje, setRegistrosHoje] = useState<RegistroAtual[]>([]);
  const [localizacaoAtual, setLocalizacaoAtual] = useState<string>('');
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);
  const [ultimoRegistro, setUltimoRegistro] = useState<RegistroAtual | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [turnoContinuo, setTurnoContinuo] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [captura, setCaptura] = useState<string>('');
  const [prevTipo, setPrevTipo] = useState<'entrada' | 'saida_almoco' | 'volta_almoco' | 'saida' | null>(null);
  const [prevHorario, setPrevHorario] = useState<string>('');
  const [prevConf, setPrevConf] = useState<number>(0);
  const [prevCarregando, setPrevCarregando] = useState(false);
  const [modalFaceOpen, setModalFaceOpen] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [modoRegistro, setModoRegistro] = useState<'manual' | 'facial' | 'biometria'>('manual');

  // Estados do modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Atualizar hora atual a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      // Configurar timezone de Brasília-DF
      const agora = new Date();
      const brasiliaTime = new Date(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
      setHoraAtual(brasiliaTime);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Carregar registros do dia atual (mock data)
  useEffect(() => {
    const registrosMock: RegistroAtual[] = [
      {
        id: '1',
        tipo: 'entrada',
        horario: '08:00:00',
        localizacao: 'SEFAZ-TO - Palmas'
      }
    ];
    setRegistrosHoje(registrosMock);
    setUltimoRegistro(registrosMock[registrosMock.length - 1] || null);
  }, []);

  useEffect(() => {
    const v = localStorage.getItem('turno_continuo');
    setTurnoContinuo(v === 'true');
  }, []);

  // Atualizar contador de sincronização pendente
  useEffect(() => {
    const updatePendingCount = () => {
      setPendingSyncCount(getPendingSyncCount());
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000); // Atualiza a cada 5 segundos

    return () => clearInterval(interval);
  }, [getPendingSyncCount]);

  // Obter localização atual
  const obterLocalizacao = async () => {
    setCarregandoLocalizacao(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords as GeolocationCoordinates;
            setCoords({ latitude, longitude });
            setLocalizacaoAtual(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
            setCarregandoLocalizacao(false);
          },
          (error) => {
            setLocalizacaoAtual('Localização não disponível');
            setCarregandoLocalizacao(false);
          }
        );
      } else {
        setLocalizacaoAtual('Geolocalização não suportada');
        setCarregandoLocalizacao(false);
      }
    } catch (error) {
      setLocalizacaoAtual('Erro ao obter localização');
      setCarregandoLocalizacao(false);
    }
  };

  // Determinar próximo tipo de registro
  const determinarProximoTipo = (): 'entrada' | 'saida' | 'intervalo_inicio' | 'intervalo_fim' => {
    if (registrosHoje.length === 0) return 'entrada';

    const ultimoTipo = ultimoRegistro?.tipo;
    if (turnoContinuo) {
      switch (ultimoTipo) {
        case 'entrada':
          return 'saida';
        case 'saida':
          return 'entrada';
        default:
          return 'entrada';
      }
    }

    switch (ultimoTipo) {
      case 'entrada':
        return 'intervalo_inicio';
      case 'intervalo_inicio':
        return 'intervalo_fim';
      case 'intervalo_fim':
        return 'saida';
      case 'saida':
        return 'entrada'; // Caso de horas extras ou segundo turno
      default:
        return 'entrada';
    }
  };

  // Validar horário de registro
  const validarHorario = (tipo: string, horario: Date): { valido: boolean; mensagem?: string } => {
    const horaAtual = horario.getHours();
    const minutoAtual = horario.getMinutes();
    const diaSemana = horario.getDay(); // 0 = domingo, 6 = sábado

    // Validar se é dia útil (segunda a sexta) - Comentado temporariamente para permitir testes
    // if (diaSemana === 0 || diaSemana === 6) {
    //   return { valido: false, mensagem: 'Registro de ponto não permitido em finais de semana' };
    // }

    // Validações básicas de horário comercial
    if (tipo === 'entrada' && horaAtual < 6) {
      return { valido: false, mensagem: 'Horário muito cedo para entrada (antes das 06:00)' };
    }

    if (tipo === 'saida' && horaAtual > 22) {
      return { valido: false, mensagem: 'Horário muito tarde para saída (após 22:00)' };
    }

    // Validar horário de almoço (11:30 às 14:00) - Comentado para testes
    // if (tipo === 'intervalo_inicio' && (horaAtual < 11 || (horaAtual === 11 && minutoAtual < 30))) {
    //   return { valido: false, mensagem: 'Intervalo de almoço só pode iniciar após 11:30' };
    // }

    if (tipo === 'intervalo_inicio' && horaAtual >= 14) {
      return { valido: false, mensagem: 'Intervalo de almoço deve iniciar antes das 14:00' };
    }

    // Validar duração mínima do intervalo (30 minutos)
    if (tipo === 'intervalo_fim' && ultimoRegistro?.tipo === 'intervalo_inicio') {
      const [horaUltimo, minutoUltimo] = ultimoRegistro.horario.split(':').map(Number);
      const minutosUltimo = horaUltimo * 60 + minutoUltimo;
      const minutosAtual = horaAtual * 60 + minutoAtual;

      if (minutosAtual - minutosUltimo < 30) {
        return { valido: false, mensagem: 'Intervalo de almoço deve ter no mínimo 30 minutos' };
      }

      if (minutosAtual - minutosUltimo > 120) {
        return { valido: false, mensagem: 'Intervalo de almoço não pode exceder 2 horas' };
      }
    }

    // Validar jornada de trabalho (máximo 10 horas)
    if (tipo === 'saida' && registrosHoje.length >= 2) {
      const primeiraEntrada = registrosHoje.find(r => r.tipo === 'entrada');
      if (primeiraEntrada) {
        const [horaEntrada, minutoEntrada] = primeiraEntrada.horario.split(':').map(Number);
        const minutosEntrada = horaEntrada * 60 + minutoEntrada;
        const minutosAtual = horaAtual * 60 + minutoAtual;

        // Calcular tempo de intervalo
        const intervaloInicio = registrosHoje.find(r => r.tipo === 'intervalo_inicio');
        const intervaloFim = registrosHoje.find(r => r.tipo === 'intervalo_fim');
        let minutosIntervalo = 0;

        if (intervaloInicio && intervaloFim) {
          const [horaInicioInt, minutoInicioInt] = intervaloInicio.horario.split(':').map(Number);
          const [horaFimInt, minutoFimInt] = intervaloFim.horario.split(':').map(Number);
          minutosIntervalo = (horaFimInt * 60 + minutoFimInt) - (horaInicioInt * 60 + minutoInicioInt);
        }

        const jornadaMinutos = turnoContinuo
          ? (minutosAtual - minutosEntrada)
          : (minutosAtual - minutosEntrada) - minutosIntervalo;

        if (jornadaMinutos > 600) { // 10 horas = 600 minutos
          return { valido: false, mensagem: 'Jornada de trabalho não pode exceder 10 horas' };
        }

        if (jornadaMinutos < 480) { // 8 horas = 480 minutos
          return { valido: false, mensagem: 'Jornada mínima de 8 horas não cumprida' };
        }
      }
    }

    // Validar intervalo mínimo entre registros (5 minutos)
    if (ultimoRegistro) {
      const [horaUltimo, minutoUltimo] = ultimoRegistro.horario.split(':').map(Number);
      const minutosUltimo = horaUltimo * 60 + minutoUltimo;
      const minutosAtual = horaAtual * 60 + minutoAtual;

      if (minutosAtual - minutosUltimo < 5) {
        return { valido: false, mensagem: 'Intervalo mínimo de 5 minutos entre registros' };
      }
    }

    // Validar sequência lógica de registros
    if (turnoContinuo) {
      if (tipo === 'entrada' && registrosHoje.length > 0 && ultimoRegistro?.tipo !== 'saida') {
        return { valido: false, mensagem: 'Você deve registrar a saída antes de uma nova entrada' };
      }
      if (tipo === 'saida' && ultimoRegistro?.tipo !== 'entrada') {
        return { valido: false, mensagem: 'Sequência de registros inválida para saída' };
      }
    } else {
      if (tipo === 'entrada' && registrosHoje.length > 0 && ultimoRegistro?.tipo !== 'saida') {
        return { valido: false, mensagem: 'Você deve registrar a saída antes de uma nova entrada' };
      }
      if (tipo === 'intervalo_inicio' && ultimoRegistro?.tipo !== 'entrada') {
        return { valido: false, mensagem: 'Você deve registrar a entrada antes do início do intervalo' };
      }
      if (tipo === 'intervalo_fim' && ultimoRegistro?.tipo !== 'intervalo_inicio') {
        return { valido: false, mensagem: 'Você deve registrar o início do intervalo antes do fim' };
      }
      if (tipo === 'saida' && ultimoRegistro?.tipo !== 'intervalo_fim' && ultimoRegistro?.tipo !== 'entrada') {
        return { valido: false, mensagem: 'Sequência de registros inválida para saída' };
      }
    }

    return { valido: true };
  };

  // Registrar ponto
  const registrarPonto = async (tipoForcado?: 'entrada' | 'saida' | 'intervalo_inicio' | 'intervalo_fim') => {
    const agora = new Date();
    const proximoTipo = tipoForcado || determinarProximoTipo();

    // Validar horário
    const validacao = validarHorario(proximoTipo, agora);
    if (!validacao.valido) {
      setModalTitle("Erro na validação");
      setModalMessage(validacao.mensagem);
      setModalType("error");
      setModalOpen(true);
      return;
    }

    if (!localizacaoAtual || !coords) {
      await obterLocalizacao();
    }
    const userSectorId = (user as any)?.sectorId || (user as any)?.setorId || null;
    if (isOnline && coords) {
      try {
        const resp = await fetch('/api/geo/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setorId: userSectorId, latitude: coords.latitude, longitude: coords.longitude })
        });
        const json = await resp.json();
        const allowed = json?.data?.allowed ?? true;
        if (!allowed) {
          await fetch('/api/audit/irregularities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.id,
              setorId: userSectorId,
              latitude: coords.latitude,
              longitude: coords.longitude,
              action: 'POINT_REGISTER',
              reason: 'Fora da Zona Segura'
            })
          });
          await fetch('/api/alerts/manager', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user?.id,
              setorId: userSectorId,
              message: 'Registro de ponto fora da Zona Segura',
              metadata: { tipo: proximoTipo, horario: agora.toTimeString().slice(0, 8) }
            })
          });
          setModalTitle('Zona Segura');
          setModalMessage('Você está fora da Zona Segura do seu setor. Registro bloqueado.');
          setModalType('error');
          setModalOpen(true);
          return;
        }
      } catch { }
    }

    const novoRegistro: RegistroAtual = {
      id: Date.now().toString(),
      tipo: proximoTipo,
      horario: agora.toTimeString().slice(0, 8),
      localizacao: localizacaoAtual || 'SEFAZ-TO - Palmas'
    };

    // Atualizar estado local imediatamente
    setRegistrosHoje(prev => [...prev, novoRegistro]);
    setUltimoRegistro(novoRegistro);

    if (!isOnline) {
      await addToOfflineQueue({
        type: 'registro_ponto',
        data: novoRegistro,
        timestamp: Date.now()
      });

      setModalTitle("Ponto registrado offline!");
      setModalMessage(`${getTipoLabel(proximoTipo)} salva localmente. Será sincronizada quando conectar.`);
      setModalType("warning");
      setModalOpen(true);
    } else {
      // Simular salvamento online (aqui seria uma chamada à API)
      setModalTitle("Ponto registrado com sucesso!");
      setModalMessage(`${getTipoLabel(proximoTipo)} registrada às ${novoRegistro.horario}`);
      setModalType("success");
      setModalOpen(true);
    }
  };

  const [cameraStatus, setCameraStatus] = useState('');

  const iniciarCamera = async () => {
    setCameraStatus('Iniciando câmera...');

    // Verificação de contexto seguro
    if (!window.isSecureContext) {
      const msg = 'Acesso à câmera requer contexto seguro (HTTPS ou localhost).';
      console.error(msg);
      setCameraStatus(msg);
      setModalTitle("Erro de Segurança");
      setModalMessage(msg);
      setModalType("error");
      setModalOpen(true);
      return;
    }

    try {
      const getUserMediaCompat = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          console.debug('Solicitando getUserMedia com constraints:', constraints);
          return await navigator.mediaDevices.getUserMedia(constraints);
        }

        // Fallback para navegadores antigos
        const legacy: any = (navigator as any).getUserMedia ||
          (navigator as any).webkitGetUserMedia ||
          (navigator as any).mozGetUserMedia ||
          (navigator as any).msGetUserMedia;

        if (legacy) {
          console.debug('Solicitando legacy getUserMedia com constraints:', constraints);
          return await new Promise((resolve, reject) => {
            legacy.call(navigator, constraints, resolve, reject);
          });
        }

        throw Object.assign(new Error('API de mídia indisponível'), { name: 'MediaAPIUnavailable' });
      };

      let videoInputs: MediaDeviceInfo[] = [];

      // Tentar listar dispositivos
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
          const devicesList = await navigator.mediaDevices.enumerateDevices();
          videoInputs = devicesList.filter((d) => d.kind === 'videoinput');
          console.log('Dispositivos de vídeo detectados:', videoInputs.map((d) => ({ label: d.label, deviceId: d.deviceId })));

          if (videoInputs.length === 0) {
            console.warn('Nenhum dispositivo de vídeo encontrado via enumerateDevices');
          }
        }
      } catch (err) {
        console.warn('Erro ao listar dispositivos:', err);
      }

      const tryGet = async (constraints: MediaStreamConstraints) => getUserMediaCompat(constraints);
      let stream: MediaStream | null = null;

      try {
        // Tentativa 1: Câmera frontal ideal
        stream = await tryGet({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      } catch (e: any) {
        console.warn('Tentativa 1 falhou:', e);

        try {
          // Tentativa 2: Qualquer vídeo
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
        } catch (e2) {
          console.warn('Tentativa 2 falhou:', e2);
          throw e2; // Lança o erro da última tentativa
        }
      }

      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream as any;
        const v = videoRef.current;
        v.onloadedmetadata = () => {
          v.play().catch((e) => console.error('Erro ao dar play no vídeo:', e));
        };
        setCameraStatus('Câmera ligada');
      }
    } catch (err: any) {
      console.error('Erro fatal getUserMedia:', err);
      let msg = `Erro ao acessar câmera: ${err?.message || 'Desconhecido'}`;

      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        msg = 'Permissão de câmera negada. Verifique as configurações do navegador.';
      } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
        msg = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
        msg = 'Câmera em uso por outro aplicativo ou erro de hardware.';
      } else if (err?.name === 'SecurityError') {
        msg = 'Acesso à câmera bloqueado por segurança (contexto inseguro?).';
      } else if (err?.name === 'MediaAPIUnavailable') {
        msg = 'Seu navegador não suporta acesso à câmera ou o acesso está bloqueado (verifique se está usando HTTPS).';
      }

      setCameraStatus(msg);
      setModalTitle("Erro na Câmera");
      setModalMessage(msg);
      setModalType("error");
      setModalOpen(true);
    }
  };

  const capturarFrame = (): string => {
    const video = videoRef.current;
    if (!video) return '';
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL('image/jpeg', 0.8);
    return data;
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODELS = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model';
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODELS);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODELS);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODELS);
        setModelsReady(true);
      } catch { }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (modalFaceOpen) {
      iniciarCamera();
    } else {
      const stream = videoRef.current?.srcObject as MediaStream | null;
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        videoRef.current!.srcObject = null as any;
      }
    }
  }, [modalFaceOpen]);

  useEffect(() => {
    try {
      const m = localStorage.getItem('modo_registro_ponto');
      if (m === 'facial' || m === 'manual' || m === 'biometria') setModoRegistro(m as any);
    } catch { }
  }, []);

  const extrairDescriptor = async (): Promise<number[] | null> => {
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

  const verificarFacial = async () => {
    setPrevCarregando(true);
    try {
      if (!videoRef.current || !(videoRef.current.srcObject)) {
        await iniciarCamera();
      }
      const data = capturarFrame();
      setCaptura(data);
      const descriptor = await extrairDescriptor();
      if (!descriptor) {
        setPrevTipo(null);
        setPrevHorario('');
        setPrevConf(0);
        return;
      }
      const uid = String((user as any)?.id || '');
      const resp = await fetch('/api/face/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid, descriptor })
      });
      const json = await resp.json();
      const ok = json?.data?.matched === true;
      const now = new Date();
      const sugTipo = determinarProximoTipo();
      setPrevTipo(ok ? mapPredictToTipo(mapPredictToTipo(sugTipo as any) as any) : null);
      setPrevHorario(now.toTimeString().slice(0, 8));
      setPrevConf(ok ? 0.9 : 0.0);
    } catch {
    } finally {
      setPrevCarregando(false);
    }
  };

  const mapPredictToTipo = (p: 'entrada' | 'saida_almoco' | 'volta_almoco' | 'saida'): 'entrada' | 'saida' | 'intervalo_inicio' | 'intervalo_fim' => {
    if (p === 'saida_almoco') return 'intervalo_inicio';
    if (p === 'volta_almoco') return 'intervalo_fim';
    if (p === 'saida') return 'saida';
    return 'entrada';
  };

  const mapTipoToPredict = (t: 'entrada' | 'saida' | 'intervalo_inicio' | 'intervalo_fim'): 'entrada' | 'saida_almoco' | 'volta_almoco' | 'saida' => {
    if (t === 'intervalo_inicio') return 'saida_almoco';
    if (t === 'intervalo_fim') return 'volta_almoco';
    return t as 'entrada' | 'saida';
  };

  // Obter label do tipo de registro
  const getTipoLabel = (tipo: string): string => {
    const labels = {
      'entrada': 'Entrada',
      'saida': 'Saída',
      'intervalo_inicio': 'Início do Intervalo',
      'intervalo_fim': 'Fim do Intervalo'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  // Obter cor do badge por tipo
  const getTipoCor = (tipo: string): string => {
    const cores = {
      'entrada': 'bg-green-500',
      'saida': 'bg-red-500',
      'intervalo_inicio': 'bg-yellow-500',
      'intervalo_fim': 'bg-blue-500'
    };
    return cores[tipo as keyof typeof cores] || 'bg-gray-500';
  };

  // Calcular horas trabalhadas hoje
  const calcularHorasHoje = (): string => {
    if (registrosHoje.length < 2) return '0h 0m';

    // Lógica simplificada - em produção seria mais complexa
    const entrada = registrosHoje.find(r => r.tipo === 'entrada');
    const saida = registrosHoje.find(r => r.tipo === 'saida');

    if (entrada && saida) {
      return '8h 30m'; // Mock
    }

    return '4h 15m'; // Mock para meio período
  };

  const proximoTipo = determinarProximoTipo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">

          {pendingSyncCount > 0 && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              {pendingSyncCount} pendente{pendingSyncCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas Hoje</p>
                <p className="text-3xl font-bold text-blue-600">{calcularHorasHoje()}</p>
                <p className="text-xs text-gray-500 mt-1">Trabalhadas</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Registros Hoje</p>
                <p className="text-3xl font-bold text-green-600">{registrosHoje.length}</p>
                <p className="text-xs text-gray-500 mt-1">Batidas</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-lg font-bold text-purple-600">
                  {registrosHoje.length === 0 ? 'Aguardando' :
                    registrosHoje.length % 2 === 1 ? 'Trabalhando' : 'Finalizado'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Atual</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Próximo</p>
                <p className="text-lg font-bold text-orange-600">{getTipoLabel(proximoTipo)}</p>
                <p className="text-xs text-gray-500 mt-1">Registro</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                {proximoTipo === 'entrada' && <LogIn className="w-8 h-8 text-orange-600" />}
                {proximoTipo === 'saida' && <LogOut className="w-8 h-8 text-orange-600" />}
                {(proximoTipo === 'intervalo_inicio' || proximoTipo === 'intervalo_fim') && <Timer className="w-8 h-8 text-orange-600" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relógio e Ação Principal */}
      {modoRegistro === 'manual' && (
        <Card className="border-l-4 border-l-indigo-500 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div>
                <div className="text-6xl font-bold text-indigo-600 mb-2">
                  {horaAtual.toLocaleTimeString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                    hour12: false
                  })}
                </div>
                <div className="text-lg text-gray-600 font-medium">
                  {horaAtual.toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'America/Sao_Paulo'
                  })}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Horário de Brasília - DF
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{localizacaoAtual || 'Obtendo localização...'}</span>
                {!localizacaoAtual && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={obterLocalizacao}
                    disabled={carregandoLocalizacao}
                  >
                    {carregandoLocalizacao ? 'Carregando...' : 'Atualizar'}
                  </Button>
                )}
              </div>

              <Button
                onClick={registrarPonto}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full max-w-md h-16 text-lg font-semibold shadow-lg"
              >
                {proximoTipo === 'entrada' && <LogIn className="mr-2 h-6 w-6" />}
                {proximoTipo === 'saida' && <LogOut className="mr-2 h-6 w-6" />}
                {(proximoTipo === 'intervalo_inicio' || proximoTipo === 'intervalo_fim') && <Timer className="mr-2 h-6 w-6" />}
                Registrar {getTipoLabel(proximoTipo)}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {modoRegistro === 'facial' && (
        <Card className="overflow-hidden border-l-4 border-l-purple-500 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-purple-100 rounded-2xl border border-purple-100">
                  <ScanFace className="w-10 h-10 text-purple-600" />
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                    Reconhecimento Facial
                  </h3>
                  <p className="text-gray-600 max-w-md text-lg">
                    Utilize nossa tecnologia segura para registrar seu ponto através da sua biometria facial.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setModalFaceOpen(true)}
                size="lg"
                className="bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 transition-all duration-300 font-semibold shadow-lg h-14 px-8 text-lg rounded-xl group"
              >
                <Camera className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Iniciar Reconhecimento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {modoRegistro === 'facial' && (
        <Dialog open={modalFaceOpen} onOpenChange={setModalFaceOpen}>
          <DialogContent className="sm:max-w-4xl bg-white text-gray-900 p-0 overflow-hidden gap-0">
            <div className="grid md:grid-cols-5 h-[600px]">
              {/* Coluna da Câmera */}
              <div className="md:col-span-3 bg-black relative flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover opacity-90"
                  muted
                  playsInline
                />

                {/* Overlay de Escaneamento */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full relative">
                    {/* Cantos do Frame */}
                    <div className="absolute top-12 left-12 w-16 h-16 border-l-4 border-t-4 border-purple-500 rounded-tl-3xl opacity-80" />
                    <div className="absolute top-12 right-12 w-16 h-16 border-r-4 border-t-4 border-purple-500 rounded-tr-3xl opacity-80" />
                    <div className="absolute bottom-12 left-12 w-16 h-16 border-l-4 border-b-4 border-purple-500 rounded-bl-3xl opacity-80" />
                    <div className="absolute bottom-12 right-12 w-16 h-16 border-r-4 border-b-4 border-purple-500 rounded-br-3xl opacity-80" />

                    {/* Linha de Scan Animada */}
                    {prevCarregando && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.5)] animate-[scan_2s_ease-in-out_infinite]"
                        style={{ top: '50%' }}
                      />
                    )}

                    {/* Instrução Central */}
                    {!prevTipo && !captura && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full border border-white/10 text-white/90 font-medium">
                          Posicione seu rosto no centro
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Coluna de Controles e Status */}
              <div className="md:col-span-2 bg-gray-50 p-6 flex flex-col justify-between border-l border-gray-200">
                <div className="space-y-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <ScanFace className="w-6 h-6 text-purple-600" />
                      Validação Biométrica
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                      O sistema irá comparar sua foto atual com o banco de dados para validar sua identidade.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Status do Sistema</span>
                        {modelsReady ? (
                          <span className="text-green-600 flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Online
                          </span>
                        ) : (
                          <span className="text-yellow-600 flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                            Carregando IA...
                          </span>
                        )}
                      </div>
                      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${modelsReady ? 'w-full bg-green-500' : 'w-1/3 bg-yellow-500'}`}
                        />
                      </div>
                    </div>

                    {prevTipo && (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="p-4 rounded-xl bg-green-50 border border-green-100 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-full">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-green-900">Identidade Confirmada</p>
                              <p className="text-sm text-green-700">Confiança: {(prevConf * 100).toFixed(0)}%</p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-green-200">
                            <p className="text-sm text-gray-600">
                              Ação sugerida: <span className="font-bold text-gray-900">{getTipoLabel(mapPredictToTipo(prevTipo))}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {!prevTipo ? (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={iniciarCamera}
                        disabled={prevCarregando}
                        variant="outline"
                        className="h-12 border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Ligar Câmera
                      </Button>
                      <Button
                        onClick={verificarFacial}
                        disabled={prevCarregando || !modelsReady}
                        className="h-12 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
                      >
                        {prevCarregando ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            Verificando...
                          </>
                        ) : (
                          <>
                            <ScanFace className="mr-2 h-4 w-4" />
                            Verificar
                          </>
                        )}
                      </Button>
                      {cameraStatus && (
                        <div className="col-span-2">
                          <Badge variant="outline">{cameraStatus}</Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <Button
                        onClick={() => {
                          if (!prevTipo) return;
                          registrarPonto(mapPredictToTipo(prevTipo));
                          setModalFaceOpen(false);
                          setPrevTipo(null);
                          setCaptura('');
                        }}
                        className="h-14 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold shadow-lg shadow-green-900/20 w-full"
                      >
                        Confirmar {getTipoLabel(mapPredictToTipo(prevTipo))}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setPrevTipo(null);
                          setCaptura('');
                          iniciarCamera();
                        }}
                        className="text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      >
                        Tentar Novamente
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {modoRegistro === 'biometria' && (
        <Card className="overflow-hidden border-l-4 border-l-cyan-500 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-cyan-100 rounded-2xl border border-cyan-100">
                  <Fingerprint className="w-10 h-10 text-cyan-600" />
                </div>
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="text-2xl font-bold tracking-tight text-gray-900">
                    Biometria Digital
                  </h3>
                  <p className="text-gray-600 max-w-md text-lg">
                    Utilize o leitor de impressão digital para registrar seu ponto com segurança.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setModalFaceOpen(true)}
                size="lg"
                className="bg-cyan-600 text-white hover:bg-cyan-700 hover:scale-105 transition-all duration-300 font-semibold shadow-lg h-14 px-8 text-lg rounded-xl group"
              >
                <Fingerprint className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Iniciar Leitura
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {modoRegistro === 'biometria' && (
        <Dialog open={modalFaceOpen} onOpenChange={setModalFaceOpen}>
          <DialogContent className="sm:max-w-md bg-white text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Fingerprint className="w-6 h-6 text-cyan-600" />
                Validação Biométrica
              </DialogTitle>
              <DialogDescription className="text-gray-500">
                Posicione seu dedo no leitor biométrico para confirmar sua identidade.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className={`relative p-6 rounded-full transition-all duration-500 ${prevCarregando ? 'bg-cyan-50 scale-110' : 'bg-gray-50'}`}>
                <Fingerprint
                  className={`w-24 h-24 transition-colors duration-500 ${prevCarregando ? 'text-cyan-600 animate-pulse' :
                    prevTipo ? 'text-green-500' : 'text-gray-300'
                    }`}
                />
                {prevCarregando && (
                  <div className="absolute inset-0 border-4 border-cyan-200 rounded-full animate-ping opacity-20" />
                )}
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-gray-900">
                  {prevCarregando ? 'Lendo digital...' :
                    prevTipo ? 'Identidade Confirmada!' :
                      'Aguardando leitura...'}
                </h3>
                <p className="text-sm text-gray-500">
                  {prevCarregando ? 'Mantenha o dedo posicionado' :
                    prevTipo ? 'Digital reconhecida com sucesso' :
                      'Utilize o leitor conectado ao dispositivo'}
                </p>
              </div>

              {prevTipo && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-4 rounded-xl bg-green-50 border border-green-100 space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">Leitura Realizada</p>
                        <p className="text-sm text-green-700">Confiança: 99%</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-green-200">
                      <p className="text-sm text-gray-600">
                        Ação sugerida: <span className="font-bold text-gray-900">{getTipoLabel(mapPredictToTipo(prevTipo))}</span>
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (!prevTipo) return;
                      registrarPonto(mapPredictToTipo(prevTipo));
                      setModalFaceOpen(false);
                      setPrevTipo(null);
                    }}
                    className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-900/20"
                  >
                    Confirmar {getTipoLabel(mapPredictToTipo(prevTipo))}
                  </Button>
                </div>
              )}

              {!prevTipo && (
                <Button
                  onClick={async () => {
                    setPrevCarregando(true);
                    // Simulação de leitura biométrica (2 segundos)
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    const now = new Date();
                    const sugTipo = determinarProximoTipo();
                    setPrevTipo(mapTipoToPredict(sugTipo));
                    setPrevHorario(now.toTimeString().slice(0, 8));
                    setPrevConf(0.99);
                    setPrevCarregando(false);
                  }}
                  disabled={prevCarregando}
                  className={`w-full h-12 font-semibold shadow-lg transition-all ${prevCarregando ? 'bg-cyan-100 text-cyan-700' : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-900/20'
                    }`}
                >
                  {prevCarregando ? 'Processando...' : 'Simular Leitura Digital'}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Histórico de Registros do Dia */}
      <Card className="card-govto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Registros de Hoje
          </CardTitle>
          <CardDescription>
            Histórico de batidas do ponto registradas hoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registrosHoje.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum registro de ponto hoje</p>
              <p className="text-sm">Clique em "Registrar Entrada" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {registrosHoje.map((registro, index) => (
                <div key={registro.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getTipoCor(registro.tipo)} text-white`}>
                      {getTipoLabel(registro.tipo)}
                    </Badge>
                    <div>
                      <p className="font-semibold">{registro.horario}</p>
                      {registro.localizacao && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {registro.localizacao}
                        </p>
                      )}
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas e Informações */}
      {registrosHoje.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Próximo registro:</strong> {getTipoLabel(proximoTipo)}
            {proximoTipo === 'saida' && ' - Não esqueça de registrar sua saída ao final do expediente'}
            {proximoTipo === 'intervalo_inicio' && ' - Lembre-se de registrar o início do seu intervalo'}
          </AlertDescription>
        </Alert>
      )}

      {/* Modal de Confirmação */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
        showConfirmButton={false}
      />
    </div>
  );
};

export default RegistroPonto;