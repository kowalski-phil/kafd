import { supabase } from './supabase'

export async function uploadRecipePhoto(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('recipe-photos')
    .upload(fileName, file, { contentType: file.type })
  if (error) throw error

  const { data } = supabase.storage
    .from('recipe-photos')
    .getPublicUrl(fileName)
  return data.publicUrl
}
