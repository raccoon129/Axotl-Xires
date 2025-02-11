// Esta interfaz define la estructura de respuesta que esperamos del servidor
// para todas las operaciones de actualización del usuario
interface UserUpdateResponse {
  mensaje: string;
  datos?: any;
}

// Servicio centralizado para manejar todas las operaciones relacionadas con usuarios
export const userService = {
  // Actualiza la información básica del usuario (nombre, nombramiento, correo)
  // Esta función requiere un token válido en localStorage
  async updateBasicInfo(userId: string, data: any): Promise<UserUpdateResponse> {
    const token = localStorage.getItem('token');
    // Realiza la petición PUT al endpoint correspondiente
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/actualizacion/${userId}/info-basica`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Incluye el token en el header
        },
        body: JSON.stringify(data)
      }
    );

    // Manejo de errores y respuesta
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.mensaje || 'Error al actualizar información básica');
    }
    return responseData;
  },

  // Actualiza la foto de perfil del usuario
  // Acepta un archivo File y lo envía como FormData
  async updateProfilePhoto(userId: string, photoFile: File): Promise<UserUpdateResponse> {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('foto_perfil', photoFile);

    // Realiza la petición PUT con el archivo
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/actualizacion/${userId}/foto`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData // FormData para envío de archivos
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al actualizar foto de perfil');
    }
    return data;
  },

  // Actualiza la contraseña del usuario
  // Requiere la contraseña actual y la nueva contraseña
  async updatePassword(userId: string, data: any): Promise<UserUpdateResponse> {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/actualizacion/${userId}/password`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      }
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.mensaje || 'Error al actualizar contraseña');
    }
    return responseData;
  }
};
