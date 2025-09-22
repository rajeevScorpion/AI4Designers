-- First, check if policies exist and drop them if they do
DROP POLICY IF EXISTS "Users can read own profile" ON "public"."users";
DROP POLICY IF EXISTS "Users can insert own profile" ON "public"."users";
DROP POLICY IF EXISTS "Users can update own profile" ON "public"."users";

-- Then create the policies
CREATE POLICY "Users can read own profile" ON "public"."users"
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON "public"."users"
    FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON "public"."users"
    FOR UPDATE
    USING (auth.uid() = id);