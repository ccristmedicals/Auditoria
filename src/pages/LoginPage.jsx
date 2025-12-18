import LoginForm from "../components/LoginForm";
import Logo from "../assets/Logo.png";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#191919] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg text-center">
        <img src={Logo} alt="Logo de CristMedical" className="mx-auto h-24" />

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          Iniciar Sesión
        </h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
