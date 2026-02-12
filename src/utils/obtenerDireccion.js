/**
 * Obtiene una dirección aproximada (Ciudad, Sector) a partir de coordenadas
 * usando la API gratuita de BigDataCloud.
 * No requiere API Key para uso básico desde el navegador.
 */
export const obtenerDireccionBDC = async (lat, lng) => {
  if (!lat || !lng) return "Sin GPS";

  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error API");

    const data = await response.json();

    // La API devuelve varios campos, intentamos armar algo legible:
    // locality: Suele ser el sector o ciudad pequeña
    // city: Ciudad principal
    // principalSubdivision: Estado/Provincia

    const partes = [];
    if (data.locality) partes.push(data.locality);
    if (data.city && data.city !== data.locality) partes.push(data.city);
    // Si no hay localidad ni ciudad, usamos la subdivisión
    if (partes.length === 0 && data.principalSubdivision)
      partes.push(data.principalSubdivision);

    return partes.join(", ") || "Ubicación desconocida";
  } catch (error) {
    console.warn("Error obteniendo dirección:", error);
    return "Error de red";
  }
};
