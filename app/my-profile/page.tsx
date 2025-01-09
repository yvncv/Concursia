"use client"
import { useState, useEffect } from 'react';
import useUser from '../firebase/functions';
import useAcademia from '../hooks/useAcademia';
import { useRouter } from 'next/navigation';
import { auth, db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

const ProfilePage = () => {
  const { user, loadingUser } = useUser();
  const { academia, loadingAcademia } = useAcademia();
  const router = useRouter();

  const [contactInfo, setContactInfo] = useState({
    emailSecondary: '',
    phonePrimary: '',
    phoneSecondary: '',
    academyId: ''
  });

  useEffect(() => {
    if (user) {
      setContactInfo({
        emailSecondary: user.email[1] || '',
        phonePrimary: user.phoneNumber[0] || '',
        phoneSecondary: user.phoneNumber[1] || '',
        academyId: user.academyId || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid) return;

    try {
      const userRef = doc(db, "users", user.uid);
      
      // Preparar los datos para actualizar
      const updateData = {
        email: [user.email[0], contactInfo.emailSecondary],
        phoneNumber: [contactInfo.phonePrimary, contactInfo.phoneSecondary],
        academyId: contactInfo.academyId
      };

      await updateDoc(userRef, updateData);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      alert('Error al actualizar el perfil');
    }
  };


  if (loadingUser) {
    return <div className="text-center text-gray-600">Cargando perfil...</div>;
  }

  if (!user) {
    return <div className="text-center text-gray-600">No se ha encontrado el usuario.</div>;
  }


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
      <form onSubmit={handleUpdateProfile}>
        <div className="w-full mx-auto bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center mb-8">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
              {user.firstName[0]}
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-semibold text-gray-800">{user.fullName}</h1>
              <p className="text-lg text-gray-600">
                {user.roleId === "user"
                  ? "Usuario"
                  : user.roleId === "organizer"
                    ? "Organizador"
                    : "Rol Desconocido"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Información Personal</h2>
              <div className="mt-4 mb-4">
                <label htmlFor="dni" className="block text-sm font-medium text-gray-700">DNI</label>
                <input
                  type="text"
                  value={user.dni}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                  readOnly
                />
              </div>
              <div className="flex gap-x-2">
                <div className="w-full">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={user.firstName}
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                    readOnly
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellido(s)</label>
                  <input
                    type="text"
                    value={user.lastName}
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                    readOnly
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={user.birthDate.toDate().toISOString().split('T')[0]}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                  readOnly
                />
              </div>
              <div className="mt-4">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Género</label>
                <input
                  type="text"
                  value={user.gender}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                  readOnly
                />
              </div>
              <div className="mt-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
                <input
                  type="text"
                  value={user.category}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                  readOnly
                />
              </div>
            </div>
            {/* jola */}


            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Información de Contacto</h2>
              <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Principal</label>
                <input
                  type="email"
                  id="emailPrimary"
                  value={user?.email[0] || ''}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                  readOnly
                />
              </div>
              <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Secundario</label>
                <input
                  type="email"
                  id="emailSecondary"
                  value={contactInfo.emailSecondary}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                />
              </div>
              <div className="mt-4">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Telefono Principal</label>
                <input
                  type="tel"
                  id="phonePrimary"
                  value={contactInfo.phonePrimary}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                  required
                />
              </div>
              <div className="mt-4">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Telefono Secundario</label>
                <input
                  type="tel"
                  id="phoneSecondary"
                  value={contactInfo.phoneSecondary}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                />
              </div>
              <div className="mt-4">
                <label htmlFor="academyId" className="block text-sm font-medium text-gray-700">Academia</label>
                <input
                  type="text"
                  id="academyId"
                  value={contactInfo.academyId}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                />
              </div>
              {/* {user.academyId && (
                loadingAcademia ? (
                  <p className="text-gray-600">Obteniendo academia...</p>
                ) : (
                  <p className="text-gray-600">Academia: {academia?.name}</p>
                )
              )} */}
            </div>
          </div>

          <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Fecha de Registro</h2>
            <p className="text-gray-600">{capitalizeFirstLetter(user.createdAt.toDate().toLocaleDateString("es-PE", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            }))}</p>
          </div>



          <div className="mt-8 flex justify-end items-center space-x-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-500 transition duration-300"
            >
              Guardar Cambios
            </button>
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-500 transition duration-300"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </form>
    </main>
  );
};

export default ProfilePage;
