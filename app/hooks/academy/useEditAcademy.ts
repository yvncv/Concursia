import { useState } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/app/firebase/config';
import { Academy } from '@/app/types/academyType';

export const useEditAcademy = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (
    file: File, 
    academyId: string, 
    imageType: 'profile' | 'cover',
    oldImageUrl?: string
  ): Promise<string> => {
    try {
      // Definir la ruta según la estructura existente en Storage
      const folderName = imageType === 'profile' ? 'profileImages' : 'coverImages';
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const filename = `academies/${folderName}/${academyId}.${fileExtension}`;
      const imageRef = ref(storage, filename);
      
      // Subir nueva imagen (sobrescribirá la anterior automáticamente)
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      console.error(`Error al subir imagen ${imageType}:`, error);
      throw new Error(`Error al subir la imagen ${imageType}`);
    }
  };

  const editAcademy = async (academyId: string, academyData: Partial<Academy>) => {
    setLoading(true);
    setError(null);

    try {
      const academyRef = doc(db, 'academias', academyId); // 👈 Cambiar 'academies' por 'academias'
      
      // Preparar los datos a actualizar
      const updateData: any = {
        ...academyData,
        updatedAt: Timestamp.now()
      };

      // Manejar subida de imágenes si se proporcionaron
      if (academyData.profileImage && academyData.profileImage instanceof File) {
        const profileImageUrl = await uploadImage(
          academyData.profileImage, 
          academyId, 
          'profile',
          typeof academyData.profileImage === 'string' ? academyData.profileImage : undefined
        );
        updateData.profileImage = profileImageUrl;
      }

      if (academyData.coverImage && academyData.coverImage instanceof File) {
        const coverImageUrl = await uploadImage(
          academyData.coverImage, 
          academyId, 
          'cover',
          typeof academyData.coverImage === 'string' ? academyData.coverImage : undefined
        );
        updateData.coverImage = coverImageUrl;
      }

      // Actualizar el documento en Firestore
      await updateDoc(academyRef, updateData);

      console.log('Academia actualizada exitosamente');
    } catch (err: any) {
      console.error('Error al actualizar la academia:', err);
      setError(err.message || 'Error al actualizar la academia');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAcademyField = async (
    academyId: string, 
    fieldName: string, 
    fieldValue: any
  ) => {
    setLoading(true);
    setError(null);

    try {
      const academyRef = doc(db, 'academias', academyId); // 👈 Cambiar aquí también
      
      await updateDoc(academyRef, {
        [fieldName]: fieldValue,
        updatedAt: Timestamp.now()
      });

      console.log(`Campo ${fieldName} actualizado exitosamente`);
    } catch (err: any) {
      console.error(`Error al actualizar el campo ${fieldName}:`, err);
      setError(err.message || `Error al actualizar ${fieldName}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAcademyImages = async (
    academyId: string,
    profileImage?: File,
    coverImage?: File,
    currentProfileUrl?: string,
    currentCoverUrl?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const academyRef = doc(db, 'academias', academyId); // 👈 Cambiar aquí también
      const updateData: any = {
        updatedAt: Timestamp.now()
      };

      // Actualizar imagen de perfil si se proporciona
      if (profileImage) {
        const profileImageUrl = await uploadImage(
          profileImage, 
          academyId, 
          'profile', 
          currentProfileUrl
        );
        updateData.profileImage = profileImageUrl;
      }

      // Actualizar imagen de portada si se proporciona
      if (coverImage) {
        const coverImageUrl = await uploadImage(
          coverImage, 
          academyId, 
          'cover', 
          currentCoverUrl
        );
        updateData.coverImage = coverImageUrl;
      }

      await updateDoc(academyRef, updateData);
      
      console.log('Imágenes de la academia actualizadas exitosamente');
    } catch (err: any) {
      console.error('Error al actualizar las imágenes:', err);
      setError(err.message || 'Error al actualizar las imágenes');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateContactInfo = async (
    academyId: string,
    contactData: {
      email?: string | string[];
      phoneNumber?: string | string[];
      website?: string;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const academyRef = doc(db, 'academias', academyId); // 👈 Cambiar aquí también
      
      await updateDoc(academyRef, {
        ...contactData,
        updatedAt: Timestamp.now()
      });

      console.log('Información de contacto actualizada exitosamente');
    } catch (err: any) {
      console.error('Error al actualizar la información de contacto:', err);
      setError(err.message || 'Error al actualizar la información de contacto');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSocialMedia = async (
    academyId: string,
    socialMediaData: {
      facebook?: string;
      instagram?: string;
      tiktok?: string;
      youtube?: string;
      whatsapp?: string;
      twitter?: string;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const academyRef = doc(db, 'academias', academyId); // 👈 Cambiar aquí también
      
      await updateDoc(academyRef, {
        socialMedia: socialMediaData,
        updatedAt: Timestamp.now()
      });

      console.log('Redes sociales actualizadas exitosamente');
    } catch (err: any) {
      console.error('Error al actualizar las redes sociales:', err);
      setError(err.message || 'Error al actualizar las redes sociales');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (
    academyId: string,
    locationData: {
      street: string;
      district: string;
      province: string;
      department: string;
      placeName: string;
      coordinates: {
        latitude: string;
        longitude: string;
      };
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const academyRef = doc(db, 'academias', academyId); // 👈 Cambiar aquí también
      
      await updateDoc(academyRef, {
        location: locationData,
        updatedAt: Timestamp.now()
      });

      console.log('Ubicación actualizada exitosamente');
    } catch (err: any) {
      console.error('Error al actualizar la ubicación:', err);
      setError(err.message || 'Error al actualizar la ubicación');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    editAcademy,
    updateAcademyField,
    updateAcademyImages,
    updateContactInfo,
    updateSocialMedia,
    updateLocation,
    loading,
    error
  };
};