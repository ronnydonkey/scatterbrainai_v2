-- Create table for storing detailed reports
CREATE TABLE public.detailed_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  insight_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  report_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.detailed_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own detailed reports" 
ON public.detailed_reports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own detailed reports" 
ON public.detailed_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own detailed reports" 
ON public.detailed_reports 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_detailed_reports_updated_at
BEFORE UPDATE ON public.detailed_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint to organization
ALTER TABLE public.detailed_reports 
ADD CONSTRAINT detailed_reports_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id);