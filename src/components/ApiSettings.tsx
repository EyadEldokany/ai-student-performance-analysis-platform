import { useApp, t } from '../contexts/AppContext';
import { X, Shield, Server, Lock } from 'lucide-react';

export default function ApiSettings({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { state } = useApp();
  const { language } = state;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t('secureAiConfig', language)}</h2>
              <p className="text-xs text-slate-500">NVIDIA NIM</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/20">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{t('apiManagedSecurely', language)}</p>
              <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">
                {language === 'ar'
                  ? 'لا يمكن تعديل المفتاح من الواجهة، ولا يتم تخزينه في المتصفح أو إرساله من العميل.'
                  : 'The key cannot be edited from the UI and is not stored in the browser or sent by the client.'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800/50 dark:bg-indigo-900/20">
            <Server className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <div className="text-sm text-indigo-700 dark:text-indigo-300">
              <p className="font-semibold">{language === 'ar' ? 'آلية العمل' : 'How it works'}</p>
              <ul className="mt-2 list-disc space-y-1 ps-5 text-xs">
                <li>
                  {language === 'ar'
                    ? 'الواجهة ترسل طلب التوليد إلى الخادم المحلي فقط.'
                    : 'The frontend sends generation requests only to the local server.'}
                </li>
                <li>
                  {language === 'ar'
                    ? 'الخادم المحلي يستخدم مفتاح NVIDIA المخزن على النظام.'
                    : 'The local server uses the NVIDIA key stored on the system.'}
                </li>
                <li>
                  {language === 'ar'
                    ? 'يتم تجنب مشاكل CORS لأن المتصفح لا يتصل بـ NVIDIA مباشرة.'
                    : 'CORS issues are avoided because the browser never calls NVIDIA directly.'}
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
            {language === 'ar'
              ? 'تأكد فقط من تشغيل الخادم المحلي على المنفذ 3001 مع الواجهة الأمامية.'
              : 'Just make sure the local server on port 3001 is running alongside the frontend.'}
          </div>
        </div>
      </div>
    </div>
  );
}
