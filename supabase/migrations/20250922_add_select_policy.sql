-- Add SELECT policy for users to read their own profiles
CREATE POLICY "Users can read own profile" ON "public"."users"
    FOR SELECT
    USING (auth.uid() = id);

-- This allows users to read their own profile records