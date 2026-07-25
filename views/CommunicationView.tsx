
import React from 'react';
import { User } from '../types';
import { useCommunication } from './CommunicationView/hooks/useCommunication';
import CommHeader from './CommunicationView/components/CommHeader';
import CommTabs from './CommunicationView/components/CommTabs';
import ReportTable from './CommunicationView/components/ReportTable';
import DispatchTable from './CommunicationView/components/DispatchTable';
import ReportModal from './CommunicationView/components/ReportModal';
import DispatchModal from './CommunicationView/components/DispatchModal';

interface CommunicationViewProps {
  user: User;
  sessionYear: number;
}

const CommunicationView: React.FC<CommunicationViewProps> = ({ user, sessionYear }) => {
  const comm = useCommunication(user, sessionYear);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      
      <CommHeader 
        user={user} 
        sessionYear={sessionYear}
        isLoading={comm.isLoading}
        onRefresh={comm.fetchData}
        onOpenReportModal={() => comm.setShowReportModal(true)}
        onOpenDispatchModal={() => comm.setShowDispatchModal(true)}
      />

      <CommTabs 
        user={user} 
        activeTab={comm.activeTab} 
        onTabChange={comm.setActiveTab} 
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        {comm.activeTab === 'REPORTS' ? (
          <ReportTable 
            user={user}
            reports={comm.reports}
            isLoading={comm.isLoading}
            filterCommune={comm.filterCommune}
            onFilterChange={comm.setFilterCommune}
            onDelete={comm.handleDeleteReport}
          />
        ) : (
          <DispatchTable 
            user={user}
            dispatches={comm.dispatches}
            isLoading={comm.isLoading}
            onDelete={comm.handleDeleteDispatch}
          />
        )}
      </div>

      {comm.showReportModal && (
        <ReportModal 
          user={user}
          sessionYear={sessionYear}
          isProcessing={comm.isProcessingFile}
          setIsProcessing={comm.setIsProcessingFile}
          onClose={() => comm.setShowReportModal(false)}
          onSuccess={comm.fetchData}
        />
      )}

      {comm.showDispatchModal && (
        <DispatchModal 
          user={user}
          sessionYear={sessionYear}
          isProcessing={comm.isProcessingFile}
          setIsProcessing={comm.setIsProcessingFile}
          onClose={() => comm.setShowDispatchModal(false)}
          onSuccess={comm.fetchData}
        />
      )}
    </div>
  );
};

export default CommunicationView;
