import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

type PostavkaInput = {
  vrstni_red: number;
  naziv: string;
  opis?: string | null;
  enota?: string | null;
  kolicina: number;
  cena_na_enoto: number;
  skupaj: number;
};

type CreatePonudbaBody = {
  client_id: string | null;
  project_id?: string | null;
  naslov?: string | null;
  opomba_zacetna?: string | null;
  opomba_koncna?: string | null;
  ddv_stopnja?: number;
  veljavna_do?: string | null;
  postavke: PostavkaInput[];
};

export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as CreatePonudbaBody;

  if (!body.client_id) {
    return NextResponse.json({ error: 'Stranka je obvezna' }, { status: 400 });
  }

  // Get company settings for defaults
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: settings } = await (supabase as any)
    .from('company_settings')
    .select('privzeti_ddv, privzeta_veljavnost_dni, privzeta_opomba_zacetna, privzeta_opomba_koncna')
    .eq('user_id', user.id)
    .maybeSingle();

  // Generate quote number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stevilkaData } = await (supabase as any).rpc('generate_ponudba_stevilka', { p_user_id: user.id });
  const stevilka = stevilkaData as string ?? `${new Date().getFullYear()}-001`;

  // Compute veljavna_do if not provided
  const veljavnostDni = settings?.privzeta_veljavnost_dni ?? 30;
  const veljavnaDo = body.veljavna_do ?? (() => {
    const d = new Date();
    d.setDate(d.getDate() + veljavnostDni);
    return d.toISOString().split('T')[0];
  })();

  const ddvStopnja = body.ddv_stopnja ?? settings?.privzeti_ddv ?? 22;

  // Calculate totals
  const skupajBrezDdv = body.postavke.reduce((s, p) => s + p.skupaj, 0);
  const ddvZnesek = skupajBrezDdv * (ddvStopnja / 100);
  const skupajZDdv = skupajBrezDdv + ddvZnesek;

  // Insert ponudba
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: ponudba, error: ponudbaErr } = await (supabase as any)
    .from('ponudbe')
    .insert({
      user_id: user.id,
      client_id: body.client_id,
      project_id: body.project_id ?? null,
      stevilka,
      naslov: body.naslov ?? null,
      opomba_zacetna: body.opomba_zacetna ?? settings?.privzeta_opomba_zacetna ?? null,
      opomba_koncna: body.opomba_koncna ?? settings?.privzeta_opomba_koncna ?? null,
      ddv_stopnja: ddvStopnja,
      veljavna_do: veljavnaDo,
      skupaj_brez_ddv: skupajBrezDdv,
      ddv_znesek: ddvZnesek,
      skupaj_z_ddv: skupajZDdv,
      status: 'osnutek',
    })
    .select('id')
    .single();

  if (ponudbaErr) return NextResponse.json({ error: ponudbaErr.message }, { status: 500 });

  // Insert postavke
  if (body.postavke.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: postavkeErr } = await (supabase as any)
      .from('ponudba_postavke')
      .insert(body.postavke.map(p => ({ ...p, ponudba_id: ponudba.id })));

    if (postavkeErr) return NextResponse.json({ error: postavkeErr.message }, { status: 500 });
  }

  return NextResponse.json({ id: ponudba.id });
}
