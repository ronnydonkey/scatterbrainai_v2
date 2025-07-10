-- Create storage bucket for thought attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('thought-attachments', 'thought-attachments', true);

-- Create policies for thought attachments storage
CREATE POLICY "Users can upload their own thought attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'thought-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own thought attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'thought-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own thought attachments" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'thought-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own thought attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'thought-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add attachments column to thoughts table
ALTER TABLE public.thoughts 
ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;

-- Add comment for the new column
COMMENT ON COLUMN public.thoughts.attachments IS 'Array of file attachments with metadata: [{name, path, type, size, uploaded_at}]';