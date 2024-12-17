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
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-center">
        <h1 className="text-4xl text-foreground mb-4">Perfil de {user.name}</h1>
        <p className="text-lg text-foreground">Acá se mostrarán los datos del usuario.</p>
      </div>
    )
  )
}

export default Profile;
