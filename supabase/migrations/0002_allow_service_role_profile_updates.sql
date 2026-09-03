-- The review-application edge function updates membership_status with the
-- service role key. Service role requests have no auth.uid(), so the original
-- trigger treated them as non-owners and silently reverted the status change.
-- Recognize service role requests and let them through; everyone else keeps
-- the same protection.
create or replace function public.protect_profile_fields() returns trigger
language plpgsql security definer set search_path = public as
$$
begin
  if not is_owner() and coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    if tg_op = 'INSERT' then
      new.membership_status := 'pending';
      new.role := 'member';
    else
      new.membership_status := old.membership_status;
      new.role := old.role;
    end if;
  end if;
  return new;
end
$$;
