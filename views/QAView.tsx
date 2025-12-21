
import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, MessageSquare, CheckCircle2, Clock, Trash2, Reply } from 'lucide-react';
import { Feedback, User } from '../types';
import { api } from '../api';

interface QAViewProps {
  feedbacks: Feedback[];
  user: User;
}

const QAView: React.FC<QAViewProps> = ({ feedbacks: initialFeedbacks, user }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Feedback['category']>('HỎI ĐÁP');
  const [isSending, setIsSending] = useState(false);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  useEffect(() => {
    setFeedbacks(initialFeedbacks);
  }, [initialFeedbacks]);

  const isAdmin = user.role === 'ADMIN';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSending(true);
    const newFeedback = {
      username: user.username,
      unitName: user.fullName,
      category,
      content: content.trim(),
      isRead: false,
      timestamp: Date.now()
    };

    const res = await api.createFeedback(newFeedback);
    if (res) {
      setFeedbacks([res, ...feedbacks]);
      setContent('');
      alert("Yêu cầu của bạn đã được gửi tới Quản trị viên!");
    }
    setIsSending(false);
  };

  const handleReply = async (id: string) => {
    const text = replyText[id];
    if (!text?.trim()) return;

    const res = await api.updateFeedback(id, {
      reply: text.trim(),
      replyTimestamp: Date.now(),
      isRead: true
    });

    if (res) {
      setFeedbacks(feedbacks.map(f => (f.id === id || (f as any)._id === id) ? { ...f, ...res } : f));
      setReplyText({ ...replyText, [id]: '' });
      setActiveReplyId(null);
      alert("Đã gửi phản hồi thành công!");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Xóa vĩnh viễn yêu cầu này?")) {
      const success = await api.deleteFeedback(id);
      if (success) {
        setFeedbacks(feedbacks.filter(f => (f.id !== id && (f as any)._id !== id)));
      }
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => isAdmin || f.username === user.username);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h2 className="text-2xl font-black text-military-900 flex items-center gap-3 uppercase tracking-tight">
            <HelpCircle className="text-amber-500 w-8 h-8" /> Hỏi đáp & Hỗ trợ kỹ thuật
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Hệ thống tương trợ trực tiếp giữa đơn vị cơ sở và Quản trị viên</p>
        </div>
        <div className="bg-military-50 px-4 py-2 rounded-xl border border-military-100 flex items-center gap-2">
          <Clock size={16} className="text-military-600" />
          <span className="text-[10px] font-black text-military-700 uppercase">Thời gian phản hồi TB: 30 phút</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form (Hidden for Admin) */}
        {!isAdmin && (
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-8 space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <MessageSquare size={14} /> Gửi yêu cầu mới
              </h3>
              
              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Chủ đề cần hỗ trợ</label>
                <select 
                  className="w-full border-gray-200 border rounded-xl p-2.5 text-sm font-bold bg-gray-50 focus:ring-2 focus:ring-military-50"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  <option value="HỎI ĐÁP">HỎI ĐÁP NGHIỆP VỤ</option>
                  <option value="MẬT KHẨU">CẤP LẠI MẬT KHẨU</option>
                  <option value="GÓP Ý">GÓP Ý NÂNG CẤP</option>
                  <option value="KHÁC">CÁC VẤN ĐỀ KHÁC</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase mb-1">Nội dung chi tiết</label>
                <textarea 
                  required
                  className="w-full border-gray-200 border rounded-xl p-4 text-sm focus:ring-2 focus:ring-military-50 outline-none font-medium min-h-[150px]"
                  placeholder="Mô tả cụ thể vấn đề đơn vị đang gặp phải..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={isSending}
                className="w-full bg-military-700 text-white py-3 rounded-xl font-black uppercase text-xs shadow-lg hover:bg-military-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSending ? 'Đang gửi...' : <><Send size={16}/> Gửi yêu cầu ngay</>}
              </button>
            </form>
          </div>
        )}

        {/* Right Column: Feedback List */}
        <div className={isAdmin ? "lg:col-span-3 space-y-6" : "lg:col-span-2 space-y-6"}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
              {isAdmin ? "Tất cả yêu cầu từ các đơn vị" : "Lịch sử yêu cầu của đơn vị"}
            </h3>
            <span className="text-[10px] font-black text-military-600 bg-military-50 px-2 py-0.5 rounded">{filteredFeedbacks.length} kết quả</span>
          </div>

          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed">
              <HelpCircle size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold text-sm">Chưa có yêu cầu hỗ trợ nào được ghi nhận.</p>
            </div>
          ) : (
            filteredFeedbacks.map((f) => {
              const fId = (f as any)._id || f.id;
              return (
                <div key={fId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                          f.category === 'MẬT KHẨU' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {f.category}
                        </span>
                        {f.reply ? (
                          <span className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase">
                            <CheckCircle2 size={10}/> Đã phản hồi
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase animate-pulse">
                            <Clock size={10}/> Đang chờ xử lý
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-bold">
                        {new Date(f.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="mb-3 p-2 bg-military-50 rounded-lg">
                        <p className="text-[10px] font-black text-military-800 uppercase tracking-tighter">Từ đơn vị: {f.unitName} ({f.username})</p>
                      </div>
                    )}

                    <p className="text-sm font-bold text-gray-800 leading-relaxed">{f.content}</p>

                    {f.reply && (
                      <div className="mt-4 p-4 bg-military-900 rounded-xl relative">
                        <div className="absolute top-0 left-6 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-military-900 -translate-y-full"></div>
                        <div className="flex items-start gap-3">
                          <div className="bg-white/10 p-1.5 rounded-lg text-amber-400"><Reply size={14}/></div>
                          <div>
                            <p className="text-[10px] font-black text-military-300 uppercase mb-1 flex items-center gap-2">
                              Quản trị viên phản hồi 
                              <span className="opacity-50 text-[9px] font-normal">({new Date(f.replyTimestamp || 0).toLocaleString('vi-VN')})</span>
                            </p>
                            <p className="text-sm text-white font-medium italic">"{f.reply}"</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Admin Reply Input */}
                    {isAdmin && !f.reply && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        {activeReplyId === fId ? (
                          <div className="space-y-2 animate-in slide-in-from-top-2">
                            <textarea 
                              className="w-full border p-3 rounded-xl text-sm font-medium focus:ring-2 focus:ring-military-500"
                              placeholder="Nhập nội dung phản hồi cho đơn vị..."
                              value={replyText[fId] || ''}
                              onChange={(e) => setReplyText({ ...replyText, [fId]: e.target.value })}
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setActiveReplyId(null)} className="px-4 py-1.5 text-[10px] font-black text-gray-500 uppercase">Hủy</button>
                              <button 
                                onClick={() => handleReply(fId)}
                                className="px-6 py-1.5 bg-military-700 text-white rounded-lg text-[10px] font-black uppercase shadow-lg"
                              >
                                Xác nhận phản hồi
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <button 
                              onClick={() => setActiveReplyId(fId)}
                              className="flex items-center gap-2 text-[10px] font-black text-military-600 hover:text-military-800 uppercase"
                            >
                              <Reply size={14}/> Trả lời đơn vị
                            </button>
                            <button 
                              onClick={() => handleDelete(fId)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {!isAdmin && !f.reply && (
                      <div className="mt-4 pt-4 border-t flex justify-end">
                        <button onClick={() => handleDelete(fId)} className="text-gray-300 hover:text-red-500 transition-colors">
                           <Trash2 size={16}/>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default QAView;
