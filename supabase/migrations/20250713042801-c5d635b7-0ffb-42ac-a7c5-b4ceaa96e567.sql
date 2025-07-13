-- Clean up duplicate storage policies and recreate them properly
DROP POLICY IF EXISTS "Users can upload their own voice memos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own voice memos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own voice memos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own voice memos" ON storage.objects;

-- Ensure the thought-attachments bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('thought-attachments', 'thought-attachments', true)
ON CONFLICT (id) DO UPDATE SET 
  public = true;

-- Create cleaner storage policies for thought attachments (includes voice memos)
DROP POLICY IF EXISTS "Users can upload their own thought attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own thought attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own thought attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own thought attachments" ON storage.objects;

-- Recreate with simpler, more permissive policies
CREATE POLICY "Enable upload for authenticated users own files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'thought-attachments' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Enable read for authenticated users own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'thought-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Enable update for authenticated users own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'thought-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Enable delete for authenticated users own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'thought-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);