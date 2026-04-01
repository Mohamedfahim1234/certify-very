import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CertificateType } from '@/contexts/CertificateContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Apply() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<CertificateType | ''>('');
  const [uploads, setUploads] = useState<{ [key: string]: File | null }>({});
  const [formDetails, setFormDetails] = useState<{ [key: string]: string }>({});
  const { t } = useLanguage();

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const certificateTypes = [
    {
      value: "birth" as CertificateType,
      label: t('cert_birth'),
      fields: [
        { name: "childName", label: t('apply_field_child_name'), type: "text" },
        { name: "dateOfBirth", label: t('apply_field_dob'), type: "date" },
        { name: "placeOfBirth", label: t('apply_field_pob'), type: "text" },
        { name: "sex", label: t('apply_field_sex'), type: "select", options: [t('sex_male'), t('sex_female'), t('sex_other')] },
        { name: "fatherName", label: t('apply_field_father_name'), type: "text" },
        { name: "motherName", label: t('apply_field_mother_name'), type: "text" },
      ],
      documents: [t('apply_doc_birth_slip'), t('apply_doc_aadhaar')]
    },
    {
      value: "death" as CertificateType,
      label: t('cert_death'),
      fields: [
        { name: "name", label: t('apply_field_name'), type: "text" },
        { name: "dateOfDeath", label: t('apply_field_dod'), type: "date" },
        { name: "causeOfDeath", label: t('apply_field_cod'), type: "text" },
        { name: "address", label: t('apply_field_address'), type: "text" },
      ],
      documents: [t('apply_doc_aadhaar'), t('apply_doc_medical_report')]
    },
    {
      value: "income" as CertificateType,
      label: t('cert_income'),
      fields: [
        { name: "fullName", label: t('apply_field_full_name'), type: "text" },
        { name: "annualIncome", label: t('apply_field_annual_income'), type: "number" },
        { name: "address", label: t('apply_field_address'), type: "text" },
      ],
      documents: [t('apply_doc_income_decl'), t('apply_doc_aadhaar')]
    },
    {
      value: "community" as CertificateType,
      label: t('cert_community'),
      fields: [
        { name: "fullName", label: t('apply_field_full_name'), type: "text" },
        { name: "community", label: t('apply_field_community'), type: "text" },
        { name: "parentName", label: t('apply_field_parent_name'), type: "text" },
        { name: "address", label: t('apply_field_address'), type: "text" },
      ],
      documents: [t('apply_doc_school_cert'), t('apply_doc_aadhaar')]
    },
    {
      value: "marriage" as CertificateType,
      label: t('cert_marriage'),
      fields: [
        { name: "groomName", label: t('apply_field_groom_name'), type: "text" },
        { name: "brideName", label: t('apply_field_bride_name'), type: "text" },
        { name: "dateOfMarriage", label: t('apply_field_dom'), type: "date" },
        { name: "placeOfMarriage", label: t('apply_field_pom'), type: "text" },
      ],
      documents: [t('apply_doc_aadhaar_both'), t('apply_doc_wedding_photo'), t('apply_doc_witness_id')]
    }
  ];

  const selectedCertificate = certificateTypes.find(c => c.value === selectedType);

  const handleFileUpload = (docName: string, file: File | null) => {
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 10 * 1024 * 1024;

      if (!validTypes.includes(file.type)) {
        toast.error(t('apply_file_invalid'));
        return;
      }

      if (file.size > maxSize) {
        toast.error(t('apply_file_too_large'));
        return;
      }

      setUploads(prev => ({ ...prev, [docName]: file }));
      toast.success(`${file.name} ${t('apply_uploaded')}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting application for:', selectedType, uploads);
    if (!selectedType) return;

    const requiredDocs = selectedCertificate?.documents || [];
    const missingDocs = requiredDocs.filter(doc => !uploads[doc]);

    if (missingDocs.length > 0) {
      toast.error(`${t('apply_missing_docs')} ${missingDocs.join(', ')}`);
      return;
    }

    try {

      const form = new FormData();
      form.append("certificateType", selectedType);

      // Append dynamic text fields exactly as the PDF generator expects them as a JSON string
      if (Object.keys(formDetails).length > 0) {
        form.append("details", JSON.stringify(formDetails));
      }

      Object.keys(uploads).forEach((key) => {
        const file = uploads[key];
        if (file) {
          form.append('documentUrl', file as File);
        }
      });

      const response = await axios.post(`${API_URL}/user/apply-certificate`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      if (response.status !== 200) {
        toast.error(t('apply_submit_failed'));
        return;
      }
      toast.success(t('apply_upload_success'));
      navigate('/my-certificates');
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error(t('apply_upload_error'));
      return;
    }

  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <div>
            <h1 className="font-heading text-3xl font-bold mb-2">{t('apply_title')}</h1>
            <p className="text-muted-foreground">
              {t('apply_desc')}
            </p>
          </div>

          <Card className="glass-card p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Certificate Type Selection */}
              <div className="space-y-2">
                <Label>{t('apply_cert_type')}</Label>
                <Select value={selectedType} onValueChange={(value) => {
                  setSelectedType(value as CertificateType);
                  setUploads({});
                  setFormDetails({});
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('apply_select_cert')} />
                  </SelectTrigger>
                  <SelectContent>
                    {certificateTypes.map((cert) => (
                      <SelectItem key={cert.value} value={cert.value}>
                        {cert.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic Form Fields */}
              <AnimatePresence>
                {selectedCertificate && selectedCertificate.fields && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {selectedCertificate.fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label>{field.label}</Label>
                        {field.type === 'select' ? (
                          <Select 
                            value={formDetails[field.name] || ''} 
                            onValueChange={(val) => setFormDetails(prev => ({ ...prev, [field.name]: val }))}
                          >
                            <SelectTrigger className="w-full h-10 border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background text-foreground">
                              <SelectValue placeholder={`Select ${field.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options?.map(opt => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <input
                            type={field.type}
                            className="w-full h-10 border rounded-md px-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 bg-background text-foreground"
                            value={formDetails[field.name] || ''}
                            onChange={(e) => setFormDetails(prev => ({ ...prev, [field.name]: e.target.value }))}
                            required
                          />
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Document Upload Section */}
              <AnimatePresence>
                {selectedCertificate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-primary" />
                        {t('apply_required_docs')}
                      </h3>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {selectedCertificate.documents.map((doc) => (
                          <li key={doc}>• {doc}</li>
                        ))}
                      </ul>
                    </div>

                    {selectedCertificate.documents.map((docName) => (
                      <div key={docName} className="space-y-2">
                        <Label>{docName}</Label>
                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                          <input
                            type="file"
                            id={docName}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(docName, e.target.files?.[0] || null)}
                          />
                          <label htmlFor={docName} className="cursor-pointer">
                            {uploads[docName] ? (
                              <div className="flex items-center justify-center gap-2 text-accent">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">{uploads[docName]?.name}</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  {t('apply_upload_hint')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t('apply_file_types')}
                                </p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!selectedType || Object.keys(uploads).length === 0}
              >
                <FileText className="h-5 w-5 mr-2" />
                {t('apply_submit')}
              </Button>
            </form>
          </Card>
        </motion.div>
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
