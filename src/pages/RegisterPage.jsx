import RegisterForm from "../components/RegisterForm";
import Logo from "../assets/Logo.png";

const RegisterPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 transition-colors duration-500">
            <div className="w-full max-w-2xl text-center bg-white/50 dark:bg-white/5 backdrop-blur-xl p-12 rounded-[3rem] border border-white/20 shadow-2xl">
                <img src={Logo} alt="Logo de Auditoria" className="mx-auto h-28 mb-8 hover:scale-105 transition-transform duration-500" />

                <h1 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white mb-10 tracking-tighter">
                    Crea tu <span className="text-[#1a9888] dark:text-teal-400">Cuenta</span>
                </h1>
                <RegisterForm />
            </div>
        </div>
    );
};

export default RegisterPage;
