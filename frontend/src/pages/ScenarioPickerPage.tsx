import { useNavigate } from 'react-router-dom';
import { SCENARIO_LABELS, type Scenario } from '../api/types';

export function ScenarioPickerPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-amber-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-800 mb-6 text-center">
          Choose a conversation scenario
        </h1>
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(SCENARIO_LABELS) as Scenario[]).map((scenario) => {
            const info = SCENARIO_LABELS[scenario];
            return (
              <button
                key={scenario}
                onClick={() => navigate(`/conversation/${scenario}`)}
                className="bg-white rounded-xl shadow p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-2">{info.emoji}</div>
                <div className="font-semibold text-amber-800">{info.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
