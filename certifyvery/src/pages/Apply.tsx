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
import { Upload, FileText, CheckCircle, AlertCircle, UserCircle2, UploadCloud } from 'lucide-react';
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
      label: t('Birth certificate'),
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
      label: t('Death certificate'),
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
      label: t('Income certificate'),
      fields: [
        { name: "fullName", label: t('apply_field_full_name'), type: "text" },
        { name: "annualIncome", label: t('apply_field_annual_income'), type: "number" },
        { name: "address", label: t('apply_field_address'), type: "text" },
      ],
      documents: [t('apply_doc_income_decl'), t('apply_doc_aadhaar')]
    },
    {
      value: "community" as CertificateType,
      label: t('Community certificate'),
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
      label: t('Marriage certificate'),
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

  const STEPS = [
    { id: 1, title: t('apply_step_type') || 'Select Type', icon: FileText },
    { id: 2, title: t('apply_step_details') || 'Personal Details', icon: UserCircle2 },
    { id: 3, title: t('apply_step_docs') || 'Documents', icon: UploadCloud },
    { id: 4, title: t('apply_step_review') || 'Review & Submit', icon: CheckCircle }
  ];

  const [step, setStep] = useState(1);

  const canProceedToStep2 = !!selectedType;
  const canProceedToStep3 = canProceedToStep2 && selectedCertificate?.fields.every(f => !!formDetails[f.name]);
  const canProceedToStep4 = canProceedToStep3 && selectedCertificate?.documents.every(doc => !!uploads[doc]);

  const handleNext = () => {
    if (step === 1 && !canProceedToStep2) return toast.error('Please select a certificate type');
    if (step === 2 && !canProceedToStep3) return toast.error('Please fill all required details');
    if (step === 3 && !canProceedToStep4) return toast.error('Please upload all required documents');
    setStep(s => Math.min(4, s + 1));
  };
  
  const handleBack = () => setStep(s => Math.max(1, s - 1));

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
      toast.success(`${file.name} uploaded`);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canProceedToStep4) return;

    try {
      const form = new FormData();
      form.append("certificateType", selectedType);

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
      if (response.status !== 200 && response.status !== 201) {
        toast.error(t('apply_submit_failed'));
        return;
      }
      toast.success(t('apply_upload_success'));
      navigate('/my-certificates');
    } catch (error) {
      console.error('Error uploading documents:', error);
      toast.error(t('apply_upload_error'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="font-heading text-4xl font-bold mb-3">{t('apply_title')}</h1>
            <p className="text-muted-foreground">{t('apply_desc')}</p>
          </div>

          {/* Stepper Progress */}
          <div className="relative mb-12 mt-8">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-primary"
                 initial={{ width: '0%' }}
                 animate={{ width: `${((step - 1) / 3) * 100}%` }}
                 transition={{ duration: 0.3 }}
               />
            </div>
            <div className="relative flex justify-between z-10 w-full px-2 sm:px-6">
              {STEPS.map((s) => (
                <div key={s.id} className="flex flex-col items-center">
                  <motion.div
                    animate={{
                      backgroundColor: step >= s.id ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                      color: step >= s.id ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                      scale: step === s.id ? 1.1 : 1
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-background transition-colors duration-300 shadow-sm"
                  >
                    <s.icon className="w-4 h-4" />
                  </motion.div>
                  <span className={`text-xs md:text-sm font-medium mt-2 whitespace-nowrap absolute -bottom-6 ${
                    step >= s.id ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Card className="glass-card shadow-lg border-primary/10 overflow-hidden relative min-h-[400px] flex flex-col">
            <div className="p-6 md:p-8 flex-1">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-primary/5 rounded-lg p-5 border border-primary/20 flex flex-col items-center text-center">
                       <FileText className="h-10 w-10 text-primary mb-3" />
                       <h3 className="text-xl font-semibold mb-2">Select Certificate Category</h3>
                       <p className="text-sm text-muted-foreground">Choose the specific type of certificate you wish to apply for.</p>
                    </div>

                    <div className="space-y-4 max-w-lg mx-auto">
                      <Label className="text-base text-center block mb-4">{t('apply_cert_type')}</Label>
                      <Select value={selectedType} onValueChange={(value) => {
                        setSelectedType(value as CertificateType);
                        setUploads({});
                        setFormDetails({});
                      }}>
                        <SelectTrigger className="h-14 text-lg">
                          <SelectValue placeholder={t('apply_select_cert')} />
                        </SelectTrigger>
                        <SelectContent>
                          {certificateTypes.map((cert) => (
                            <SelectItem key={cert.value} value={cert.value} className="py-3 cursor-pointer">
                              {cert.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}

                {step === 2 && selectedCertificate && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold flex items-center border-b pb-3">
                      <UserCircle2 className="h-5 w-5 mr-3 text-primary" /> 
                      Applicant Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {selectedCertificate.fields.map((field) => (
                        <div key={field.name} className="space-y-2">
                          <Label className="font-semibold text-muted-foreground">{field.label} <span className="text-destructive">*</span></Label>
                          {field.type === 'select' ? (
                            <Select
                              value={formDetails[field.name] || ''}
                              onValueChange={(val) => setFormDetails(prev => ({ ...prev, [field.name]: val }))}
                            >
                              <SelectTrigger className="w-full h-12 bg-background/50 hover:bg-background transition-colors">
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
                              className="w-full h-12 border rounded-md px-4 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 bg-background/50 hover:bg-background transition-colors"
                              value={formDetails[field.name] || ''}
                              onChange={(e) => setFormDetails(prev => ({ ...prev, [field.name]: e.target.value }))}
                              required
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && selectedCertificate && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                     <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <AlertCircle className="h-5 w-5" />
                        {t('apply_required_docs')}
                      </h3>
                      <p className="text-sm text-muted-foreground ml-7 mb-2">You must provide standard digital copies of the following documents to process this specific certificate:</p>
                      <ul className="text-sm font-medium ml-7 space-y-1">
                        {selectedCertificate.documents.map((doc) => (
                          <li key={doc} className="flex items-center gap-2 before:content-[''] before:w-1.5 before:h-1.5 before:bg-amber-500 before:rounded-full">{doc}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      {selectedCertificate.documents.map((docName) => (
                        <div key={docName} className="space-y-2">
                          <Label className="font-semibold text-sm">{docName} <span className="text-destructive">*</span></Label>
                          <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors h-36 flex flex-col items-center justify-center relative ${uploads[docName] ? 'border-emerald-500 bg-emerald-500/5' : 'hover:border-primary/50 bg-muted/20'}`}>
                            <input
                              type="file"
                              id={docName}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleFileUpload(docName, e.target.files?.[0] || null)}
                            />
                            {uploads[docName] ? (
                              <div className="flex flex-col items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="h-8 w-8" />
                                <span className="font-medium text-xs max-w-full truncate px-2">{uploads[docName]?.name}</span>
                              </div>
                            ) : (
                              <div className="space-y-2 pointer-events-none">
                                <UploadCloud className="h-8 w-8 mx-auto text-muted-foreground/50" />
                                <p className="text-xs font-semibold text-primary">Click to browse file</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">PDF, JPG, PNG</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 4 && selectedCertificate && (
                  <motion.div 
                    key="step4"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                       <CheckCircle className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
                       <h2 className="text-2xl font-bold">Review Your Application</h2>
                       <p className="text-muted-foreground">Please ensure all details are correct before submitting for official verification.</p>
                    </div>

                    <div className="bg-muted/30 rounded-xl p-6 border grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4 border-b pb-2">Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Certificate Type</span>
                            <span className="font-medium">{selectedCertificate.label}</span>
                          </div>
                          {Object.entries(formDetails).map(([key, val]) => {
                             const fieldDef = selectedCertificate.fields.find(f => f.name === key);
                             return (
                               <div key={key} className="flex justify-between flex-wrap gap-2 text-sm border-t border-border/50 pt-2">
                                 <span className="text-muted-foreground">{fieldDef?.label || key}</span>
                                 <span className="font-medium">{val}</span>
                               </div>
                             )
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4 border-b pb-2">Attached Documents</h4>
                        <div className="space-y-2">
                           {selectedCertificate.documents.map(doc => (
                              <div key={doc} className="flex items-center gap-3 text-sm bg-background p-2 rounded border">
                                <FileText className="h-4 w-4 text-emerald-500" />
                                <span className="flex-1 truncate">{doc}</span>
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                              </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-6 border-t bg-muted/10 flex justify-between items-center mt-auto">
               <Button 
                 variant="outline" 
                 size="lg"
                 onClick={handleBack}
                 disabled={step === 1}
                 className="w-32"
               >
                 Back
               </Button>
               
               {step < 4 ? (
                 <Button 
                   size="lg" 
                   onClick={handleNext}
                   className="w-32"
                   disabled={(step === 1 && !canProceedToStep2) || (step === 2 && !canProceedToStep3) || (step === 3 && !canProceedToStep4)}
                 >
                   Next Step
                 </Button>
               ) : (
                 <Button 
                   size="lg" 
                   onClick={() => handleSubmit()}
                   className="w-40 bg-emerald-600 hover:bg-emerald-700 text-white"
                   disabled={!canProceedToStep4}
                 >
                   <CheckCircle className="mr-2 h-5 w-5" />
                   {t('apply_submit')}
                 </Button>
               )}
            </div>
          </Card>
        </motion.div>
      </main>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}
