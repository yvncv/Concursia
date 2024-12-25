"use client"
import useUser from '../firebase/functions';

const Dashboard = () => {
  const { user, loading } = useUser(); // Obtén el usuario desde el hook

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!user || !user.role) {
    return <p>No tienes un rol definido. Contacta con un administrador.</p>;
  }

  // Renderizado condicional según el rol del usuario
  if (user.role === 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8  text-center">
        <h1 className=" mb-4">Bienvenido, Administrador</h1>
        <p className="">Contenido exclusivo para administradores.</p>
      </div>
    );
  }

  if (user.role === 'user') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8  text-center">
        <h1 className=" mb-4">Bienvenido, Usuario {user.email}</h1>
        <p className="">Contenido exclusivo para usuarios regulares.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8  text-center">
      <h1 className=" mb-4">Bienvenido</h1>
      <p className="">No tienes un rol definido. Contacta con un administrador.</p>
    </div>
  );
};

export default Dashboard;
