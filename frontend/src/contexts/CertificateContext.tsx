import { createContext, useContext, useState, ReactNode } from 'react';

export type CertificateType = 'caste' | 'income' | 'domicile' | 'marriage' | 'birth';
export type CertificateStatus = 
  | 'submitted' 
  | 'pending_officer' 
  | 'approved_officer' 
  | 'pending_senior' 
  | 'approved_senior' 
  | 'pending_higher' 
  | 'approved_higher' 
  | 'rejected';

export interface Certificate {
  id: string;
  applicantId: string;
  applicantName: string;
  type: CertificateType;
  status: CertificateStatus;
  submittedDate: string;
  documents: { name: string; url: string; type: string }[];
  rejectionReason?: string;
  approvalHistory: {
    level: string;
    officer: string;
    action: 'approved' | 'rejected';
    timestamp: string;
    remarks?: string;
  }[];
}

interface CertificateContextType {
  certificates: Certificate[];
  addCertificate: (certificate: Omit<Certificate, 'id'>) => void;
  updateCertificateStatus: (id: string, status: CertificateStatus, officerName: string, remarks?: string) => void;
  getCertificatesByUserId: (userId: string) => Certificate[];
  getCertificatesByStatus: (status: CertificateStatus) => Certificate[];
}

const CertificateContext = createContext<CertificateContextType | undefined>(undefined);

// Mock initial certificates
const mockCertificates: Certificate[] = [
  {
    id: 'CERT001',
    applicantId: '1',
    applicantName: 'Rajesh Kumar',
    type: 'caste',
    status: 'pending_officer',
    submittedDate: '2025-10-28',
    documents: [
      { name: 'aadhaar.pdf', url: '#', type: 'pdf' },
      { name: 'school_certificate.pdf', url: '#', type: 'pdf' }
    ],
    approvalHistory: []
  }
];

export const CertificateProvider = ({ children }: { children: ReactNode }) => {
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);

  const addCertificate = (certificate: Omit<Certificate, 'id'>) => {
    const newCertificate: Certificate = {
      ...certificate,
      id: `CERT${String(certificates.length + 1).padStart(3, '0')}`,
    };
    setCertificates([...certificates, newCertificate]);
  };

  const updateCertificateStatus = (
    id: string, 
    status: CertificateStatus, 
    officerName: string,
    remarks?: string
  ) => {
    setCertificates(certs =>
      certs.map(cert => {
        if (cert.id === id) {
          const action = status.includes('rejected') ? 'rejected' : 'approved';
          const level = status.includes('officer') ? 'Officer' : status.includes('senior') ? 'Senior Officer' : 'Higher Official';
          
          return {
            ...cert,
            status,
            rejectionReason: action === 'rejected' ? remarks : cert.rejectionReason,
            approvalHistory: [
              ...cert.approvalHistory,
              {
                level,
                officer: officerName,
                action,
                timestamp: new Date().toISOString(),
                remarks
              }
            ]
          };
        }
        return cert;
      })
    );
  };

  const getCertificatesByUserId = (userId: string) => {
    return certificates.filter(cert => cert.applicantId === userId);
  };

  const getCertificatesByStatus = (status: CertificateStatus) => {
    return certificates.filter(cert => cert.status === status);
  };

  return (
    <CertificateContext.Provider value={{
      certificates,
      addCertificate,
      updateCertificateStatus,
      getCertificatesByUserId,
      getCertificatesByStatus
    }}>
      {children}
    </CertificateContext.Provider>
  );
};

export const useCertificates = () => {
  const context = useContext(CertificateContext);
  if (context === undefined) {
    throw new Error('useCertificates must be used within a CertificateProvider');
  }
  return context;
};
