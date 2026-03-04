import { useNavigate } from 'react-router-dom';
import { Shield, Users, Stethoscope, ArrowRight } from 'lucide-react';

export default function UserTypeSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-200/30 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-6xl px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm mb-4 ring-1 ring-slate-100">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Welcome to Kavach
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your trusted companion for managing vaccinations and health records. <br className="hidden md:block" />
            Select your role to get started.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Parent Card */}
          <div
            onClick={() => navigate('/login?role=parent')}
            className="group relative bg-white rounded-3xl p-8 shadow-sm border border-slate-100 cursor-pointer min-h-[280px] flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-blue-200 active:scale-[0.98]"
          >
            <div className="absolute top-6 right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRight className="h-6 w-6 text-blue-600" />
            </div>

            <div className="space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-300">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">Parent / Guardian</h3>
                <p className="text-slate-500 leading-relaxed">
                  Track your child's development, manage vaccination schedules, and receive timely health reminders.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700">
              <span>Continue as Parent</span>
            </div>
          </div>

          {/* Provider Card */}
          <div
            onClick={() => navigate('/login?role=provider')}
            className="group relative bg-white rounded-3xl p-8 shadow-sm border border-slate-100 cursor-pointer min-h-[280px] flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-teal-200 active:scale-[0.98]"
          >
            <div className="absolute top-6 right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRight className="h-6 w-6 text-teal-600" />
            </div>

            <div className="space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors duration-300">
                <Stethoscope className="h-8 w-8 text-teal-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">Healthcare Provider</h3>
                <p className="text-slate-500 leading-relaxed">
                  Access patient records, update vaccination statuses, and coordinate care with families efficiently.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center text-sm font-semibold text-teal-600 group-hover:text-teal-700">
              <span>Continue as Provider</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center animate-fade-in delay-200">
          <p className="text-slate-500">
            New to Kavach?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-semibold text-primary hover:text-primary/80 hover:underline transition-all"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
