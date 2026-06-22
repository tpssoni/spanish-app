import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { ConversationReport } from '../api/types';

export function ConversationReportPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState<ConversationReport | null>(
    (location.state as { report?: ConversationReport })?.report ?? null
  );

  useEffect(() => {
    if (report || !sessionId) return;
    api.get('/conversation/history').then((res) => {
      const match = res.data.find((s: { id: string }) => s.id === sessionId);
      if (match) setReport({ ...match.report_json, durationSeconds: match.duration_seconds });
    });
  }, [report, sessionId]);

  if (!report) return <div className="p-8 text-center text-amber-700">Loading report…</div>;

  return (
    <div className="min-h-screen bg-amber-50 px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-amber-800 text-center">Conversation Report</h1>

        <div className="grid grid-cols-2 gap-4">
          <ScoreCard label="Accuracy" value={report.accuracyScore} />
          <ScoreCard label="Fluency" value={report.fluencyScore} />
        </div>

        {report.durationSeconds !== undefined && (
          <p className="text-center text-gray-500 text-sm">
            Duration: {Math.round(report.durationSeconds / 60)} min
          </p>
        )}

        {report.newVocabularyAttempted.length > 0 && (
          <Section title="Vocabulary you used">
            <div className="flex flex-wrap gap-2">
              {report.newVocabularyAttempted.map((word) => (
                <span key={word} className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm">
                  {word}
                </span>
              ))}
            </div>
          </Section>
        )}

        {report.errors.length > 0 && (
          <Section title="Corrections">
            <div className="space-y-3">
              {report.errors.map((err, idx) => (
                <div key={idx} className="border-l-4 border-red-400 pl-3">
                  <div className="text-red-600 line-through">{err.original}</div>
                  <div className="text-green-700 font-medium">{err.corrected}</div>
                  <div className="text-sm text-gray-500">{err.explanationEn}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {report.suggestedPhrases.length > 0 && (
          <Section title="Phrases to learn next">
            <ul className="list-disc list-inside space-y-1">
              {report.suggestedPhrases.map((phrase) => (
                <li key={phrase} className="text-amber-800">
                  {phrase}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg py-2 font-semibold"
        >
          Back to dashboard
        </button>
      </div>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 text-center">
      <div className="text-3xl font-bold text-amber-700">{Math.round(value)}%</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="font-semibold text-amber-800 mb-2">{title}</h2>
      {children}
    </div>
  );
}
