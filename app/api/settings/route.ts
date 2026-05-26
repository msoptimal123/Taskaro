import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// Fields allowed to be set/read (excludes id, user_id, created_at, gmail_* fields)
type SettingsPayload = {
  naziv?: string | null;
  naslov_ulica?: string | null;
  naslov_posta?: string | null;
  davcna_stevilka?: string | null;
  maticna_stevilka?: string | null;
  telefon?: string | null;
  email?: string | null;
  spletna_stran?: string | null;
  iban?: string | null;
  bic_swift?: string | null;
  banka?: string | null;
  logo_path?: string | null;
  privzeti_ddv?: number | null;
  privzeta_veljavnost_dni?: number | null;
  privzeta_opomba_zacetna?: string | null;
  privzeta_opomba_koncna?: string | null;
};

export async function GET() {
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('company_settings')
    .select(
      'naziv, naslov_ulica, naslov_posta, davcna_stevilka, maticna_stevilka, telefon, email, spletna_stran, iban, bic_swift, banka, logo_path, privzeti_ddv, privzeta_veljavnost_dni, privzeta_opomba_zacetna, privzeta_opomba_koncna, gmail_connected_email'
    )
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? {} });
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: SettingsPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only pick allowed fields
  const allowed: (keyof SettingsPayload)[] = [
    'naziv',
    'naslov_ulica',
    'naslov_posta',
    'davcna_stevilka',
    'maticna_stevilka',
    'telefon',
    'email',
    'spletna_stran',
    'iban',
    'bic_swift',
    'banka',
    'logo_path',
    'privzeti_ddv',
    'privzeta_veljavnost_dni',
    'privzeta_opomba_zacetna',
    'privzeta_opomba_koncna',
  ];

  const payload: Record<string, unknown> = { user_id: user.id, updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) {
      payload[key] = body[key];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('company_settings')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
