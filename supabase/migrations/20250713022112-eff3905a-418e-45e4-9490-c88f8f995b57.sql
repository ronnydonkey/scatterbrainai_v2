-- Fix storage policies for thought-attachments bucket
CREATE POLICY "Users can upload their own voice memos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'thought-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own voice memos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'thought-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own voice memos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'thought-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own voice memos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'thought-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);