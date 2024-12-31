'use client';

import useUser from '../firebase/functions'; // Asegúrate de que la ruta sea la correcta
import { auth } from '../firebase/config';
import { useRouter } from 'next/navigation';
import useAcademia from '../hooks/useAcademia';

const ProfilePage = () => {
  const { user, loadingUser } = useUser();
  const router = useRouter();
  const { academia, loadingAcademia } = useAcademia();

  if (loadingUser) {
    return <div className="text-center text-gray-600">Cargando perfil...</div>;
  }

  if (!user) {
    return <div className="text-center text-gray-600">No se ha encontrado el usuario.</div>;
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
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
            {user.name[0]}
          </div>
          <div className="ml-6">
            <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-lg text-gray-600">{user.role}</p>
            <p className="text-gray-500">{user.contacto.correo}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Información de Contacto</h2>
            <p className="text-gray-600">Teléfono: {user.contacto.telefono}</p>
            <p className="text-gray-600">Correo electrónico: {user.email}</p>
            {user.idAcademia && (
              loadingAcademia ? (<p className="text-gray-600">Obteniendo acadeima...</p>) : (<p className="text-gray-600">Academia: {academia?.nombre}</p>)
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Eventos</h2>
            <div className="space-y-2">
              <p className="text-gray-600">Eventos en los que has participado:</p>
              <ul className="list-disc pl-5">
                {user.eventos.participados.length > 0 ? (
                  user.eventos.participados.map((eventId, index) => (
                    <li key={index} className="text-gray-600">
                      {eventId}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600">No has participado en eventos todavía.</li>
                )}
              </ul>

              <p className="text-gray-600 mt-4">Eventos que has presenciado:</p>
              <ul className="list-disc pl-5">
                {user.eventos.espectados.length > 0 ? (
                  user.eventos.espectados.map((eventId, index) => (
                    <li key={index} className="text-gray-600">
                      {eventId}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600">No has presenciado eventos todavía.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Fecha de Registro</h2>
            <p className="text-gray-600">{user.createdAt.toDate().toString()}</p>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition">
            Editar Perfil
          </button>
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;
