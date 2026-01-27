import LoginForm from "../components/LoginForm";
import Logo from "../assets/Logo.png";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 transition-colors duration-500">
      <div className="">

        {/* <h1 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white mb-10 tracking-tighter">
          Bienvenido de <span className="text-[#1a9888] dark:text-teal-400">Nuevo</span>
        </h1> */}
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
