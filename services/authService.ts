/**
 * Servicio para manejar la autenticación y recuperación de contraseñas
 */

/**
 * Solicita un correo de recuperación de contraseña
 * @param correo - Dirección de correo electrónico del usuario
 * @returns Objeto con estado y mensaje de la operación
 */
export const solicitarRecuperacion = async (correo: string) => {
  try {
    const respuesta = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/recuperacion/solicitar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo })
      }
    );

    return await respuesta.json();
  } catch (error) {
    console.error('Error al solicitar recuperación:', error);
    return {
      estado: 'error',
      mensaje: 'Ocurrió un problema al enviar la solicitud. Intente nuevamente.'
    };
  }
};

/**
 * Verifica si un token de recuperación es válido
 * @param token - Token de recuperación recibido por correo
 * @returns Objeto con estado y mensaje de la operación
 */
export const verificarTokenRecuperacion = async (token: string) => {
  try {
    const respuesta = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/recuperacion/verificar-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      }
    );

    return await respuesta.json();
  } catch (error) {
    console.error('Error al verificar token:', error);
    return {
      estado: 'error',
      mensaje: 'Ocurrió un problema al verificar el token. Intente nuevamente.'
    };
  }
};

/**
 * Restablece la contraseña del usuario usando un token válido
 * @param token - Token de recuperación recibido por correo
 * @param nuevaContrasena - Nueva contraseña del usuario
 * @param confirmarContrasena - Confirmación de la nueva contraseña
 * @returns Objeto con estado y mensaje de la operación
 */
export const restablecerContrasena = async (
  token: string,
  nuevaContrasena: string,
  confirmarContrasena: string
) => {
  try {
    const respuesta = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/recuperacion/restablecer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          nuevaContrasena,
          confirmarContrasena
        })
      }
    );

    return await respuesta.json();
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return {
      estado: 'error',
      mensaje: 'Ocurrió un problema al restablecer su contraseña. Intente nuevamente.'
    };
  }
};
