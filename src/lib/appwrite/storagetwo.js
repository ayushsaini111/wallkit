export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/wallpaperupload/uploadCloudinary', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Cloudinary upload failed');

  // Returns object like { id, url }
  return { id: data.id, url: data.url };
};
