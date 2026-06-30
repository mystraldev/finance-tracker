-- Defence in depth: ensure a transaction's account/category and a savings
-- goal's account belong to the same user as the row.
--
-- RLS only checks `user_id`, and foreign-key checks run as the table owner
-- (bypassing RLS on the referenced table), so without this a user could insert
-- a row referencing another user's account or category.

create or replace function public.check_transaction_refs()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.accounts a where a.id = new.account_id and a.user_id = new.user_id
  ) then
    raise exception 'account % does not belong to user %', new.account_id, new.user_id;
  end if;
  if not exists (
    select 1 from public.categories c where c.id = new.category_id and c.user_id = new.user_id
  ) then
    raise exception 'category % does not belong to user %', new.category_id, new.user_id;
  end if;
  return new;
end;
$$;

create trigger transactions_check_refs
  before insert or update on public.transactions
  for each row execute function public.check_transaction_refs();

create or replace function public.check_savings_goal_refs()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.account_id is not null and not exists (
    select 1 from public.accounts a where a.id = new.account_id and a.user_id = new.user_id
  ) then
    raise exception 'account % does not belong to user %', new.account_id, new.user_id;
  end if;
  return new;
end;
$$;

create trigger savings_goals_check_refs
  before insert or update on public.savings_goals
  for each row execute function public.check_savings_goal_refs();
