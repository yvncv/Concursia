export interface Academy {
    id: string;
    idOrganizador: string;
    nombre: string;
    contacto: {
        correo: string;
        telefono: string;
    }
    lugar: {
      calle: string;
      coordenadas: string;
      departamento: string;
      distrito: string;
      provincia: string;
    };
  }