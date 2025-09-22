-- Add INSERT policy for users to create their own profiles
CREATE POLICY "Users can insert own profile" ON "public"."users"
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Add UPDATE policy for users to update their own profiles
CREATE POLICY "Users can update own profile" ON "public"."users"
    FOR UPDATE
    USING (auth.uid() = id);