-- ============================================================
-- Storage bucket + RLS policies for client-documents
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Ensure the bucket exists (skip if already created via Dashboard)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-documents',
  'client-documents',
  false,
  52428800,  -- 50 MB
  ARRAY['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg','image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload files to client-documents
CREATE POLICY "Authenticated users can upload to client-documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-documents');

-- 3. Allow authenticated users to read files from client-documents
CREATE POLICY "Authenticated users can read client-documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'client-documents');

-- 4. Allow authenticated users to update files in client-documents
CREATE POLICY "Authenticated users can update client-documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'client-documents');

-- 5. Allow authenticated users to delete files from client-documents
CREATE POLICY "Authenticated users can delete from client-documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'client-documents');
