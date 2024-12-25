"use client"
import useUser from '../firebase/functions';

const Profile = () => {
  const { user, loading } = useUser();
  return (
    loading ? (
      <div>Cargando...</div>
    ) : !user || !user.role ? (
      <div>No tienes un rol definido. Contacta con un administrador.</div>
    ) : (
      <div className="flex flex-col items-center justify-center min-h-screen p-8  text-center">
        <h1 className="  mb-4">Perfil de {user.name}</h1>
        <p className=" ">Acá se mostrarán los datos del usuario.</p>
      </div>
    )
  )
}

export default Profile;
