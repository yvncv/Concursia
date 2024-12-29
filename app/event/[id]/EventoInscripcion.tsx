const EventoInscripcion = () => {
    return (
            <form className="mt-6 w-3/4 mx-auto">
                <div className="mb-4">
                    <label className="block font-medium">Nombre</label>
                    <input className="w-full px-4 py-2 border rounded-lg" placeholder="Ingrese nombre" />
                </div>
                <div className="mb-4">
                    <label className="block font-medium">Correo electrónico</label>
                    <input className="w-full px-4 py-2 border rounded-lg" placeholder="tu@correo.com" />
                </div>
                <button className="w-full block mb-0 mt-4 text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all">Inscribirse</button>
            </form>
    );
};

export default EventoInscripcion;
