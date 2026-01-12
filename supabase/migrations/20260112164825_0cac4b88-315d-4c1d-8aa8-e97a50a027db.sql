-- Allow safe profile creation + first-admin bootstrap

-- 1) Allow users to insert ONLY their own profile (never as admin)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can insert their own profile'
  ) THEN
    EXECUTE $pol$
      CREATE POLICY "Users can insert their own profile"
      ON public.profiles
      FOR INSERT
      WITH CHECK (
        auth.uid() = user_id
        AND COALESCE(is_admin, false) = false
      )
    $pol$;
  END IF;
END $$;

-- 2) Helper: is current user admin? (runs with definer privileges)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND is_admin = true
  );
$$;

-- 3) Prevent non-admins from flipping is_admin on their own profile
CREATE OR REPLACE FUNCTION public.profiles_enforce_is_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    IF NOT public.is_current_user_admin() THEN
      NEW.is_admin := OLD.is_admin;
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_enforce_is_admin ON public.profiles;
CREATE TRIGGER trg_profiles_enforce_is_admin
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.profiles_enforce_is_admin();

-- 4) Bootstrap: first authenticated user can become admin (only if no admins exist yet)
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE is_admin = true) THEN
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()) THEN
    UPDATE public.profiles
    SET is_admin = true,
        email = COALESCE(email, p_email),
        updated_at = now()
    WHERE user_id = auth.uid();
  ELSE
    INSERT INTO public.profiles(user_id, email, is_admin)
    VALUES (auth.uid(), p_email, true);
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin(text) TO authenticated;
