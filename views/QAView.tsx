
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Feedback, User } from '../types';

interface QAViewProps {
  feedbacks: Feedback[];
  user: User;
}

const QAView: React.FC<QAViewProps> = ({ feedbacks, user }) => (
  <div className="p-6">
    <div className="bg-white rounded-2xl shadow-sm border p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <HelpCircle className="text-amber-500"/> Hỏi đáp & Hỗ trợ kỹ thuật
      </h2>
      <div className="space-y-4">
        {feedbacks.filter(f => f.username === user.username || user.role === 'ADMIN').map(f => (
          <div key={f.id} className="p-4 bg-gray-50 rounded-xl border">
            <div className="flex justify-between items-start">
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">{f.category}</span>
              <span className="text-[10px] text-gray-400">{new Date(f.timestamp).toLocaleString()}</span>
            </div>
            <p className="mt-2 text-sm font-medium">{f.content}</p>
            {f.reply && (
              <div className="mt-3 p-3 bg-white rounded-lg border-l-4 border-military-500 text-sm italic text-gray-600">
                <b>Phản hồi:</b> {f.reply}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default QAView;
