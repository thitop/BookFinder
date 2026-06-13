-- Create tables for BookFinder

-- 1. Favorites table
CREATE TABLE public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Enable RLS for favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites" 
ON public.favorites FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
ON public.favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.favorites FOR DELETE 
USING (auth.uid() = user_id);

-- 2. Reading List table
CREATE TABLE public.reading_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('want-to-read', 'reading', 'finished')),
    book_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- Enable RLS for reading_list
ALTER TABLE public.reading_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reading list" 
ON public.reading_list FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading list" 
ON public.reading_list FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading list" 
ON public.reading_list FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading list" 
ON public.reading_list FOR DELETE 
USING (auth.uid() = user_id);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reading_list_modtime
    BEFORE UPDATE ON public.reading_list
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
