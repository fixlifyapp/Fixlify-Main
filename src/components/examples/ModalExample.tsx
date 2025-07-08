
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ModalType } from '@/types/modal';

const ModalExample: React.FC = () => {
  const [modalType, setModalType] = useState<ModalType | null>(null);

  const openModal = (type: ModalType) => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  return (
    <div className="space-y-4">
      <Button onClick={() => openModal('clientSelection')}>
        Open Client Selection
      </Button>
      <Button onClick={() => openModal('deleteConfirm')}>
        Open Delete Confirmation
      </Button>
      <Button onClick={() => openModal('taskManagement')}>
        Open Task Management
      </Button>
      
      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2>Modal: {modalType}</h2>
            <Button onClick={closeModal}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalExample;
