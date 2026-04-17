-- Force schema cache reload
COMMENT ON TABLE public.opportunities IS 'Opportunity Intelligence Table';
NOTIFY pgrst, 'reload schema';
