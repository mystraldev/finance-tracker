-- Mark which categories count as real income (salary) for the savings rate.
-- Reimbursements (Bizum, shared rent, ...) stay in other categories and are not
-- counted as income.

alter table public.categories
  add column is_income boolean not null default false;
