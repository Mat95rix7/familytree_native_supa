export function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

export function getImageFormData(photo: { uri: string; type?: string; name?: string } | null): FormData | null {
  if (!photo?.uri) return null;

  try {
    const formData = new FormData();

    if (photo.uri.startsWith('data:')) {
      // Cas 1: Data URI (base64)
      const match = photo.uri.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
      const mimeType = match ? match[1] : 'image/jpeg';
      const extension = mimeType.split('/')[1] || 'jpg';
      const fileName = `photo.${extension}`;
      
      const blob = dataURItoBlob(photo.uri);
      formData.append('photo', blob, fileName);
    } else {
      // Cas 2: URI de fichier local (expo-image-picker)
      // Format spécifique requis pour React Native
      const fileName = photo.name || photo.uri.split('/').pop() || 'photo.jpg';
      const fileType = photo.type || 'image/jpeg';
      
      // Format correct pour React Native FormData
      formData.append('photo', {
        uri: photo.uri,
        name: fileName,
        type: fileType,
      } as any);
    }

    return formData;
  } catch (error) {
    console.error('Erreur lors de la préparation de l\'image:', error);
    return null;
  }
}