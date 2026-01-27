import LoginForm from "../components/LoginForm";
import Logo from "../assets/Logo.png";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 transition-colors duration-500">
      <div className="w-full max-w-lg text-center bg-white/50 dark:bg-white/5 backdrop-blur-xl p-12 rounded-[3rem] border border-white/20 shadow-2xl">
        <img src={Logo} alt="Logo de Auditoria" className="mx-auto h-28 mb-8 hover:scale-105 transition-transform duration-500" />

        <h1 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white mb-10 tracking-tighter">
          Bienvenido de <span className="text-[#1a9888] dark:text-teal-400">Nuevo</span>
        </h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
