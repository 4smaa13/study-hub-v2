const CLOUD_NAME = 'ab5mm1qw'
const UPLOAD_PRESET = 'chnadevx'

/**
 * Uploads a file to Cloudinary using an unsigned upload preset.
 * Returns the secure (https) URL of the uploaded file on success.
 * Throws an Error with a user-friendly message on failure.
 */
export async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      body: formData,
    })
  } catch (err) {
    throw new Error('Network error while uploading. Check your connection.')
  }

  if (!response.ok) {
    let message = 'Upload failed. Please try again.'
    try {
      const data = await response.json()
      if (data?.error?.message) message = data.error.message
    } catch {
      // response wasn't JSON, keep default message
    }
    throw new Error(message)
  }

  const data = await response.json()
  return {
    url: data.secure_url,
    format: data.format,
    resourceType: data.resource_type,
    bytes: data.bytes,
  }
}