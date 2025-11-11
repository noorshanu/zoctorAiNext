
import { useTranslation } from 'react-i18next';

function BelowSec() {
  const { t, i18n } = useTranslation();
  const isRTL = ['ar', 'ur'].includes(i18n.language);

  return (
    <section className="relative" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="css-we"></div>

      <div className="my-6 max-w-full sm:max-w-6xl mx-auto">
        <p className="text-center font-manbold text-white text-xl sm:text-4xl py-2">
          <span className="txt-grad font-bold">{t('belowSec.partnerships')}</span>{' '}
          {t('belowSec.hospitalText')}
        </p>
        <p className="text-center font-manbold text-white text-xl sm:text-4xl py-1">
          <span className="txt-grad font-bold">ZoctorAI</span>{' '}
          {t('belowSec.connectText')}
        </p>
      </div>

      <p className="text-center text-base sm:text-4xl font-sfpro text-[#fff] py-1">
        {t('belowSec.experience')}
      </p>
    </section>
  );
}

export default BelowSec;
