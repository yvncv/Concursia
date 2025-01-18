"use client"
import { useState, useEffect, use } from 'react';
import useUsers from '@/app/hooks/useUsers';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import useUser from '@/app/firebase/functions';

const ProfilePage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { users, loadingUsers } = useUsers();
    const { user } = useUser(); // Obtenemos el usuario logueado
    const router = useRouter();
    const { id } = use(params);

    const foundUser = users.find((user) => user.id === id);

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

    if (loadingUsers) {
        return <div className="text-center text-gray-600">Cargando perfil...</div>;
    }

    if (!foundUser) {
        return <div className="text-center text-gray-600">No se ha encontrado el usuario.</div>;
    }

    function capitalizeFirstLetter(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            router.push("/calendario");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    
    // Comprobar si el usuario logueado es el mismo que el encontrado
    const canEdit = foundUser?.id === user?.id;

    return (
        <main className="min-h-screen">
            <form onSubmit={handleUpdateProfile}>
                <div className="w-4/5 mx-auto my-4 bg-white/80 rounded-lg shadow-xl p-8">
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 items-center mb-8">
                        <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                            {foundUser.firstName[0]}
                        </div>
                        <div className="ml-6">
                            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">{foundUser.fullName}</h1>
                            <strong className="text-lg text-rojo">{capitalizeFirstLetter(foundUser.roleId)}</strong> {foundUser.academyId && (<span> from <strong className="text-lg text-rojo">{foundUser.academyName}</strong></span>)}
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
                        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Información Personal</h2>
                            <div className="mt-4 mb-4">
                                <label htmlFor="dni" className="block text-sm font-medium text-gray-700">DNI</label>
                                <input
                                    type="text"
                                    value={foundUser.dni}
                                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                                    readOnly
                                />
                            </div>
                            <div className="flex gap-x-2">
                                <div className="w-full">
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <input
                                        type="text"
                                        value={foundUser.firstName}
                                        className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                                        readOnly
                                    />
                                </div>
                                <div className="w-full">
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellido(s)</label>
                                    <input
                                        type="text"
                                        value={foundUser.lastName}
                                        className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    value={foundUser.birthDate.toDate().toISOString().split('T')[0]}
                                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                                    readOnly
                                />
                            </div>
                            <div className="mt-4">
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Género</label>
                                <input
                                    type="text"
                                    value={foundUser.gender}
                                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                                    readOnly
                                />
                            </div>
                            <div className="mt-4">
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
                                <input
                                    type="text"
                                    value={foundUser.category}
                                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Información de Contacto</h2>
                            <div className="mt-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Principal</label>
                                <input
                                    type="email"
                                    id="emailPrimary"
                                    value={foundUser?.email[0]}
                                    onChange={handleInputChange}
                                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                                    readOnly
                                />
                            </div>
                            <div className="mt-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Secundario</label>
                                <input
                                    type="email"
                                    id="emailSecondary"
                                    value={contactInfo.emailSecondary || ""}
                                    onChange={handleInputChange}
                                    className={`w-full mt-1 px-4 py-4 rounded-2xl placeholder:text-gray-500 focus:ring-0 focus:shadow-[0_0_10px var(--rosado-claro)] transition-all outline-none ${canEdit ? "bg-white" : "bg-gray-200"}`}
                                    readOnly={!canEdit}
                                />
                            </div>
                            <div className="mt-4">
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Telefono Principal</label>
                                <input
                                    type="tel"
                                    id="phonePrimary"
                                    value={contactInfo.phonePrimary || ""}
                                    onChange={handleInputChange}
                                    className={`w-full mt-1 px-4 py-4 rounded-2xl placeholder:text-gray-500 focus:ring-0 focus:shadow-[0_0_10px var(--rosado-claro)] transition-all outline-none ${canEdit ? "bg-white" : "bg-gray-200"}`}
                                    required
                                    readOnly={!canEdit}
                                />
                            </div>
                            <div className="mt-4">
                                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Telefono Secundario</label>
                                <input
                                    type="tel"
                                    id="phoneSecondary"
                                    value={contactInfo.phoneSecondary || ""}
                                    onChange={handleInputChange}
                                    className={`w-full mt-1 px-4 py-4 rounded-2xl placeholder:text-gray-500 focus:ring-0 focus:shadow-[0_0_10px var(--rosado-claro)] transition-all outline-none ${canEdit ? "bg-white" : "bg-gray-200"}`}
                                    readOnly={!canEdit}
                                />
                            </div>
                        </div>

                    </div>

                    <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Fecha de Registro</h2>
                        <p className="text-gray-600">{capitalizeFirstLetter(foundUser.createdAt.toDate().toLocaleDateString("es-PE", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }))}</p>
                    </div>

                    {canEdit && (
                        <>
                            <div className="mt-8 w-full flex flex-col md:flex-row items-center space-y-4 md:space-x-4 md:space-y-0 justify-around">
                                <button
                                    type="submit"
                                    className="bg-green-600 w-full text-white px-6 py-3 rounded-lg hover:bg-green-500 transition duration-300"
                                >
                                    Guardar Cambios
                                </button>
                            </div>
                            <div className="mt-8 w-full flex flex-col md:flex-row items-center space-y-4 md:space-x-4 md:space-y-0 justify-around">
                                <button
                                    onClick={handleSignOut}
                                    className="bg-red-600 w-full text-white px-6 py-3 rounded-lg hover:bg-red-500 transition duration-300"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </form>
        </main>
    );
};

export default ProfilePage;
