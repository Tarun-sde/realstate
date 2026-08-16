-- =====================================================
-- Jaa Maa Gauri Properties - Complete Supabase Setup
-- Copy and run everything below in Supabase SQL Editor
-- =====================================================

-- 1. CREATE PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  area_value NUMERIC NOT NULL,
  area_unit TEXT NOT NULL DEFAULT 'sqft',
  price NUMERIC NOT NULL,
  price_display TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold')),
  description TEXT,
  facing TEXT,
  road_width TEXT,
  featured BOOLEAN DEFAULT false,
  lat NUMERIC,
  lng NUMERIC,
  owner_contact TEXT,
  images TEXT[] DEFAULT ARRAY['/land1.png'],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  property_id TEXT,
  property_title TEXT,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can read properties" ON public.properties;
DROP POLICY IF EXISTS "Allow insert properties" ON public.properties;
DROP POLICY IF EXISTS "Allow update properties" ON public.properties;
DROP POLICY IF EXISTS "Allow delete properties" ON public.properties;

DROP POLICY IF EXISTS "Public can read leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Allow delete leads" ON public.leads;

-- PROPERTIES POLICIES
CREATE POLICY "Public can read properties"
  ON public.properties FOR SELECT
  USING (true);

CREATE POLICY "Allow insert properties"
  ON public.properties FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update properties"
  ON public.properties FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete properties"
  ON public.properties FOR DELETE
  USING (true);

-- LEADS POLICIES
CREATE POLICY "Anyone can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can read leads"
  ON public.leads FOR SELECT
  USING (true);

CREATE POLICY "Allow delete leads"
  ON public.leads FOR DELETE
  USING (true);

-- 4. STORAGE BUCKET FOR PROPERTY IMAGES
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policies
DROP POLICY IF EXISTS "Public Access to Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload to Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update Property Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete Property Images" ON storage.objects;

CREATE POLICY "Public Access to Property Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Allow Upload to Property Images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "Allow Update Property Images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'property-images');

CREATE POLICY "Allow Delete Property Images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-images');

-- 5. SEED INITIAL PROPERTIES
INSERT INTO public.properties (title, location, area_value, area_unit, price, price_display, status, description, facing, road_width, featured, lat, lng, owner_contact, images) VALUES
(
  'Prime Residential Plot – Boring Road',
  'Boring Road, Patna',
  2400, 'sqft', 4800000, '₹48 Lakh', 'available',
  'A premium corner residential plot located on the bustling Boring Road, Patna. This well-demarcated plot offers excellent road frontage, complete legal clearances, and close proximity to top schools, hospitals, and shopping complexes. Ideal for constructing a dream home or multi-storey residential building. RERA compliant. Registry and mutation done.',
  'East', '30 feet', true, 25.6093, 85.1376, '+91 62055 11532',
  ARRAY['/land1.png', '/land2.png', '/land3.png']
),
(
  'Commercial Plot – Bailey Road',
  'Bailey Road, Patna',
  4800, 'sqft', 12000000, '₹1.2 Crore', 'available',
  'High-visibility commercial plot located on the prime Bailey Road corridor. This plot is surrounded by established businesses, restaurants, and offices. Perfect for showroom, commercial complex, or hotel. The plot comes with all necessary NOCs and is ready for immediate construction.',
  'West', '60 feet', true, 25.6167, 85.1490, '+91 62055 11532',
  ARRAY['/land2.png', '/land1.png', '/land4.png']
),
(
  'Agricultural Land – Danapur',
  'Danapur, Patna',
  2.5, 'acre', 6500000, '₹65 Lakh', 'sold',
  'Fertile agricultural land near Danapur with perennial water supply and easy access road. Suitable for farming, horticulture, or future residential township development.',
  'North', '20 feet', false, 25.6285, 85.0498, '+91 62055 11532',
  ARRAY['/land3.png', '/land5.png', '/land2.png']
),
(
  'Residential Plot – Kankarbagh',
  'Kankarbagh, Patna',
  1800, 'sqft', 3600000, '₹36 Lakh', 'available',
  'Well-located residential plot in Kankarbagh Colony, one of Patna''s most established residential neighborhoods. The plot is in a gated layout with 24/7 security, wide internal roads, underground drainage, and electricity connections.',
  'South', '24 feet', true, 25.5941, 85.1525, '+91 62055 11532',
  ARRAY['/land4.png', '/land1.png', '/land5.png']
),
(
  'Large Land Parcel – Phulwari Sharif',
  'Phulwari Sharif, Patna',
  5, 'acre', 9500000, '₹95 Lakh', 'available',
  'Massive land parcel in the rapidly developing Phulwari Sharif area. Excellent for real estate development, warehousing, educational institution, or industrial use. Land is flat and fully leveled. State highway frontage of over 200 feet.',
  'East', 'State Highway', false, 25.5630, 85.0891, '+91 62055 11532',
  ARRAY['/land5.png', '/land3.png', '/land4.png']
),
(
  'Plot in Township – Saguna More',
  'Saguna More, Patna',
  3200, 'sqft', 7200000, '₹72 Lakh', 'available',
  'Premium plotted development in the emerging Saguna More township area. This plot is inside a well-planned layout with rainwater harvesting, landscaped parks, jogging track, and modern amenities. Close to NH-30 and upcoming AIIMS Patna extension.',
  'North-East', '40 feet', true, 25.5820, 85.0610, '+91 62055 11532',
  ARRAY['/land1.png', '/land4.png', '/land2.png']
);
