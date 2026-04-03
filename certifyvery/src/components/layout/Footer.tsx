import { Mail, Github, Linkedin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t glass-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading font-bold text-lg mb-2">{t('nav_certifygov')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('footer_tagline')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{t('footer_quick_links')}</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">{t('footer_privacy')}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t('footer_terms')}</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">{t('footer_help')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">{t('footer_contact')}</h4>
            <div className="space-y-2">
              <a href="mailto:support@certifygov.in" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                support@certifygov.in
              </a>
              <div className="flex gap-3 mt-3">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Github className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>{t('footer_copyright')}</p>
        </div>
      </div>
    </footer>
  );
};
