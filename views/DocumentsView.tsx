import React from 'react';
import { FileText } from 'lucide-react';
import { ResearchDocument } from '../types';

interface DocumentsViewProps {
  documents: ResearchDocument[];
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ documents }) => (
  <div className="p-6">
    <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
      <FileText size={48} className="mx-auto text-gray-300 mb-4" />
      <h2 className="text-xl font-bold text-gray-800">Thư viện tài liệu</h2>
      <p className="text-gray-500 mt-2">Dữ liệu văn bản luật, nghị định, thông tư về nghĩa vụ quân sự.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {documents.map(doc => (
          <div key={doc.id} className="p-4 border rounded-xl hover:bg-gray-50 text-left">
            <p className="font-bold text-military-800">{doc.title}</p>
            <p className="text-xs text-gray-500 mt-1">{doc.category} - {doc.uploadDate}</p>
            <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs font-bold mt-2 inline-block">Xem chi tiết</a>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default DocumentsView;