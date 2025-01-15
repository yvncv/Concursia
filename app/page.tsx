import Image from 'next/image'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-red-700">MarineraNorteña.com</Link>
          <nav>
            <ul className="flex space-x-4">
              <li><Link href="#eventos" className="text-gray-600 hover:text-red-700">Eventos</Link></li>
              <li><Link href="#galeria" className="text-gray-600 hover:text-red-700">Galería</Link></li>
              <li><Link href="#acerca" className="text-gray-600 hover:text-red-700">Acerca de</Link></li>
              <li><Link href="#contacto" className="text-gray-600 hover:text-red-700">Contacto</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-[70vh] flex items-center justify-center">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Pareja bailando marinera norteña"
            layout="fill"
            objectFit="cover"
            className="absolute inset-0"
          />
          <div className="relative z-10 text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Vive la Pasión de la Marinera Norteña</h1>
            <p className="text-xl mb-8">Descubre los mejores eventos y competencias en Perú</p>
            <button className="bg-red-700 hover:bg-red-800 text-white">Ver Próximos Eventos</button>
          </div>
        </section>

        {/* Eventos Section */}
        <section id="eventos" className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Próximos Eventos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((event) => (
                <div key={event} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Image
                    src={`/placeholder.svg?height=200&width=400&text=Evento ${event}`}
                    alt={`Evento ${event}`}
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">Concurso Nacional de Marinera</h3>
                    <p className="text-gray-600 mb-4">15 de Julio, 2023 - Trujillo, Perú</p>
                    <button className="w-full bg-red-700 hover:bg-red-800 text-white">Más Información</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Galería Section */}
        <section id="galeria" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Galería de Imágenes</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((img) => (
                <Image
                  key={img}
                  src={`/placeholder.svg?height=300&width=300&text=Imagen ${img}`}
                  alt={`Imagen de marinera ${img}`}
                  width={300}
                  height={300}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Acerca de Section */}
        <section id="acerca" className="py-16 bg-red-700 text-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Acerca de la Marinera Norteña</h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="mb-4">
                La marinera norteña es una danza tradicional peruana que representa el cortejo entre un hombre y una mujer. 
                Se caracteriza por sus movimientos elegantes y el uso del pañuelo como elemento principal.
              </p>
              <p>
                Originaria de la costa norte del Perú, la marinera norteña es considerada Patrimonio Cultural de la Nación 
                y es ampliamente celebrada en festivales y concursos a lo largo del país.
              </p>
            </div>
          </div>
        </section>

        {/* Contacto Section */}
        <section id="contacto" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Contáctanos</h2>
            <form className="max-w-md mx-auto">
              <div className="mb-4">
                <input type="text" placeholder="Nombre" className="w-full" />
              </div>
              <div className="mb-4">
                <input type="email" placeholder="Correo electrónico" className="w-full" />
              </div>
              <div className="mb-4">
                <textarea placeholder="Mensaje" className="w-full" />
              </div>
              <button type="submit" className="w-full bg-red-700 hover:bg-red-800 text-white">Enviar Mensaje</button>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-2">MarineraNorteña.com</h3>
              <p>Celebrando la cultura y tradición de la marinera norteña.</p>
            </div>
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Enlaces Rápidos</h3>
              <ul>
                <li><Link href="#eventos" className="hover:text-red-500">Eventos</Link></li>
                <li><Link href="#galeria" className="hover:text-red-500">Galería</Link></li>
                <li><Link href="#acerca" className="hover:text-red-500">Acerca de</Link></li>
                <li><Link href="#contacto" className="hover:text-red-500">Contacto</Link></li>
              </ul>
            </div>
            <div className="w-full md:w-1/3">
              <h3 className="text-xl font-bold mb-2">Síguenos</h3>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-red-500">Facebook</a>
                <a href="#" className="hover:text-red-500">Instagram</a>
                <a href="#" className="hover:text-red-500">YouTube</a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p>&copy; 2023 MarineraNorteña.com. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

