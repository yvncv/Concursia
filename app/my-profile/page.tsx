"use client"
import useUser from '../firebase/functions';
import useAcademia from '../hooks/useAcademia';
import { useRouter } from 'next/navigation';
import { auth } from '../firebase/config';

const ProfilePage = () => {
  const { user, loadingUser } = useUser();
  const { academia, loadingAcademia } = useAcademia();
  const router = useRouter();

  if (loadingUser) {
    return <div className="text-center text-gray-600">Cargando perfil...</div>;
  }

  if (!user) {
    return <div className="text-center text-gray-600">No se ha encontrado el usuario.</div>;
  }

  // Asegúrate de convertir el Timestamp a una fecha legible
  // Función para capitalizar la primera letra de una cadena
  function capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <div className="flex items-center mb-8">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
            {user.firstName[0]}
          </div>
          <div className="ml-6">
            <h1 className="text-3xl font-semibold text-gray-800">{user.fullName}</h1>
            <p className="text-lg text-gray-600">{user.roleId}</p>
            <p className="text-gray-500">{user.email[0]}</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Información Personal</h2>
            <p className="text-gray-600">Género: {user.gender}</p>
            <p className="text-gray-600">Fecha de Nacimiento: {capitalizeFirstLetter(user.birthDate.toDate().toLocaleDateString("es-PE", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }))}</p>
            <p className="text-gray-600">DNI: {user.dni}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Información de Contacto</h2>
            <p className="text-gray-600">Teléfono: {user.phoneNumber[0]}</p>
            <p className="text-gray-600">Correo electrónico: {user.email[0]}</p>
            {user.academyId && (
              loadingAcademia ? (
                <p className="text-gray-600">Obteniendo academia...</p>
              ) : (
                <p className="text-gray-600">Academia: {academia?.nombre}</p>
              )
            )}
          </div>
        </div>

        <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Fecha de Registro</h2>
          <p className="text-gray-600">{capitalizeFirstLetter(user.birthDate.toDate().toLocaleDateString("es-PE", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }))}</p>
        </div>

        <div className="mt-8 flex justify-between items-center space-x-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition duration-300">
            Editar Perfil
          </button>
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-500 transition duration-300"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
