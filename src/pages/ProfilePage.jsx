import { UserRound } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { ROLES } from '../constants/roles';

function ProfilePage({ roleKey, logout }) {
  const { language } = useAppState();
  const isAr = language !== 'en';
  const role = ROLES[roleKey];

  const roleLabel = (isAr ? role?.labelAr : role?.labelEn) ?? roleKey;

  return (
    <section className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-headline text-2xl font-bold text-[var(--text-primary)]">
          {isAr ? 'الملف الشخصي' : 'Profile'}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          {isAr ? 'بيانات الموظف ودوره الحالي' : 'Staff details and current role'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <article className="glass-panel rounded-3xl p-6 transition-all duration-300 hover:shadow-lg">
          <div className="mb-6 flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: `${role?.color}15`, color: role?.color }}
            >
              <UserRound size={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-muted)]">
                {isAr ? 'الموظف الحالي' : 'Current Staff'}
              </p>
              <h2 className="font-headline text-xl font-bold text-[var(--text-primary)]">
                {roleLabel}
              </h2>
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-[var(--surface-low)] p-4">
              <p className="text-xs font-bold text-[var(--text-muted)]">
                {isAr ? 'الوردية' : 'Shift'}
              </p>
              <p className="mt-1 font-semibold text-[var(--text-primary)]">
                {isAr ? 'مسائية' : 'Evening'}
              </p>
            </div>
            <div className="rounded-xl bg-[var(--surface-low)] p-4">
              <p className="text-xs font-bold text-[var(--text-muted)]">
                {isAr ? 'الحالة' : 'Status'}
              </p>
              <p className="mt-1 font-semibold text-emerald-600">
                {isAr ? 'متصل ومتاح' : 'Online & Ready'}
              </p>
            </div>
          </div>
        </article>

        {/* Account Actions Card */}
        <article className="glass-panel rounded-3xl p-6 flex flex-col transition-all duration-300 hover:shadow-lg">
          <h3 className="font-headline text-lg font-bold text-[var(--text-primary)] mb-4">
            {isAr ? 'إجراءات الحساب' : 'Account Actions'}
          </h3>
          
          <div className="flex-1 space-y-4">
            <p className="text-sm text-[var(--text-muted)]">
              {isAr 
                ? 'يمكنك تسجيل الخروج لتبديل الدور أو إنهاء الوردية الخاصة بك.' 
                : 'You can logout to switch roles or end your current shift.'}
            </p>
          </div>

          <div className="pt-6 border-t border-[var(--surface-high)] mt-auto">
            <button
              type="button"
              onClick={logout}
              className="w-full cursor-pointer rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 hover:scale-[1.01] active:scale-95"
            >
              {isAr ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}

export default ProfilePage;
