import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { SCENARIO_LABELS, type ConversationTurn, type Scenario } from '../api/types';

type RecordingState = 'idle' | 'recording' | 'processing';

export function ConversationPage() {
  const { scenario } = useParams<{ scenario: Scenario }>();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<ConversationTurn[]>([]);
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!scenario) return;
    startTimeRef.current = Date.now();
    api
      .post('/conversation/start', { scenario })
      .then((res) => {
        setSessionId(res.data.sessionId);
        setTranscript([{ role: 'assistant', text: res.data.openerText, timestamp: new Date().toISOString() }]);
        playBase64Audio(res.data.openerAudioBase64);
      })
      .catch(() => setError('Could not start the conversation. Check that OPENAI_API_KEY is configured on the backend.'));
  }, [scenario]);

  function playBase64Audio(base64: string) {
    const audio = new Audio(`data:audio/mp3;base64,${base64}`);
    audio.play().catch(() => {});
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = handleRecordingStop;
      recorder.start();
      mediaRecorderRef.current = recorder;
      setState('recording');
    } catch {
      setError('Microphone access is required to speak with Carlos.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
  }

  async function handleRecordingStop() {
    if (!sessionId) return;
    setState('processing');
    try {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', blob, 'speech.webm');
      formData.append('sessionId', sessionId);

      const transcribeRes = await api.post('/conversation/transcribe', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const userText = transcribeRes.data.text as string;
      if (!userText.trim()) {
        setState('idle');
        return;
      }
      setTranscript((t) => [...t, { role: 'user', text: userText, timestamp: new Date().toISOString() }]);

      const respondRes = await api.post('/conversation/respond', { sessionId, userText });
      setTranscript((t) => [
        ...t,
        { role: 'assistant', text: respondRes.data.text, timestamp: new Date().toISOString() },
      ]);
      playBase64Audio(respondRes.data.audioBase64);
    } catch {
      setError('Something went wrong processing your speech. Try again.');
    } finally {
      setState('idle');
    }
  }

  async function endConversation() {
    if (!sessionId) return;
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const res = await api.post('/conversation/end', { sessionId, durationSeconds });
    navigate(`/conversation-report/${sessionId}`, { state: { report: { ...res.data, durationSeconds } } });
  }

  if (!scenario) return null;

  return (
    <div className="min-h-screen bg-amber-50 px-4 py-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-amber-800">
            {SCENARIO_LABELS[scenario].emoji} {SCENARIO_LABELS[scenario].label}
          </h1>
          <button onClick={endConversation} className="text-sm text-red-600 underline">
            End conversation
          </button>
        </header>

        {error && <p className="text-red-600 mb-3">{error}</p>}

        <div className="flex-1 bg-white rounded-2xl shadow p-4 overflow-y-auto space-y-3 mb-4 min-h-[300px]">
          {transcript.map((turn, idx) => (
            <div
              key={idx}
              className={`max-w-[80%] rounded-xl px-3 py-2 ${
                turn.role === 'assistant'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-blue-100 text-blue-900 ml-auto'
              }`}
            >
              <div className="text-xs font-semibold opacity-60 mb-1">
                {turn.role === 'assistant' ? 'Carlos' : 'You'}
              </div>
              {turn.text}
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={state === 'recording' ? stopRecording : startRecording}
            disabled={state === 'processing' || !sessionId}
            className={`w-20 h-20 rounded-full text-white text-2xl font-bold shadow-lg disabled:opacity-50 ${
              state === 'recording' ? 'bg-red-600' : 'bg-amber-600'
            }`}
          >
            {state === 'processing' ? '…' : state === 'recording' ? '■' : '🎤'}
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-2">
          {state === 'recording' ? 'Recording… tap to stop' : state === 'processing' ? 'Thinking…' : 'Tap to speak'}
        </p>
      </div>
    </div>
  );
}
