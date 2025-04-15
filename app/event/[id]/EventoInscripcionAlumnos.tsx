"use client"
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { CheckCircle, AlertCircle, Upload, FileText, XCircle, Download, RefreshCw } from "lucide-react";

const EventoInscripcionAlumnos = ({ event, user }) => {
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [step, setStep] = useState("upload"); // upload, review, validate, success
  const [validationResults, setValidationResults] = useState({
    validUsers: [],
    invalidUsers: [],
    userDetails: {}
  });
  const [isCheckingFirebase, setIsCheckingFirebase] = useState(false);

  // Estructura esperada del Excel
  const expectedColumns = [
    "DNI Participante",
    "Academia Participante",
    "Modalidad Participante",
    "DNI Pareja",
    "Academia Pareja"
  ];

  // Validar la estructura del archivo y los datos
  const validateExcelData = (data) => {
    const errors = [];

    // Verificar columnas
    const headers = Object.keys(data[0] || {});
    const missingColumns = expectedColumns.filter(col => {
      const normalizedCol = col.toLowerCase().replace(/\s+/g, "");
      return !headers.some(header =>
        header.toLowerCase().replace(/\s+/g, "") === normalizedCol
      );
    });

    if (missingColumns.length > 0) {
      errors.push(`Faltan columnas requeridas: ${missingColumns.join(", ")}`);
    }

    // Validar datos por fila
    data.forEach((row, index) => {
      // Validar DNI (debe tener 8 dígitos)
      if (!row["DNI Participante"] || !/^\d{8}$/.test(row["DNI Participante"].toString())) {
        errors.push(`Fila ${index + 1}: DNI inválido. Debe tener 8 dígitos.`);
      }

      // Validar que tenga academia
      if (!row["Academia Participante"]) {
        errors.push(`Fila ${index + 1}: Falta academia del participante.`);
      }

      // Validar modalidad
      if (!row["Modalidad Participante"]) {
        errors.push(`Fila ${index + 1}: Falta modalidad del participante.`);
      }

      // Si hay DNI de pareja, debe haber academia de pareja
      if (row["DNI Pareja"] && !row["Academia Pareja"]) {
        errors.push(`Fila ${index + 1}: Tiene DNI de pareja pero falta academia de la pareja.`);
      }

      // Si hay academia de pareja, debe haber DNI de pareja
      if (!row["DNI Pareja"] && row["Academia Pareja"]) {
        errors.push(`Fila ${index + 1}: Tiene academia de pareja pero falta DNI de la pareja.`);
      }

      // Si hay DNI de pareja, validar formato
      if (row["DNI Pareja"] && !/^\d{6,8}$/.test(row["DNI Pareja"].toString())) {
        errors.push(`Fila ${index + 1}: DNI de pareja inválido. Debe tener 8 dígitos.`);
      }
    });

    return errors;
  };

  // Manejar la carga del archivo
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];

    if (!uploadedFile) return;

    // Verificar tipo de archivo
    const fileTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv"
    ];

    if (!fileTypes.includes(uploadedFile.type)) {
      setValidationErrors(["Por favor sube un archivo Excel (.xlsx, .xls) o CSV."]);
      return;
    }

    setFile(uploadedFile);
    setValidationErrors([]);
  };

  // Procesar el archivo Excel
  useEffect(() => {
    if (!file) return;

    setIsValidating(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet);

        if (parsedData.length === 0) {
          setValidationErrors(["El archivo está vacío."]);
          setFileData([]);
          setIsValidating(false);
          return;
        }

        // Validar datos
        const errors = validateExcelData(parsedData);
        setValidationErrors(errors);
        setFileData(parsedData);

        // Si no hay errores, pasar a revisión
        if (errors.length === 0) {
          setStep("review");
        }
      } catch (error) {
        setValidationErrors(["Error al procesar el archivo. Por favor verifica el formato."]);
        console.error("Error procesando el archivo:", error);
      } finally {
        setIsValidating(false);
      }
    };

    reader.onerror = () => {
      setValidationErrors(["Error al leer el archivo."]);
      setIsValidating(false);
    };

    reader.readAsArrayBuffer(file);
  }, [file]);

  const checkDNIsInFirebase = async () => {
    setIsCheckingFirebase(true);

    try {
      // Extraer DNIs de participantes y parejas
      const allDNIs = fileData.flatMap(row => {
        const dnis = [row["DNI Participante"]];
        if (row["DNI Pareja"]) {
          dnis.push(row["DNI Pareja"]);
        }
        return dnis;
      }).filter(dni => dni); // Filtra nulos o vacíos

      const uniqueDNIs = [...new Set(allDNIs)];

      const db = getFirestore();
      const usersCollection = collection(db, "users");

      const results = {
        validUsers: [],
        invalidUsers: [],
        userDetails: {} // Inicializa este objeto en los resultados
      };

      // Verifica cada DNI en Firestore
      const checkPromises = uniqueDNIs.map(async (dni) => {
        try {
          const dniStr = dni.toString(); // Asegúrate de que sea string
          const q = query(usersCollection, where("dni", "==", dniStr));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data();
            console.log(userData)
            results.validUsers.push(dniStr);
            // Asegúrate de que userData tenga las propiedades necesarias
            results.userDetails[dniStr] = {
              nombre: userData.firstName || "Nombre no disponible",
              apellido: userData.
                lastName
                || "Apellido no disponible"
              // otros datos relevantes
            };
          } else {
            results.invalidUsers.push(dniStr);
          }
        } catch (err) {
          console.error(`Error al verificar DNI ${dni}:`, err);
          results.invalidUsers.push(dni.toString());
        }
      });

      await Promise.all(checkPromises);

      // Guarda los resultados en el estado
      setValidationResults(results);
      setStep("validate");
    } catch (error) {
      console.error("Error verificando usuarios en Firestore:", error);
      setValidationErrors([
        ...validationErrors,
        `Error al verificar usuarios en Firestore: ${error.message}`
      ]);
    } finally {
      setIsCheckingFirebase(false);
    }
  };

  // Enviar los datos para inscripción
  const handleSubmit = async () => {
    if (validationErrors.length > 0 || fileData.length === 0) return;

    setIsSubmitting(true);

    try {
      // Aquí iría la lógica para enviar los datos al servidor
      // Por ejemplo:
      // const response = await fetch('/api/inscripcion-alumnos', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     eventId: event.id,
      //     organizerId: user.id,
      //     participants: fileData,
      //     validationResults: validationResults
      //   })
      // });

      // Simulamos un delay para mostrar el proceso
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Si todo va bien, mostrar éxito
      setIsSuccess(true);
      setStep("success");
    } catch (error) {
      setValidationErrors(["Error al procesar la inscripción. Intenta nuevamente."]);
      console.error("Error en la inscripción:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Descargar plantilla de Excel
  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([{
      "DNI Participante": "",
      "Academia Participante": "",
      "Modalidad Participante": "",
      "DNI Pareja": "",
      "Academia Pareja": ""
    }]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla");
    XLSX.writeFile(workbook, "plantilla-inscripcion-alumnos.xlsx");
  };

  // Reiniciar el proceso
  const handleReset = () => {
    setFile(null);
    setFileData([]);
    setValidationErrors([]);
    setIsSuccess(false);
    setValidationResults({ validUsers: [], invalidUsers: [], userDetails: {} });
    setStep("upload");
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/90 rounded-lg shadow-sm p-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-blue-600 mb-2">Inscripción de Alumnos</h2>
        <p className="text-lg text-gray-700">
          Inscribe alumnos de tu academia al evento {event.name}
        </p>
      </div>

      {/* Pasos */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center w-full max-w-3xl">
          <div className={`flex flex-col items-center ${step === "upload" ? "text-blue-600" : "text-gray-500"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === "upload" ? "border-blue-600 bg-blue-100" : "border-gray-300"}`}>
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-sm mt-1">Cargar</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step !== "upload" ? "bg-blue-400" : "bg-gray-300"}`}></div>

          <div className={`flex flex-col items-center ${step === "review" ? "text-blue-600" : "text-gray-500"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === "review" ? "border-blue-600 bg-blue-100" : "border-gray-300"}`}>
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm mt-1">Revisar</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step === "review" || step === "validate" || step === "success" ? "bg-blue-400" : "bg-gray-300"}`}></div>

          <div className={`flex flex-col items-center ${step === "validate" ? "text-blue-600" : "text-gray-500"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === "validate" ? "border-blue-600 bg-blue-100" : "border-gray-300"}`}>
              <RefreshCw className="w-5 h-5" />
            </div>
            <span className="text-sm mt-1">Validar</span>
          </div>
          <div className={`flex-1 h-1 mx-2 ${step === "success" ? "bg-blue-400" : "bg-gray-300"}`}></div>

          <div className={`flex flex-col items-center ${step === "success" ? "text-blue-600" : "text-gray-500"}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step === "success" ? "border-blue-600 bg-blue-100" : "border-gray-300"}`}>
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-sm mt-1">Completado</span>
          </div>
        </div>
      </div>

      {step === "upload" && (
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors mb-6"
            >
              <Download className="w-5 h-5 mr-2" />
              Descargar plantilla Excel
            </button>

            <div className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                id="file-upload"
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="mb-1 font-medium">Haz clic para seleccionar o arrastra un archivo</p>
              <p className="text-sm text-gray-500">Excel (.xlsx, .xls) o CSV</p>

              {file && (
                <div className="mt-4 text-left p-2 bg-gray-50 rounded flex items-center">
                  <FileText className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Errores de validación */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="font-semibold text-red-700">Errores encontrados</h3>
              </div>
              <ul className="text-sm text-red-600 space-y-1 pl-4">
                {validationErrors.map((error, index) => (
                  <li key={index} className="list-disc ml-2">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {isValidating && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Validando archivo...</p>
            </div>
          )}
        </div>
      )}

      {step === "review" && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
              <p className="text-blue-700">
                Se encontraron <span className="font-semibold">{fileData.length}</span> alumnos en el archivo.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {expectedColumns.map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fileData.slice(0, 5).map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    {expectedColumns.map((column) => (
                      <td key={column} className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">
                        {row[column] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {fileData.length > 5 && (
            <p className="text-center text-sm text-gray-500">
              Mostrando 5 de {fileData.length} registros.
            </p>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>

            <button
              onClick={checkDNIsInFirebase}
              disabled={isCheckingFirebase}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {isCheckingFirebase ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></span>
                  Verificando...
                </>
              ) : (
                "Validar DNIs"
              )}
            </button>
          </div>
        </div>
      )}

      {step === "validate" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DNIs válidos */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <h3 className="font-semibold text-green-700">
                  DNIs encontrados ({validationResults.validUsers.length})
                </h3>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {validationResults.validUsers.length > 0 ? (
                  <ul className="text-sm space-y-1 pl-2">
                    {validationResults.validUsers.map((dni, index) => (
                      <li key={index} className="text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 inline" />
                        {dni}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No se encontraron DNIs registrados.</p>
                )}
              </div>
            </div>

            {/* DNIs inválidos */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                <h3 className="font-semibold text-red-700">
                  DNIs no encontrados ({validationResults.invalidUsers.length})
                </h3>
              </div>
              <div className="max-h-40 overflow-y-auto">
                {validationResults.invalidUsers.length > 0 ? (
                  <ul className="text-sm space-y-1 pl-2">
                    {validationResults.invalidUsers.map((dni, index) => (
                      <li key={index} className="text-red-600 flex items-center">
                        <XCircle className="w-4 h-4 mr-1 inline" />
                        {dni}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Todos los DNIs están registrados correctamente.</p>
                )}
              </div>
            </div>
          </div>

          {/* Nueva tabla detallada de participantes */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Detalle de participantes</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DNI Participante
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre y Apellido
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academia
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modalidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DNI Pareja
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre Pareja
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academia Pareja
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado Pareja
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fileData.map((row, index) => {
                    // Convierte a string para asegurar comparación correcta
                    const participantDNI = row["DNI Participante"]?.toString();
                    const partnerDNI = row["DNI Pareja"]?.toString();

                    // Comprueba si los DNIs están en los arrays de validación
                    const isParticipantValid = participantDNI && validationResults.validUsers.includes(participantDNI);
                    const isPartnerValid = partnerDNI && validationResults.validUsers.includes(partnerDNI);

                    // Accede a los detalles de forma segura
                    const participantDetails = validationResults.userDetails && participantDNI
                      ? validationResults.userDetails[participantDNI] || null
                      : null;

                    const partnerDetails = validationResults.userDetails && partnerDNI
                      ? validationResults.userDetails[partnerDNI] || null
                      : null;

                    return (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {participantDNI || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {isParticipantValid && participantDetails
                            ? `${participantDetails.nombre || ""} ${participantDetails.apellido || ""}`
                            : isParticipantValid ? "Usuario encontrado" : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {row["Academia Participante"] || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isParticipantValid
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            }`}>
                            {isParticipantValid
                              ? <CheckCircle className="w-3 h-3 mr-1" />
                              : <XCircle className="w-3 h-3 mr-1" />}
                            {isParticipantValid ? "Encontrado" : "No encontrado"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {row["Modalidad Participante"] || "-"}
                        </td>

                        {/* Datos de la pareja */}
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {partnerDNI || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {isPartnerValid && partnerDetails
                            ? `${partnerDetails.nombre || ""} ${partnerDetails.apellido || ""}`
                            : isPartnerValid ? "Usuario encontrado" : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                          {row["Academia Pareja"] || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {partnerDNI ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPartnerValid
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                              }`}>
                              {isPartnerValid
                                ? <CheckCircle className="w-3 h-3 mr-1" />
                                : <XCircle className="w-3 h-3 mr-1" />}
                              {isPartnerValid ? "Encontrado" : "No encontrado"}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {validationResults.invalidUsers.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
              <p className="text-yellow-700">
                <AlertCircle className="w-5 h-5 mr-1 inline" />
                <span className="font-medium">Atención:</span> Hay {validationResults.invalidUsers.length} DNIs que no están registrados en el sistema.
                Estos usuarios deben registrarse antes de ser inscritos al evento.
              </p>
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep("review")}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-200 transition-colors"
            >
              Volver
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || validationResults.invalidUsers.length > 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></span>
                  Procesando...
                </>
              ) : (
                "Confirmar inscripción"
              )}
            </button>
          </div>

          {validationResults.invalidUsers.length > 0 && (
            <p className="text-center text-sm text-red-600 mt-2">
              No se puede continuar con la inscripción porque hay DNIs no registrados.
            </p>
          )}
        </div>
      )}

      {step === "success" && (
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">¡Inscripción completada!</h3>
            <p className="text-gray-600">
              Se han inscrito correctamente {fileData.length} alumnos al evento {event.name}.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Realizar otra inscripción
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventoInscripcionAlumnos;