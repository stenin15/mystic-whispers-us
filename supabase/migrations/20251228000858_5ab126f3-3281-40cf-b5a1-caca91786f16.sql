-- Create table for palm reading results
CREATE TABLE public.palm_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  age TEXT,
  emotional_state TEXT,
  main_concern TEXT,
  energy_type JSONB,
  strengths JSONB,
  blocks JSONB,
  spiritual_message TEXT,
  quiz_answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.palm_readings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert readings (public form)
CREATE POLICY "Anyone can insert palm readings" 
ON public.palm_readings 
FOR INSERT 
WITH CHECK (true);

-- Allow reading own data by email (for future use)
CREATE POLICY "Anyone can read palm readings" 
ON public.palm_readings 
FOR SELECT 
USING (true);

-- Create index for faster email lookups
CREATE INDEX idx_palm_readings_email ON public.palm_readings(email);